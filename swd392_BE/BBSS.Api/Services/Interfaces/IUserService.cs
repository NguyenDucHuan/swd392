using BBSS.Api.Helper;
using BBSS.Api.Models.PackageModel;
using BBSS.Api.Models.UserModel;
using BBSS.Api.ViewModels;
using BBSS.Domain.Paginate;

namespace BBSS.Api.Services.Interfaces
{
    public interface IUserService
    {
        Task<MethodResult<ProfileViewModel>> GetProfileAsync(string email);
        Task<MethodResult<string>> UpdateProfileAsync(string email, UpdateProfileRequest request);

        Task<MethodResult<UserResponse>> CreateUserAsync(UserRequest request);
        Task<MethodResult<string>> UpdateUserAsync(int id, UserRequest request);
        Task<MethodResult<string>> UpdateUserStatusAsync(int id, UpdateStatusRequest request);
        Task<MethodResult<IPaginate<UserViewModel>>> GetAllUsersAsync(PaginateModel model);

    }
}
