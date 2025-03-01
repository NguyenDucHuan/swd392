using BBSS.Api.Constants;
using BBSS.Api.Models.AuthenticationModel;
using BBSS.Api.Models.UserModel;
using BBSS.Api.Services.Implements;
using BBSS.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BBSS.Api.Controllers
{
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;

        public UserController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        [Route("profile")]
        [Authorize(Roles = UserConstant.USER_ROLE_USER)]
        public async Task<IActionResult> GetProfile()
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (email == null) return Unauthorized();

            var result = await _userService.GetProfileAsync(email);
            return result.Match(
                (errorMessage, statusCode) => Problem(detail: errorMessage, statusCode: statusCode),
                Ok
            );
        }

        [HttpPatch]
        [Route("update-profile")]
        [Authorize(Roles = UserConstant.USER_ROLE_USER)]
        public async Task<IActionResult> UpdateProfile(UpdateProfileRequest request)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (email == null) return Unauthorized();

            var result = await _userService.UpdateProfileAsync(email, request);
            return result.Match(
                (errorMessage, statusCode) => Problem(detail: errorMessage, statusCode: statusCode),
                Ok
            );
        }
    }
}
