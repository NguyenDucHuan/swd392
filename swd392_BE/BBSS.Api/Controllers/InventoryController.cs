using BBSS.Api.Constants;
using BBSS.Api.Models.PackageModel;
using BBSS.Api.Routes;
using BBSS.Api.Services.Implements;
using BBSS.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BBSS.Api.Controllers
{
    [ApiController]
    public class InventoryController : ControllerBase
    {
        private readonly IInventoryService _inventoryService;

        public InventoryController(IInventoryService inventoryService)
        {
            _inventoryService = inventoryService;
        }

        [HttpGet]
        [Route(Router.InventoryRoute.GetOwnInventories)]
        [Authorize(Roles = UserConstant.USER_ROLE_USER)]
        public async Task<ActionResult> GetOwnInventories([FromQuery] PaginateModel? model, decimal? minAmount, decimal? maxAmount)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.Sid).Value);
            var result = await _inventoryService.GetInventoriesAsync(userId, model, minAmount, maxAmount);
            return result.Match(
                (l, c) => Problem(detail: l, statusCode: c),
                Ok);
        }

        [HttpGet]
        [Route(Router.InventoryRoute.GetOtherInventories)]
        [Authorize(Roles = UserConstant.USER_ROLE_USER)]
        public async Task<ActionResult> GetOtherInventories(int userId, [FromQuery] PaginateModel model, decimal? minAmount, decimal? maxAmount)
        {
            var result = await _inventoryService.GetInventoriesAsync(userId, model, minAmount, maxAmount);
            return result.Match(
                (l, c) => Problem(detail: l, statusCode: c),
                Ok);
        }

        [HttpGet]
        [Route(Router.InventoryRoute.GetInventory)]
        public async Task<ActionResult> GetInventory(int id)
        {
            var result = await _inventoryService.GetInventoryAsync(id);
            return result.Match(
                (l, c) => Problem(detail: l, statusCode: c),
                Ok);
        }
    }
}
