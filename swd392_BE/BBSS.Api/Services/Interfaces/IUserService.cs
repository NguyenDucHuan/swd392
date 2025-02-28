using BBSS.Api.Helper;
using BBSS.Api.Models.UserModel;
using BBSS.Api.ViewModels;

namespace BBSS.Api.Services.Interfaces
{
    public interface IUserService
    {
        Task<MethodResult<ProfileViewModel>> GetProfileAsync(string email);
        Task<MethodResult<string>> UpdateProfileAsync(string email, UpdateProfileRequest request);
    }
}
