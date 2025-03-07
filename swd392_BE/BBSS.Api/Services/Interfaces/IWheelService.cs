using BBSS.Api.Helper;
using BBSS.Domain.Entities;

namespace BBSS.Api.Services.Interfaces
{
    public interface IWheelService
    {
        Task<MethodResult<IEnumerable<BlindBox>>> GetWheelAsync();
        Task<MethodResult<string>> PlayWheelAsync(string email);
    }
}
