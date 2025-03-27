using AutoMapper;
using BBSS.Api.Helper;
using BBSS.Api.Models.PackageModel;
using BBSS.Api.Services.Interfaces;
using BBSS.Api.ViewModels;
using BBSS.Domain.Entities;
using BBSS.Domain.Paginate;
using BBSS.Repository.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace BBSS.Api.Services.Implements
{
    public class InventoryService : IInventoryService
    {
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;

        public InventoryService(IUnitOfWork uow, IMapper mapper)
        {
            _uow = uow;
            _mapper = mapper;
        }

        public async Task<MethodResult<IPaginate<InventoryViewModel>>> GetInventoriesAsync(int userId, PaginateModel model, decimal? minAmount, decimal? maxAmount)
        {
            int page = model.page > 0 ? model.page : 1;
            int size = model.size > 0 ? model.size : 10;
            string search = model.search?.ToLower() ?? string.Empty;
            string filter = model.filter?.ToLower() ?? string.Empty;

            Expression<Func<InventoryItem, bool>> predicate = p =>
                (string.IsNullOrEmpty(search) || p.BlindBox.Package.PakageCode.Contains(search) || 
                                                 p.BlindBox.Package.Name.Contains(search) ||
                                                 p.BlindBox.Package.Description.Contains(search)) &&
                (string.IsNullOrEmpty(filter) || string.Equals(model.filter, p.Status.ToLower())) &&
                (minAmount == null || p.BlindBox.Price * (1 - p.BlindBox.Discount / 100) >= minAmount) &&
                (maxAmount == null || p.BlindBox.Price * (1 - p.BlindBox.Discount / 100) <= maxAmount) &&
                p.UserId == userId;
            

            var result = await _uow.GetRepository<InventoryItem>().GetPagingListAsync<InventoryViewModel>(
                    selector: s => _mapper.Map<InventoryViewModel>(s),
                    predicate: predicate,
                    orderBy: BuildOrderBy(model.sortBy),
                    include: i => i.Include(p => p.BlindBox.Package),
                    page: page,
                    size: size
                );

            return new MethodResult<IPaginate<InventoryViewModel>>.Success(result);
        }

        public async Task<MethodResult<InventoryViewModel>> GetInventoryAsync(int inventoryId)
        {            
            var result = await _uow.GetRepository<InventoryItem>().SingleOrDefaultAsync<InventoryViewModel>(
                    selector: s => _mapper.Map<InventoryViewModel>(s),
                    predicate: p => p.InventoryItemId == inventoryId,
                    include: i => i.Include(p => p.BlindBox.Package)
                );

            return new MethodResult<InventoryViewModel>.Success(result);
        }

        private Func<IQueryable<InventoryItem>, IOrderedQueryable<InventoryItem>> BuildOrderBy(string sortBy)
        {
            if (string.IsNullOrEmpty(sortBy)) return null;

            return sortBy.ToLower() switch
            {
                "amount" => q => q.OrderBy(p => p.BlindBox.Price * (1 - p.BlindBox.Discount / 100)),
                "amount_desc" => q => q.OrderByDescending(p => p.BlindBox.Price * (1 - p.BlindBox.Discount / 100)),
                "date" => q => q.OrderBy(p => p.AddDate),
                "date_desc" => q => q.OrderByDescending(p => p.AddDate),
                _ => q => q.OrderByDescending(p => p.InventoryItemId) // Default sort
            };
        }
    }
}
