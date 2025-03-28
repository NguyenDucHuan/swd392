using BBSS.Api.Helper;
using BBSS.Api.Models.OrderModel;
using BBSS.Api.Models.PackageModel;
using BBSS.Api.ViewModels;
using BBSS.Domain.Entities;
using BBSS.Domain.Paginate;

namespace BBSS.Api.Services.Interfaces
{
    public interface IWheelService
    {
        Task<MethodResult<IPaginate<WheelViewModel>>> GetWheelAsync(PaginateModel model);
        Task<MethodResult<WheelDetailViewModel>> GetWheelDetailAsync(string packageCode);
        Task<MethodResult<IEnumerable<int>>> PlayWheelAsync(string email, string packageCode, int times, decimal amount);
        Task<MethodResult<string>> CreateOrderWheelAsync(int userId, OrderWheelCreateRequest request);
    }
}
