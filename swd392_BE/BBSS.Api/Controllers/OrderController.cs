using BBSS.Api.Constants;
using BBSS.Api.Models.OrderModel;
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

        [HttpPost("create-order")]
        [Authorize(Roles = UserConstant.USER_ROLE_USER)]
        public async Task<ActionResult> CreateOrder(OrderCreateRequest request)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (email == null) return Unauthorized();

            var result = await _orderService.CreateOrderAsync(email, request);
            return result.Match(
                (l, c) => Problem(detail: l, statusCode: c),
                Ok
            );
        }

        [HttpPost("complete-order")]
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

        [HttpPost("cancel-order")]
        [Authorize(Roles = UserConstant.USER_ROLE_USER)]
        public async Task<ActionResult> CancelOrder(int orderId)
        {
            var userId = Int32.Parse(User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Sid).Value);
            var result = await _orderService.CancelOrderAsync(userId, orderId);
            return result.Match(
                (l, c) => Problem(detail: l, statusCode: c),
                Ok
            );
        }

        [HttpGet("get-user-order")]
        [Authorize(Roles = UserConstant.USER_ROLE_USER)]
        public async Task<ActionResult> GetOrdersByUser()
        {
            var userId = Int32.Parse(User.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Sid).Value);
            var result = await _orderService.GetOrdersByUserAsync(userId);
            return result.Match(
                (l, c) => Problem(detail: l, statusCode: c),
                Ok
            );
        }

        [HttpGet("get-all-order")]
        [Authorize(Roles = UserConstant.USER_ROLE_USER)]
        public async Task<ActionResult> GetAllOrders()
        {
            var result = await _orderService.GetAllOrdersAsync();
            return result.Match(
                (l, c) => Problem(detail: l, statusCode: c),
                Ok
            );
        }
    }
}
