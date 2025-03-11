using BBSS.Api.Constants;
using BBSS.Api.Routes;
using BBSS.Api.Services.Implements;
using BBSS.Api.Services.Interfaces;
using BBSS.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BBSS.Api.Controllers
{
    public class WheelController : ControllerBase
    {
        private readonly IWheelService _wheelService;

        public WheelController(IWheelService wheelService)
        {
            _wheelService = wheelService;
        }

        [HttpGet(Router.WheelRoute.GetWheel)]
        public async Task<IActionResult> GetWheel ()
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (email == null) return Unauthorized();

            var result = await _wheelService.GetWheelAsync();
            return result.Match(
                (errorMessage, statusCode) => Problem(detail: errorMessage, statusCode: statusCode),
                Ok
            );
        }

        [HttpPost(Router.WheelRoute.PlayWheel)]
        [Authorize(Roles = UserConstant.USER_ROLE_USER)]
        public async Task<IActionResult> PlayWheel(int times, decimal amount)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (email == null) return Unauthorized();

            var result = await _wheelService.PlayWheelAsync(email, times, amount);
            return result.Match(
                (errorMessage, statusCode) => Problem(detail: errorMessage, statusCode: statusCode),
                Ok
            );
        }

    }
}
