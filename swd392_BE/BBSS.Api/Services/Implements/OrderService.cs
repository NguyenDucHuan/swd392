using AutoMapper;
using BBSS.Api.Constants;
using BBSS.Api.Helper;
using BBSS.Api.Models.OrderModel;
using BBSS.Api.Services.Interfaces;
using BBSS.Api.ViewModels;
using BBSS.Domain.Entities;
using BBSS.Domain.Paginate;
using BBSS.Repository.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BBSS.Api.Services.Implements
{
    public class OrderService : IOrderService
    {
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;

        public OrderService(IUnitOfWork uow, IMapper mapper)
        {
            _uow = uow;
            _mapper = mapper;
        }

        public async Task<MethodResult<string>> CreateOrderAsync(string email, int? voucherId, OrderCreateRequest request)
        {
            await _uow.BeginTransactionAsync();
            try
            {            
                var user = await _uow.GetRepository<User>().SingleOrDefaultAsync(
                    predicate: p => p.Email == email
                );
                if (user == null)
                {
                    return new MethodResult<string>.Failure("User not found", StatusCodes.Status404NotFound);
                }

                var order = _mapper.Map<Order>(request);
                order.UserId = user.UserId;

                await _uow.GetRepository<Order>().InsertAsync(order);
                await _uow.CommitAsync();

                foreach (var product in request.Products)
                {
                    if (product.Type == "Package")
                    {
                        await HandlePackageProductAsync(product, order);
                        await _uow.CommitAsync();
                    }
                    else if (product.Type == "BlindBox")
                    {
                        await HandleBlindBoxProductAsync(product, order);
                        await _uow.CommitAsync();
                    }
                    else
                    {
                        return new MethodResult<string>.Failure("Invalid type product", StatusCodes.Status400BadRequest);
                    }                    
                }

                if (voucherId.HasValue)
                {
                    var voucher = await _uow.GetRepository<Voucher>().SingleOrDefaultAsync(
                        predicate: p => p.VoucherId == voucherId
                    );
                    if (voucher == null)
                    {
                        return new MethodResult<string>.Failure("Voucher not found", StatusCodes.Status404NotFound);
                    }
                    if (voucher.StartDate > DateTime.Now && voucher.EndDate < DateTime.Now)
                    {
                        return new MethodResult<string>.Failure("Out date voucher", StatusCodes.Status404NotFound);
                    }
                    if (order.TotalAmount < voucher.MinimumPurchase)
                    {
                        return new MethodResult<string>.Failure("Minimum purchase is not enough for voucher", StatusCodes.Status404NotFound);
                    }
                    var userVoucher = await _uow.GetRepository<UserVoucher>().SingleOrDefaultAsync(
                            predicate: p => p.VoucherId == voucherId && p.UserId == user.UserId
                        );
                    if (userVoucher == null)
                    {
                        return new MethodResult<string>.Failure("Out date voucher", StatusCodes.Status404NotFound);
                    }

                    order.VoucherId = voucherId;
                    order.TotalAmount = order.TotalAmount > voucher.DiscountAmount ? order.TotalAmount - voucher.DiscountAmount : 0;
                    await UpdateUserVoucher(userVoucher);
                }

                _uow.GetRepository<Order>().UpdateAsync(order);
                await CreateOrderStatusAsync(order);

                await _uow.CommitAsync();
                await _uow.CommitTransactionAsync();
                return new MethodResult<string>.Success("Create order successfully");
            }
            catch (Exception e)
            {
                await _uow.RollbackTransactionAsync();
                return new MethodResult<string>.Failure(e.ToString(), StatusCodes.Status500InternalServerError);
            }
        }

        private async Task HandlePackageProductAsync(OrderDetailCreateRequest product, Order order)
        {
            var packages = await _uow.GetRepository<Package>().GetListAsync(
                predicate: p => p.PakageCode == product.PakageCode && !p.BlindBoxes.Any(bb => bb.IsSold),
                include: i => i.Include(x => x.BlindBoxes)
            );

            if (!packages.Any())
            {
                throw new Exception("Do not enough pakage");
            }

            var selectedPackages = packages.Take(product.Quantity);
            foreach (var package in selectedPackages)
            {
                decimal packagePrice = 0;

                foreach (var blindBox in package.BlindBoxes)
                {
                    blindBox.IsSold = true;
                    packagePrice += blindBox.Price * (1 - blindBox.Discount / 100);
                }

                _uow.GetRepository<BlindBox>().UpdateRange(package.BlindBoxes);

                var orderDetail = new OrderDetail
                {
                    OrderId = order.OrderId,
                    PackageId = package.PackageId,
                    UnitPrice = packagePrice
                };

                await _uow.GetRepository<OrderDetail>().InsertAsync(orderDetail);
                order.TotalAmount += packagePrice;
            }
        }

        private async Task HandleBlindBoxProductAsync(OrderDetailCreateRequest product, Order order)
        {
            var packageWithAtLeastBB = await _uow.GetRepository<Package>().SingleOrDefaultAsync(
                            include: i => i.Include(x => x.BlindBoxes),
                            predicate: p => p.PakageCode == product.PakageCode && p.BlindBoxes.Any(bb => !bb.IsSold),
                            orderBy: o => o.OrderBy(x => x.BlindBoxes.Count(bb => !bb.IsSold))
                        );


            if (packageWithAtLeastBB == null)
            {
                throw new Exception("Do not enough blind box");
            }

            if (product.Quantity <= packageWithAtLeastBB.BlindBoxes.Count(bb => !bb.IsSold))
            {
                var blindBoxIds = packageWithAtLeastBB.BlindBoxes
                                                                .Where(bb => !bb.IsSold)
                                                                .Take(product.Quantity)
                                                                .Select(bb => bb.BlindBoxId)
                                                                .ToList();

                var blindBoxs = await _uow.GetRepository<BlindBox>().GetListAsync(
                    predicate: bb => blindBoxIds.Contains(bb.BlindBoxId)
                );

                foreach (var blindBox in blindBoxs)
                {
                    blindBox.IsSold = true;

                    var orderDetail = new OrderDetail
                    {
                        OrderId = order.OrderId,
                        BlindBoxId = blindBox.BlindBoxId,
                        UnitPrice = blindBox.Price * (1 - blindBox.Discount / 100)
                    };

                    await _uow.GetRepository<OrderDetail>().InsertAsync(orderDetail);
                    order.TotalAmount += orderDetail.UnitPrice;
                }

                _uow.GetRepository<BlindBox>().UpdateRange(blindBoxs);
            }
            else
            {
                var numOfBBLeft = product.Quantity - packageWithAtLeastBB.BlindBoxes.Count(bb => !bb.IsSold);
                var numOfPackageNext = (numOfBBLeft / 8) + 1;

                foreach (var blindBox in packageWithAtLeastBB.BlindBoxes)
                {
                    blindBox.IsSold = true;

                    var orderDetail = new OrderDetail
                    {
                        OrderId = order.OrderId,
                        BlindBoxId = blindBox.BlindBoxId,
                        UnitPrice = blindBox.Price * (1 - blindBox.Discount / 100)
                    };

                    await _uow.GetRepository<OrderDetail>().InsertAsync(orderDetail);
                    order.TotalAmount += orderDetail.UnitPrice;
                }

                _uow.GetRepository<BlindBox>().UpdateRange(packageWithAtLeastBB.BlindBoxes);                

                if (numOfPackageNext == 1)
                {
                    var package = await _uow.GetRepository<Package>().SingleOrDefaultAsync(
                        include: i => i.Include(x => x.BlindBoxes),
                        predicate: p => p.PakageCode == product.PakageCode &&
                                        !p.BlindBoxes.Any(bb => bb.IsSold)
                    );

                    if (package == null)
                    {
                        throw new Exception("Do not enough blind box");
                    }

                    var blindBoxIds = package.BlindBoxes                                                                
                                                        .Take(numOfBBLeft)
                                                        .Select(bb => bb.BlindBoxId)
                                                        .ToList();

                    var blindBoxs = await _uow.GetRepository<BlindBox>().GetListAsync(
                        predicate: bb => blindBoxIds.Contains(bb.BlindBoxId)
                    );

                    foreach (var blindBox in blindBoxs)
                    {
                        blindBox.IsSold = true;

                        var orderDetail = new OrderDetail
                        {
                            OrderId = order.OrderId,
                            BlindBoxId = blindBox.BlindBoxId,
                            UnitPrice = blindBox.Price * (1 - blindBox.Discount / 100)
                        };

                        await _uow.GetRepository<OrderDetail>().InsertAsync(orderDetail);
                        order.TotalAmount += orderDetail.UnitPrice;
                    }

                    _uow.GetRepository<BlindBox>().UpdateRange(blindBoxs);
                }
                else
                {
                    var list = await _uow.GetRepository<Package>().GetListAsync(
                        include: i => i.Include(x => x.BlindBoxes),
                        predicate: p => p.PakageCode == product.PakageCode &&
                                        !p.BlindBoxes.Any(bb => bb.IsSold)
                    );

                    if (!list.Any())
                    {
                        throw new Exception("Do not enough blind box");
                    }

                    var packageIds = list.Select(p => p.PackageId).Take(numOfPackageNext - 1).ToList();

                    var packagesNext = await _uow.GetRepository<Package>().GetListAsync(
                        include: i => i.Include(x => x.BlindBoxes),
                        predicate: p => packageIds.Contains(p.PackageId)
                    );
                    foreach (var package in packagesNext)
                    {
                        foreach (var blindBox in package.BlindBoxes)
                        {
                            blindBox.IsSold = true;

                            var orderDetail = new OrderDetail
                            {
                                OrderId = order.OrderId,
                                BlindBoxId = blindBox.BlindBoxId,
                                UnitPrice = blindBox.Price * (1 - blindBox.Discount / 100)
                            };

                            await _uow.GetRepository<OrderDetail>().InsertAsync(orderDetail);
                            order.TotalAmount += orderDetail.UnitPrice;
                        }

                        _uow.GetRepository<BlindBox>().UpdateRange(package.BlindBoxes);
                    }

                    var packageLast = await _uow.GetRepository<Package>().SingleOrDefaultAsync(
                        include: i => i.Include(x => x.BlindBoxes),
                        predicate: p => p.PakageCode == product.PakageCode &&
                                        !p.BlindBoxes.Any(bb => bb.IsSold)
                    );

                    if (packageLast == null)
                    {
                        throw new Exception("Do not enough blind box");
                    }

                    var numOfBBInLastPk = numOfBBLeft - ((numOfBBLeft - 1) * 8);

                    var blindBoxs = packageLast.BlindBoxes
                                                          .Take(numOfBBInLastPk)
                                                          .ToList();

                    foreach (var blindBox in blindBoxs)
                    {
                        blindBox.IsSold = true;

                        var orderDetail = new OrderDetail
                        {
                            OrderId = order.OrderId,
                            BlindBoxId = blindBox.BlindBoxId,
                            UnitPrice = blindBox.Price * (1 - blindBox.Discount / 100)
                        };

                        await _uow.GetRepository<OrderDetail>().InsertAsync(orderDetail);
                        order.TotalAmount += orderDetail.UnitPrice;
                    }

                    _uow.GetRepository<BlindBox>().UpdateRange(blindBoxs);
                }
            }
        }

        private async Task UpdateUserVoucher(UserVoucher userVoucher)
        {
            userVoucher.RedeemedDate = DateTime.Now;
            userVoucher.Status = true;
            _uow.GetRepository<UserVoucher>().UpdateAsync(userVoucher);
        }

        private async Task CreateOrderStatusAsync(Order order)
        {
            var orderStatus = new OrderStatus
            {
                OrderId = order.OrderId,
                Status = OrderConstant.ORDER_STATUS_PENDING,
                UpdateTime = DateTime.Now
            };

            await _uow.GetRepository<OrderStatus>().InsertAsync(orderStatus);
        }

        public async Task<MethodResult<IPaginate<OrderViewModel>>> GetOrdersByUserAsync(int userId)
        {
            var result = await _uow.GetRepository<Order>().GetPagingListAsync<OrderViewModel>(
                    selector: s => _mapper.Map<OrderViewModel>(s),
                    predicate: p => p.UserId == userId,
                    include: i => i.Include(x => x.OrderDetails)
                );
            return new MethodResult<IPaginate<OrderViewModel>>.Success(result);
        }

        public async Task<MethodResult<IPaginate<OrderViewModel>>> GetAllOrdersAsync()
        {
            var result = await _uow.GetRepository<Order>().GetPagingListAsync<OrderViewModel>(
                    selector: s => _mapper.Map<OrderViewModel>(s),
                    include: i => i.Include(x => x.OrderDetails)
                );
            return new MethodResult<IPaginate<OrderViewModel>>.Success(result);
        }

        public async Task<MethodResult<string>> CompleteOrderAsync(int userId, int orderId)
        {
            try
            {
                var order = await _uow.GetRepository<Order>().SingleOrDefaultAsync(
                    predicate: p => p.OrderId == orderId
                );
                if (order == null)
                {
                    return new MethodResult<string>.Failure("Order not found", StatusCodes.Status404NotFound);
                }
                if (order.UserId != userId)
                {
                    return new MethodResult<string>.Failure("User do not have this order", StatusCodes.Status404NotFound);
                }

                var orderStatusCurrent = await _uow.GetRepository<OrderStatus>().SingleOrDefaultAsync(
                    predicate: p => p.OrderId == orderId,
                    orderBy: o => o.OrderByDescending(x => x.UpdateTime)
                );
                if (orderStatusCurrent.Status != OrderConstant.ORDER_STATUS_SHIPPING)
                {
                    return new MethodResult<string>.Failure($"Order status is {orderStatusCurrent.Status}", StatusCodes.Status400BadRequest);
                }

                var orderStatus = new OrderStatus
                {
                    OrderId = orderId,
                    UpdateTime = DateTime.Now,
                    Status = OrderConstant.ORDER_STATUS_COMPLETED,
                };

                await _uow.GetRepository<OrderStatus>().InsertAsync(orderStatus);
                await _uow.CommitAsync();

                return new MethodResult<string>.Success("Complete order successfully");
            }
            catch (Exception e)
            {
                return new MethodResult<string>.Failure(e.ToString(), StatusCodes.Status500InternalServerError);
            }
        }

        public async Task<MethodResult<string>> CancelOrderAsync(int orderId)
        {
            try
            {
                var order = await _uow.GetRepository<Order>().SingleOrDefaultAsync(
                    predicate: p => p.OrderId == orderId
                );
                if (order == null)
                {
                    return new MethodResult<string>.Failure("Order not found", StatusCodes.Status404NotFound);
                }
                
                var orderStatusCurrent = await _uow.GetRepository<OrderStatus>().SingleOrDefaultAsync(
                    predicate: p => p.OrderId == orderId,
                    orderBy: o => o.OrderByDescending(x => x.UpdateTime)
                );
                if (orderStatusCurrent.Status != OrderConstant.ORDER_STATUS_PENDING)
                {
                    return new MethodResult<string>.Failure($"Order status is {orderStatusCurrent.Status}", StatusCodes.Status400BadRequest);
                }

                var orderStatus = new OrderStatus
                {
                    OrderId = orderId,
                    UpdateTime = DateTime.Now,
                    Status = OrderConstant.ORDER_STATUS_CANCELED,
                };

                await _uow.GetRepository<OrderStatus>().InsertAsync(orderStatus);
                await _uow.CommitAsync();

                return new MethodResult<string>.Success("Cancel order successfully");
            }
            catch (Exception e)
            {
                return new MethodResult<string>.Failure(e.ToString(), StatusCodes.Status500InternalServerError);
            }
        }

        public async Task<MethodResult<string>> ConfirmOrderAsync(int orderId)
        {
            try
            {
                var order = await _uow.GetRepository<Order>().SingleOrDefaultAsync(
                    predicate: p => p.OrderId == orderId
                );
                if (order == null)
                {
                    return new MethodResult<string>.Failure("Order not found", StatusCodes.Status404NotFound);
                }
               
                var orderStatusCurrent = await _uow.GetRepository<OrderStatus>().SingleOrDefaultAsync(
                    predicate: p => p.OrderId == orderId,
                    orderBy: o => o.OrderByDescending(x => x.UpdateTime)
                );
                if (orderStatusCurrent.Status != OrderConstant.ORDER_STATUS_PAID)
                {
                    return new MethodResult<string>.Failure($"Order status is {orderStatusCurrent.Status}", StatusCodes.Status400BadRequest);
                }

                var orderStatus = new OrderStatus
                {
                    OrderId = orderId,
                    UpdateTime = DateTime.Now,
                    Status = OrderConstant.ORDER_STATUS_SHIPPING,
                };

                await _uow.GetRepository<OrderStatus>().InsertAsync(orderStatus);
                await _uow.CommitAsync();

                return new MethodResult<string>.Success("Confirm order successfully");
            }
            catch (Exception e)
            {
                return new MethodResult<string>.Failure(e.ToString(), StatusCodes.Status500InternalServerError);
            }
        }
    }
}
