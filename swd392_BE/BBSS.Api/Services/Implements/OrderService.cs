﻿using AutoMapper;
using BBSS.Api.Constants;
using BBSS.Api.Helper;
using BBSS.Api.Models.OrderModel;
using BBSS.Api.Models.PackageModel;
using BBSS.Api.Services.Interfaces;
using BBSS.Api.ViewModels;
using BBSS.Domain.Entities;
using BBSS.Domain.Paginate;
using BBSS.Repository.Interfaces;
using MailKit.Search;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq.Expressions;
using System.Reflection.Metadata;
using System.Security.Claims;

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
                    if (string.CompareOrdinal(product.Type, "Package") == 0)
                    {
                        await HandlePackageProductAsync(product, order);
                        await _uow.CommitAsync();
                    }
                    else if (string.CompareOrdinal(product.Type, "BlindBox") == 0)
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

        public async Task<MethodResult<IPaginate<OrderViewModel>>> GetOrdersByUserAsync(int userId, PaginateModel model, decimal? minAmount, decimal? maxAmount)
        {
            int page = model.page > 0 ? model.page : 1;
            int size = model.size > 0 ? model.size : 10;
            string search = model.search?.ToLower() ?? string.Empty;
            string filter = model.filter?.ToLower() ?? string.Empty;

            Expression<Func<Order, bool>> predicate = p =>
                p.UserId == userId &&
                (string.IsNullOrEmpty(search) || p.User.Name.ToLower().Contains(search) ||
                                                       p.User.Email.ToLower().Contains(search) ||
                                                       p.Address.ToLower().Contains(search) ||
                                                       p.Phone.ToLower().Contains(search)) &&
                (string.IsNullOrEmpty(filter) || filter.Contains(p.OrderStatuses.OrderByDescending(x => x.UpdateTime).FirstOrDefault().Status.ToLower())) &&
                (minAmount == null || p.TotalAmount >= minAmount) &&
                (maxAmount == null || p.TotalAmount <= maxAmount);

            var result = await _uow.GetRepository<Order>().GetPagingListAsync<OrderViewModel>(
                    selector: s => _mapper.Map<OrderViewModel>(s),
                    predicate: predicate,
                    include: i => i.Include(x => x.OrderDetails)
                                   .Include(x => x.OrderStatuses)
                                   .Include(x => x.User.Transactions)
                                   .Include(x => x.Voucher),
                    orderBy: BuildOrderBy(model.sortBy),
                    page: page,
                    size: size
                );

            return new MethodResult<IPaginate<OrderViewModel>>.Success(result);
        }

        public async Task<MethodResult<IPaginate<OrderViewModel>>> GetAllOrdersAsync(PaginateModel model, decimal? minAmount, decimal? maxAmount)
        {
            int page = model.page > 0 ? model.page : 1;
            int size = model.size > 0 ? model.size : 10;
            string search = model.search?.ToLower() ?? string.Empty;
            string filter = model.filter?.ToLower() ?? string.Empty;

            Expression<Func<Order, bool>> predicate = p =>
                (string.IsNullOrEmpty(search) || p.User.Name.Contains(search) ||
                                                 p.User.Email.Contains(search) ||
                                                 p.Address.Contains(search) ||
                                                 p.Phone.Contains(search)) &&
                (string.IsNullOrEmpty(filter) ||
                filter.Contains(p.OrderStatuses.OrderByDescending(x => x.UpdateTime).FirstOrDefault().Status.ToLower())) &&
                (minAmount == null || p.TotalAmount >= minAmount) &&
                (maxAmount == null || p.TotalAmount <= maxAmount);

            var result = await _uow.GetRepository<Order>().GetPagingListAsync<OrderViewModel>(
                    selector: s => _mapper.Map<OrderViewModel>(s),
                    predicate: predicate,
                    include: i => i.Include(x => x.OrderDetails)
                                   .Include(x => x.OrderStatuses)
                                   .Include(x => x.User.Transactions)
                                   .Include(x => x.Voucher),
                    orderBy: BuildOrderBy(model.sortBy),
                    page: page,
                    size: size
                );
            return new MethodResult<IPaginate<OrderViewModel>>.Success(result);
        }

        private Func<IQueryable<Order>, IOrderedQueryable<Order>> BuildOrderBy(string sortBy)
        {
            if (string.IsNullOrEmpty(sortBy)) return null;

            return sortBy.ToLower() switch
            {
                "amount" => q => q.OrderBy(p => p.TotalAmount),
                "amount_desc" => q => q.OrderByDescending(p => p.TotalAmount),
                "date" => q => q.OrderBy(p => p.OrderDate),
                "date_desc" => q => q.OrderByDescending(p => p.OrderDate),
                _ => q => q.OrderByDescending(p => p.OrderId) // Default sort
            };
        }

        public async Task<MethodResult<string>> CompleteOrderAsync(int userId, int orderId, string role)
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
                if (order.UserId != userId && role == UserConstant.USER_ROLE_USER)
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

        public async Task<MethodResult<string>> CancelOrderAsync(string role, int userId, int orderId)
        {
            try
            {
                var order = await _uow.GetRepository<Order>().SingleOrDefaultAsync(
                    predicate: p => p.OrderId == orderId,
                    include: i => i.Include(x => x.OrderDetails).ThenInclude(x => x.Package).ThenInclude(x => x.BlindBoxes)
                                   .Include(x => x.OrderDetails).ThenInclude(x => x.BlindBox)
                );
                if (order == null)
                {
                    return new MethodResult<string>.Failure("Order not found", StatusCodes.Status404NotFound);
                }

                var orderStatusCurrent = await _uow.GetRepository<OrderStatus>().SingleOrDefaultAsync(
                    predicate: p => p.OrderId == orderId,
                    orderBy: o => o.OrderByDescending(x => x.UpdateTime)
                );

                if (role == Constants.UserConstant.USER_ROLE_USER)
                {
                    if (order.UserId != userId)
                    {
                        return new MethodResult<string>.Failure($"You do not own this order", StatusCodes.Status403Forbidden);
                    }

                    if (orderStatusCurrent.Status != OrderConstant.ORDER_STATUS_PENDING)
                    {
                        return new MethodResult<string>.Failure($"Order status is {orderStatusCurrent.Status}. You can not cancel order", StatusCodes.Status400BadRequest);
                    }
                }
                else
                {
                    if (orderStatusCurrent.Status != OrderConstant.ORDER_STATUS_PENDING && orderStatusCurrent.Status != OrderConstant.ORDER_STATUS_PAID)
                    {
                        return new MethodResult<string>.Failure($"Order status is {orderStatusCurrent.Status}. You can not cancel order", StatusCodes.Status400BadRequest);
                    }

                    if (orderStatusCurrent.Status != OrderConstant.ORDER_STATUS_PAID)
                    {
                        await RefundOrderAsync(order);
                    }
                }

                await HandleCancelOrderAsync(order);
                await _uow.CommitAsync();

                return new MethodResult<string>.Success("Cancel order successfully");
            }
            catch (Exception e)
            {
                return new MethodResult<string>.Failure(e.ToString(), StatusCodes.Status500InternalServerError);
            }
        }

        private async Task RefundOrderAsync(Order order)
        {
            try
            {
                var user = await _uow.GetRepository<User>().SingleOrDefaultAsync(
                    predicate: p => p.UserId == order.UserId
                );
                user.WalletBalance += order.TotalAmount;

                var transaction = new Transaction
                {
                    UserId = user.UserId,
                    Amount = order.TotalAmount,
                    CreateDate = DateTime.Now,
                    Type = TransactionConstant.TRANSACTION_TYPE_REFUND,
                    RelatedId = order.OrderId,
                    Description = $"Refund for order {order.OrderId} with toal amount {order.TotalAmount}"
                };

                _uow.GetRepository<User>().UpdateAsync(user);
                _uow.GetRepository<Transaction>().UpdateAsync(transaction);
            }
            catch (Exception)
            {
                throw;
            }

        }

        private async Task HandleCancelOrderAsync(Order order)
        {
            try
            {
                foreach (var detail in order.OrderDetails)
                {
                    if (detail.BlindBoxId != null)
                    {
                        detail.BlindBox.IsSold = false;
                        _uow.GetRepository<BlindBox>().UpdateAsync(detail.BlindBox);
                    }
                    else
                    {
                        foreach (var blindBox in detail.Package.BlindBoxes)
                        {
                            blindBox.IsSold = false;
                        }
                        _uow.GetRepository<BlindBox>().UpdateRange(detail.Package.BlindBoxes);
                    }
                }

                var orderStatus = new OrderStatus
                {
                    OrderId = order.OrderId,
                    UpdateTime = DateTime.Now,
                    Status = OrderConstant.ORDER_STATUS_CANCELED,
                };

                await _uow.GetRepository<OrderStatus>().InsertAsync(orderStatus);
            }
            catch (Exception)
            {
                throw;
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
