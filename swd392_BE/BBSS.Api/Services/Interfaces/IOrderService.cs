using BBSS.Api.Helper;
using BBSS.Api.Models.OrderModel;
using BBSS.Api.Models.PackageModel;
using BBSS.Api.ViewModels;
using BBSS.Domain.Paginate;

namespace BBSS.Api.Services.Interfaces
{
    public interface IOrderService
    {
        Task<MethodResult<string>> CreateOrderAsync(string email, int? voucherId, OrderCreateRequest request);
        Task<MethodResult<IPaginate<OrderViewModel>>> GetOrdersByUserAsync(int userId, PaginateModel model, decimal? minAmount, decimal? maxAmount);
        Task<MethodResult<IPaginate<OrderViewModel>>> GetAllOrdersAsync(PaginateModel model, decimal? minAmount, decimal? maxAmount);
        Task<MethodResult<string>> CompleteOrderAsync(int userId, int orderId, string role);
        Task<MethodResult<string>> CancelOrderAsync(string role, int userId, int orderId);
        Task<MethodResult<string>> ConfirmOrderAsync(int orderId);
    }
}
