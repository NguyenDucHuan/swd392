using BBSS.Api.Constants;
using BBSS.Api.Models.PackageModel;
using BBSS.Api.Routes;
using BBSS.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BBSS.Api.Controllers
{
    [ApiController]
    public class TransactionController : ControllerBase
    {
        private readonly ITransactionService _transactionService;

        public TransactionController(ITransactionService transactionService)
        {
            _transactionService = transactionService;
        }

        [HttpGet]
        [Route(Router.TransactionRoute.GetAllTransactions)]
        [Authorize(Roles = UserConstant.USER_ROLE_ADMIN)]
        public async Task<ActionResult> GetAllTransactions([FromQuery] PaginateModel model, decimal? minAmount, decimal? maxAmount)
        {
            var result = await _transactionService.GetAllTransactionsAsync(model, minAmount, maxAmount);
            return result.Match(
                (l, c) => Problem(detail: l, statusCode: c),
                Ok);
        }

        [HttpGet]
        [Route(Router.TransactionRoute.GetUserTransactions)]
        [Authorize(Roles = UserConstant.USER_ROLE_USER)]
        public async Task<ActionResult> GetUserTransactions([FromQuery] PaginateModel model, decimal? minAmount, decimal? maxAmount)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.Sid).Value);
            var result = await _transactionService.GetUserTransactionsAsync(userId, model, minAmount, maxAmount);
            return result.Match(
                (l, c) => Problem(detail: l, statusCode: c),
                Ok);
        }
        [HttpGet]
        [Route(Router.TransactionRoute.GetTransaction)]
        public async Task<ActionResult> GetTransaction(int id)
        {
            var result = await _transactionService.GetTransactionByIdAsync(id);
            return result.Match(
                (l, c) => Problem(detail: l, statusCode: c),
                Ok);
        }
    }
}
