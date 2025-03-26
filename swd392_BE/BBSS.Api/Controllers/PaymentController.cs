using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using BBSS.Api.Services.Interfaces;
using BBSS.Api.Constants;
using BBSS.Api.Helper;
using BBSS.Api.Routes;

namespace BBSS.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        public PaymentController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        [HttpPost]
        [Route(Router.PaymentRoute.MakePayment)]
        [Authorize(Roles = UserConstant.USER_ROLE_USER)]
        public async Task<ActionResult> Payment(int orderId, string type)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (email == null) return Unauthorized();

            var result = await _paymentService.CreatePaymentAsync(email, orderId, type, HttpContext);
            return result.Match(
                (l, c) => Problem(detail: l, statusCode: c),
                Ok
            );
        }
        [HttpPost]
        [Route(Router.PaymentRoute.AddToWallet)]
        [Authorize(Roles = UserConstant.USER_ROLE_USER)]
        public async Task<ActionResult> AddToWallet(decimal amount)
        {
            var email = User.FindFirst(ClaimTypes.Email)?.Value;
            if (email == null) return Unauthorized();

            var result = await _paymentService.AddToWalletAsync(email, amount, HttpContext);
            return result.Match(
                (l, c) => Problem(detail: l, statusCode: c),
                Ok
            );
        }
        [HttpGet]
        [Route("api/payments/payment-call-back")]
        public async Task<ActionResult> PaymentCallBack()
        {
            var response = _paymentService.PaymentExecute(Request.Query);
            if (response == null) return BadRequest();

            var result = await _paymentService.ProcessResponseAsync(response);

            var redirectUrl = _paymentService.GetRedirectUrl();

            if (result is MethodResult<string>.Failure rs)
            {
                return Redirect($"{redirectUrl}/fail");
            }

            return Redirect($"{redirectUrl}/success");
        }
    }
}
