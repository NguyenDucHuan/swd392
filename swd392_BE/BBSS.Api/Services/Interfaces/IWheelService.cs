using BBSS.Api.Helper;
using BBSS.Api.ViewModels;
using BBSS.Domain.Entities;

namespace BBSS.Api.Services.Interfaces
{
    public interface IWheelService
    {
        Task<MethodResult<WheelViewModel>> GetWheelAsync();
        Task<MethodResult<IEnumerable<int>>> PlayWheelAsync(string email, int times, decimal amount);
    }
}
