using BBSS.Api.Helper;
using BBSS.Api.Models.AuthenticationModel;
using BBSS.Api.ViewModels;

namespace BBSS.Api.Services.Interfaces
{
    public interface IAuthenticationService
    {
        Task<MethodResult<string>> SignUpAsync(SignupRequest request);
        Task<MethodResult<SignInViewModel>> SigninAsync(LoginRequest request);
        Task<MethodResult<string>> VerifyEmailAsync(string token);
    }
}
