using BBSS.Api.Models.AuthenticationModel;
using BBSS.Api.Routes;
using BBSS.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BBSS.Api.Controllers
{
    public class AuthenticationController : ControllerBase
    {
        private readonly IAuthenticationService _authenticationService;

        public AuthenticationController(IAuthenticationService authenticationService)
        {
            _authenticationService = authenticationService;
        }

        [HttpPost]
        [Route(Router.AtuthenticationRoute.Register)]
        public async Task<IActionResult> Register([FromBody] SignupRequest request)
        {
            var result = await _authenticationService.SignUpAsync(request);
            return result.Match(
                (errorMessage, statusCode) => Problem(detail: errorMessage, statusCode: statusCode),
                Ok
            );
        }

        [HttpPost]
        [Route(Router.AtuthenticationRoute.Login)]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var result = await _authenticationService.SigninAsync(request);
            return result.Match(
                (errorMessage, statusCode) => Problem(detail: errorMessage, statusCode: statusCode),
                Ok
            );
        }

        [HttpPatch]
        [Route(Router.AtuthenticationRoute.VerifyEmail)]
        public async Task<IActionResult> VerifyAccount(string token)
        {
            var result = await _authenticationService.VerifyEmailAsync(token);
            return result.Match(
                (errorMessage, statusCode) => Problem(detail: errorMessage, statusCode: statusCode),
                successMessage => Ok(new { message = successMessage })
            );
        }
    }
}
