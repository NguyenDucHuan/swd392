using BBSS.Api.Helper;
using BBSS.Api.Models.PackageModel;
using BBSS.Api.ViewModels;
using BBSS.Domain.Paginate;

namespace BBSS.Api.Services.Interfaces
{
    public interface IInventoryService
    {
        Task<MethodResult<IPaginate<InventoryViewModel>>> GetInventoriesAsync(int userId, PaginateModel model, decimal? minAmount, decimal? maxAmount);
        Task<MethodResult<InventoryViewModel>> GetInventoryAsync(int inventoryId);
    }
}
