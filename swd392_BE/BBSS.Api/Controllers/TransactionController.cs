using BBSS.Api.Models.PackageModel;
using BBSS.Api.Routes;
using BBSS.Api.Services.Interfaces;
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
        public async Task<ActionResult> GetAllTransactions([FromQuery] PaginateModel model, decimal? minAmount, decimal? maxAmount)
        {
            var result = await _transactionService.GetAllTransactionsAsync(model, minAmount, maxAmount);
            return result.Match(
                (l, c) => Problem(detail: l, statusCode: c),
                Ok);
        }

        [HttpGet]
        [Route(Router.TransactionRoute.GetUserTransactions)]
        public async Task<ActionResult> GetUserTransactions([FromQuery] PaginateModel model, decimal? minAmount, decimal? maxAmount)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.Sid).Value);
            var result = await _transactionService.GetUserTransactionsAsync(userId, model, minAmount, maxAmount);
            return result.Match(
                (l, c) => Problem(detail: l, statusCode: c),
                Ok);
        }
    }
}
