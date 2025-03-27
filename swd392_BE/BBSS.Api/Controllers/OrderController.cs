using BBSS.Api.Constants;
using BBSS.Api.Models.OrderModel;
using BBSS.Api.Models.PackageModel;
using BBSS.Api.Routes;
using BBSS.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BBSS.Api.Controllers
{
    public class OrderController : ControllerBase
    {
        private readonly IOrderService _orderService;
        public OrderController(IOrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpPost]
        [Route(Router.OrderRoute.CreateOrder)]
        [Authorize(Roles = UserConstant.USER_ROLE_USER)]
        public async Task<ActionResult> CreateOrder(int? voucherId, [FromBody]OrderCreateRequest request)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (email == null) return Unauthorized();

            var result = await _orderService.CreateOrderAsync(email, voucherId, request);
            return result.Match(
                (l, c) => Problem(detail: l, statusCode: c),
                Ok
            );
        }

        [HttpPost]
        [Route(Router.OrderRoute.ConfirmOrder)]
        [Authorize(Roles = UserConstant.USER_ROLE_STAFF)]
        public async Task<ActionResult> ConfirmOrder(int orderId)
        {
            var result = await _orderService.ConfirmOrderAsync(orderId);
            return result.Match(
                (l, c) => Problem(detail: l, statusCode: c),
                Ok
            );
        }

        [HttpPost]
        [Route(Router.OrderRoute.CompleteOrder)]
        [Authorize(Roles = UserConstant.USER_ROLE_USER)]
        public async Task<ActionResult> CompleteOrder(int orderId)
        {
            var userId = Int32.Parse(User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Sid).Value);
            var result = await _orderService.CompleteOrderAsync(userId, orderId);
            return result.Match(
                (l, c) => Problem(detail: l, statusCode: c),
                Ok
            );
        }

        [HttpPost]
        [Route(Router.OrderRoute.CancelOrder)]
        [Authorize(Roles = $"{UserConstant.USER_ROLE_USER}, {UserConstant.USER_ROLE_STAFF}")]
        public async Task<ActionResult> CancelOrder(int orderId)
        {
            var result = await _orderService.CancelOrderAsync(orderId);
            return result.Match(
                (l, c) => Problem(detail: l, statusCode: c),
                Ok
            );
        }

        [HttpGet]
        [Route(Router.OrderRoute.GetUserOrder)]
        [Authorize(Roles = UserConstant.USER_ROLE_USER)]
        public async Task<ActionResult> GetOrdersByUser([FromQuery] PaginateModel model, decimal? minAmount, decimal? maxAmount)
        {
            var userId = Int32.Parse(User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Sid).Value);
            var result = await _orderService.GetOrdersByUserAsync(userId, model, minAmount, maxAmount);
            return result.Match(
                (l, c) => Problem(detail: l, statusCode: c),
                Ok
            );
        }

        [HttpGet]
        [Route(Router.OrderRoute.GetAllOrder)]
        [Authorize(Roles = UserConstant.USER_ROLE_STAFF)]
        public async Task<ActionResult> GetAllOrders([FromQuery] PaginateModel model, decimal? minAmount, decimal? maxAmount)
        {
            var result = await _orderService.GetAllOrdersAsync(model, minAmount, maxAmount);
            return result.Match(
                (l, c) => Problem(detail: l, statusCode: c),
                Ok
            );
        }
    }
}
