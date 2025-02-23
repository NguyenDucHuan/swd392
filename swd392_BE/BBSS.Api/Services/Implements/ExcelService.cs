using AutoMapper;
using BBSS.Api.Constants;
using BBSS.Api.Services.Interfaces;
using BBSS.Api.ViewModels;
using BBSS.Domain.Entities;
using BBSS.Repository.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BBSS.Api.Services.Implements
{
    public class ExcelService : IExcelService
    {
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;

        public ExcelService(IUnitOfWork uow, IMapper mapper)
        {
            _uow = uow;
            _mapper = mapper;
        }

        public async Task<IEnumerable<RevenueByMonthViewModel>> GetRevenueByMonthAsync()
        {
            var orders = await _uow.GetRepository<Order>().GetListAsync(
                    selector: s => new { s.OrderDate, s.TotalAmount },
                    predicate: p => p.OrderStatuses.Any(x => x.Status == OrderConstant.ORDER_STATUS_COMPLETED),
                    include: i => i.Include(x => x.OrderStatuses)
                );

            return orders.GroupBy(x => new { x.OrderDate.Year, x.OrderDate.Month })
                         .Select(o => new RevenueByMonthViewModel
                         {
                                Month = o.Key.Month,
                                Year = o.Key.Year,
                                Amount = o.Sum(x => x.TotalAmount),
                            })
                         .OrderBy(x => x.Year)
                         .ThenBy(x => x.Month)
                         .ToList();
        }

        public async Task<IEnumerable<RevenueByQuarterViewModel>> GetRevenueByQuarterAsync()
        {
            var orders = await _uow.GetRepository<Order>().GetListAsync(
                    selector: s => new { s.OrderDate, s.TotalAmount },
                    predicate: p => p.OrderStatuses.Any(x => x.Status == OrderConstant.ORDER_STATUS_COMPLETED),
                    include: i => i.Include(x => x.OrderStatuses)
                );

            return orders.GroupBy(x => new
                            {
                                x.OrderDate.Year,
                                Quarter = (x.OrderDate.Month - 1) / 3 + 1 
                            })
                         .Select(o => new RevenueByQuarterViewModel
                         {
                             Quarter = o.Key.Quarter,
                             Year = o.Key.Year,
                             Amount = o.Sum(x => x.TotalAmount),
                         })
                         .OrderBy(x => x.Year)
                         .ThenBy(x => x.Quarter)
                         .ToList();
        }

        public async Task<IEnumerable<RevenueByYearViewModel>> GetRevenueByYearAsync()
        {
            var orders = await _uow.GetRepository<Order>().GetListAsync(
                    selector: s => new { s.OrderDate, s.TotalAmount },
                    predicate: p => p.OrderStatuses.Any(x => x.Status == OrderConstant.ORDER_STATUS_COMPLETED),
                    include: i => i.Include(x => x.OrderStatuses)
                );

            return orders.GroupBy(x => x.OrderDate.Year)
                         .Select(o => new RevenueByYearViewModel
                         {
                             Year = o.Key,
                             Amount = o.Sum(x => x.TotalAmount),
                         })
                         .OrderBy(x => x.Year)
                         .ToList();
        }
    }
}
