using AutoMapper;
using BBSS.Api.Helper;
using BBSS.Api.Models.PackageModel;
using BBSS.Api.Services.Interfaces;
using BBSS.Api.ViewModels;
using BBSS.Domain.Entities;
using BBSS.Domain.Paginate;
using BBSS.Repository.Interfaces;
using System.Linq.Expressions;

namespace BBSS.Api.Services.Implements
{
    public class TransactionService : ITransactionService
    {
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;

        public TransactionService(IUnitOfWork uow, IMapper mapper)
        {
            _uow = uow;
            _mapper = mapper;
        }

        public async Task<MethodResult<IPaginate<TransactionViewModel>>> GetAllTransactionsAsync(PaginateModel model, decimal? minAmount, decimal? maxAmount)
        {
            int page = model.page > 0 ? model.page : 1;
            int size = model.size > 0 ? model.size : 10;

            Expression<Func<Transaction, bool>> predicate = p =>
                (string.IsNullOrEmpty(model.search) || p.Description.IndexOf(model.search, StringComparison.OrdinalIgnoreCase) > 0) &&
                (string.IsNullOrEmpty(model.filter) || string.Equals(model.filter, p.Type, StringComparison.OrdinalIgnoreCase)) &&
                (minAmount == null || p.Amount >= minAmount) &&
                (maxAmount == null || p.Amount <= maxAmount);
                 

            var result = await _uow.GetRepository<Transaction>().GetPagingListAsync<TransactionViewModel>(
                    selector: s => _mapper.Map<TransactionViewModel>(s),
                    predicate: predicate,
                    orderBy: BuildOrderBy(model.sortBy),
                    page: page,
                    size: size
                );
                
            return new MethodResult<IPaginate<TransactionViewModel>>.Success(result);
        }

        public async Task<MethodResult<IPaginate<TransactionViewModel>>> GetUserTransactionsAsync(int userId, PaginateModel model, decimal? minAmount, decimal? maxAmount)
        {
            int page = model.page > 0 ? model.page : 1;
            int size = model.size > 0 ? model.size : 10;

            Expression<Func<Transaction, bool>> predicate = p =>
                (string.IsNullOrEmpty(model.search) || p.Description.IndexOf(model.search, StringComparison.OrdinalIgnoreCase) > 0) &&
                (string.IsNullOrEmpty(model.filter) || string.Equals(model.filter, p.Type, StringComparison.OrdinalIgnoreCase)) &&
                (minAmount == null || p.Amount >= minAmount) &&
                (maxAmount == null || p.Amount <= maxAmount) &&
                p.UserId == userId;


            var result = await _uow.GetRepository<Transaction>().GetPagingListAsync<TransactionViewModel>(
                    selector: s => _mapper.Map<TransactionViewModel>(s),
                    predicate: predicate,
                    orderBy: BuildOrderBy(model.sortBy),
                    page: page,
                    size: size
                );

            return new MethodResult<IPaginate<TransactionViewModel>>.Success(result);
        }

        private Func<IQueryable<Transaction>, IOrderedQueryable<Transaction>> BuildOrderBy(string sortBy)
        {
            if (string.IsNullOrEmpty(sortBy)) return null;

            return sortBy.ToLower() switch
            {
                "amount" => q => q.OrderBy(p => p.Amount),
                "amount_desc" => q => q.OrderByDescending(p => p.Amount),
                "date" => q => q.OrderBy(p => p.CreateDate),
                "date_desc" => q => q.OrderByDescending(p => p.CreateDate),
                _ => q => q.OrderByDescending(p => p.TransactionId) // Default sort
            };
        }


    }
}

