using BBSS.Api.Constants;
using BBSS.Api.Models.OrderModel;
using BBSS.Api.Models.PackageModel;
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
        public async Task<IActionResult> GetWheel(PaginateModel model)
        {
            var result = await _wheelService.GetWheelAsync(model);
            return result.Match(
                (errorMessage, statusCode) => Problem(detail: errorMessage, statusCode: statusCode),
                Ok
            );
        }

        [HttpGet(Router.WheelRoute.GetWheelDetail)]
        public async Task<IActionResult> GetWheelDetail(string packageCode)
        {
            var result = await _wheelService.GetWheelDetailAsync(packageCode);
            return result.Match(
                (errorMessage, statusCode) => Problem(detail: errorMessage, statusCode: statusCode),
                Ok
            );
        }

        [HttpPost(Router.WheelRoute.PlayWheel)]
        [Authorize(Roles = UserConstant.USER_ROLE_USER)]
        public async Task<IActionResult> PlayWheel(string packageCode, int times, decimal amount)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (email == null) return Unauthorized();

            var result = await _wheelService.PlayWheelAsync(email, packageCode, times, amount);
            return result.Match(
                (errorMessage, statusCode) => Problem(detail: errorMessage, statusCode: statusCode),
                Ok
            );
        }

        [HttpPost(Router.WheelRoute.CreateOrderWheel)]
        [Authorize(Roles = UserConstant.USER_ROLE_USER)]
        public async Task<IActionResult> CreateOrderWheel(OrderWheelCreateRequest request)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.Sid).Value);
            if (userId == null) return Unauthorized();

            var result = await _wheelService.CreateOrderWheelAsync(userId, request);
            return result.Match(
                (errorMessage, statusCode) => Problem(detail: errorMessage, statusCode: statusCode),
                Ok
            );
        }
    }
}
