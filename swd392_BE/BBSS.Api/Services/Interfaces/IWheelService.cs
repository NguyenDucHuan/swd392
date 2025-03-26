using BBSS.Api.Helper;
using BBSS.Api.ViewModels;
using BBSS.Domain.Entities;

namespace BBSS.Api.Services.Interfaces
{
    public interface IWheelService
    {
        Task<MethodResult<WheelViewModel>> GetWheelAsync(string packageCode);
        Task<MethodResult<IEnumerable<int>>> PlayWheelAsync(string email, string packageCode, int times, decimal amount);
    }
}
