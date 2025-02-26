using BBSS.Api.Helper;
using BBSS.Api.Models.OrderModel;
using BBSS.Api.ViewModels;
using BBSS.Domain.Paginate;

namespace BBSS.Api.Services.Interfaces
{
    public interface IOrderService
    {
        Task<MethodResult<string>> CreateOrderAsync(string email, int? voucherId, OrderCreateRequest request);
        Task<MethodResult<IPaginate<OrderViewModel>>> GetOrdersByUserAsync(int userId);
        Task<MethodResult<IPaginate<OrderViewModel>>> GetAllOrdersAsync();
        Task<MethodResult<string>> CompleteOrderAsync(int userId, int orderId);
        Task<MethodResult<string>> CancelOrderAsync(int userId, int orderId);
    }
}
