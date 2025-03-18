using BBSS.Api.Helper;
using BBSS.Api.Models.PackageModel;
using BBSS.Api.ViewModels;
using BBSS.Domain.Paginate;

namespace BBSS.Api.Services.Interfaces
{
    public interface ITransactionService
    {
        Task<MethodResult<IPaginate<TransactionViewModel>>> GetAllTransactionsAsync(PaginateModel model, decimal? minAmount, decimal? maxAmount);
        Task<MethodResult<IPaginate<TransactionViewModel>>> GetUserTransactionsAsync(int userId, PaginateModel model, decimal? minAmount, decimal? maxAmount);
    }
}
