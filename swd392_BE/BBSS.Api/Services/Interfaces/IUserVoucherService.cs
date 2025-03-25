using BBSS.Api.Helper;
using BBSS.Api.Models.UserVoucherModel;

namespace BBSS.Api.Services.Interfaces
{
    public interface IUserVoucherService
    {
        Task<MethodResult<UserVoucherResponse>> GetUserVoucherByIdAsync(int id);
        Task<MethodResult<List<UserVoucherResponse>>> GetUserVouchersByUserIdAsync(int userId);
        Task<MethodResult<UserVoucherResponse>> AssignVoucherToUserAsync(UserVoucherRequest request);
        Task<MethodResult<string>> RedeemUserVoucherAsync(int id);
        Task<MethodResult<string>> CheckVoucherStatusAsync(int id);
    }

}
