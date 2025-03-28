using BBSS.Api.Constants;
using BBSS.Api.Models.AuthenticationModel;
using BBSS.Api.Models.PackageModel;
using BBSS.Api.Models.UserModel;
using BBSS.Api.Routes;
using BBSS.Api.Services.Implements;
using BBSS.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using static BBSS.Api.Routes.Router;

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
        [Route(Router.UserRoute.Profile)]
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

        [HttpGet]
        [Route(Router.UserRoute.Users)]
        [Authorize(Roles = UserConstant.USER_ROLE_ADMIN)]
        public async Task<IActionResult> GetAllUsers([FromQuery] PaginateModel model)
        {
            var result = await _userService.GetAllUsersAsync(model);
            return result.Match(
                (errorMessage, statusCode) => Problem(detail: errorMessage, statusCode: statusCode),
                Ok
            );
        }

        [HttpPatch]
        [Route(Router.UserRoute.UpdateProfile)]
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

        [HttpPost]
        [Route(UserRoute.CreateUser)]
        [Authorize(Roles = UserConstant.USER_ROLE_ADMIN + "," + UserConstant.USER_ROLE_STAFF)]
        public async Task<IActionResult> CreateUser([FromBody] UserRequest request)
        {
            var result = await _userService.CreateUserAsync(request);
            return result.Match(
                (errorMessage, statusCode) => Problem(detail: errorMessage, statusCode: statusCode),
                success => CreatedAtAction(nameof(CreateUser), new { id = success.UserId }, success)
            );
        }



        // Cập nhật thông tin user
        [HttpPut]
        [Route(UserRoute.UpdateUser)]
        [Authorize(Roles = UserConstant.USER_ROLE_ADMIN + "," + UserConstant.USER_ROLE_STAFF)]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UserRequest request)
        {
            var result = await _userService.UpdateUserAsync(id, request);
            return result.Match(
                (errorMessage, statusCode) => Problem(detail: errorMessage, statusCode: statusCode),
                Ok
            );
        }

        // Cập nhật trạng thái user
        [HttpPatch]
        [Route(UserRoute.UpdateUserStatus)]
        [Authorize(Roles = UserConstant.USER_ROLE_ADMIN)]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusRequest request)
        {
            var result = await _userService.UpdateUserStatusAsync(id, request);
            return result.Match(
                (errorMessage, statusCode) => Problem(detail: errorMessage, statusCode: statusCode),
                Ok
            );
        }
    }
}
