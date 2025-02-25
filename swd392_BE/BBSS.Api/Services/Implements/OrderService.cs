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

        public async Task<MethodResult<string>> CreateOrderAsync(string email, OrderCreateRequest request)
        {
            try
            {
                if (request.BlindBoxs == null || !request.BlindBoxs.Any())
                {
                    return new MethodResult<string>.Failure("vcl", StatusCodes.Status404NotFound);
                }
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

                foreach (var x in request.BlindBoxs)
                {
                    var blindBox = await _uow.GetRepository<BlindBox>().SingleOrDefaultAsync(
                        predicate: p => p.PackageId == x.PackageId && p.Number == x.Number
                    );

                    var orderDetail = new OrderDetail
                    {
                        OrderId = order.OrderId,
                        //Quantity = x.Quantity,
                        BlindBoxId = blindBox.BlindBoxId,
                        UnitPrice = blindBox.Price * (1 - blindBox.Discount / 100)
                    };

                    //order.TotalAmount += orderDetail.UnitPrice * orderDetail.Quantity;

                    await _uow.GetRepository<OrderDetail>().InsertAsync(orderDetail);
                }

                if (request.VoucherId.HasValue)
                {
                    var voucher = await _uow.GetRepository<Voucher>().SingleOrDefaultAsync(
                        predicate: p => p.VoucherId == request.VoucherId
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
                            predicate: p => p.VoucherId == request.VoucherId && p.UserId == user.UserId
                        );
                    if (userVoucher == null)
                    {
                        return new MethodResult<string>.Failure("Out date voucher", StatusCodes.Status404NotFound);
                    }

                    order.TotalAmount = order.TotalAmount - voucher.DiscountAmount;
                }

                _uow.GetRepository<Order>().UpdateAsync(order);
                await CreateOrderStatusAsync(order);
                await _uow.CommitAsync();
                return new MethodResult<string>.Success("Create order successfully");
            }
            catch (Exception e)
            {
                return new MethodResult<string>.Failure(e.ToString(), StatusCodes.Status500InternalServerError);
            }
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

        public async Task<MethodResult<string>> CancelOrderAsync(int userId, int orderId)
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
    }
}
