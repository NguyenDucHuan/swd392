using AutoMapper;
using BBSS.Api.Constants;
using BBSS.Api.Helper;
using BBSS.Api.Services.Interfaces;
using BBSS.Api.ViewModels;
using BBSS.Domain.Entities;
using BBSS.Repository.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BBSS.Api.Services.Implements
{
    public class DashboardService : IDashboardService
    {
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;

        public DashboardService(IUnitOfWork uow, IMapper mapper)
        {
            _uow = uow;
            _mapper = mapper;
        }

        public async Task<MethodResult<DashboardViewModel>> GetDashboardAsync()
        {
            try
            {
                var packages = await _uow.GetRepository<Package>().GetListAsync(
                     include: i => i.Include(p => p.BlindBoxes)
                    );
                var blindBoxes = await _uow.GetRepository<BlindBox>().GetListAsync();
                var orders = await _uow.GetRepository<Order>().GetListAsync(
                     include: i => i.Include(p => p.OrderStatuses)
                    );
                var users = await _uow.GetRepository<User>().GetListAsync();
                var result = new DashboardViewModel
                {
                    TotalPackages = packages.Count,
                    IsSoldPackages = packages.Count(p => p.BlindBoxes.All(b => b.IsSold)),
                    TotalBlindBoxes = blindBoxes.Count,
                    IsSoldBlindBoxes = blindBoxes.Count(b => b.IsSold),
                    TotalOrders = orders.Count(),
                    CompletedOrders = orders.Count(o => o.OrderStatuses.OrderByDescending(os => os.UpdateTime).FirstOrDefault().Status == OrderConstant.ORDER_STATUS_COMPLETED),
                    TotalUsers = users.Count,
                };
                return new MethodResult<DashboardViewModel>.Success(result);
            }
            catch (Exception ex)
            {
                return new MethodResult<DashboardViewModel>.Failure(ex.Message, StatusCodes.Status500InternalServerError);
            }
        }

        public async Task<MethodResult<IEnumerable<TotalFeedbacksByMonthViewModel>>> GetTotalFeedbacksByMonthAsync()
        {            
            var feedbacks = await _uow.GetRepository<Feedback>().GetListAsync(
                selector: s => s.CreateDate
            );
                
            var result = feedbacks.AsEnumerable().GroupBy(x => new { x.Year, x.Month })
                            .Select(o => new TotalFeedbacksByMonthViewModel
                            {
                                Month = o.Key.Month,
                                Year = o.Key.Year,
                                TotalFeedbacks = o.Count(),
                            })
                            .OrderBy(x => x.Year)
                            .ThenBy(x => x.Month)
                            .ToList();
            return new MethodResult<IEnumerable<TotalFeedbacksByMonthViewModel>>.Success(result);
        }

        public async Task<MethodResult<IEnumerable<TotalFeedbacksByQuarterViewModel>>> GetTotalFeedbacksByQuarterAsync()
        {
            var feedbacks = await _uow.GetRepository<Feedback>().GetListAsync(
                selector: s => s.CreateDate
            );

            var result = feedbacks.GroupBy(x => new
                            {
                                x.Year,
                                Quarter = (x.Month - 1) / 3 + 1
                            })
                            .Select(o => new TotalFeedbacksByQuarterViewModel
                            {
                                Quarter = o.Key.Quarter,
                                Year = o.Key.Year,
                                TotalFeedbacks = o.Count(),
                            })
                            .OrderBy(x => x.Year)
                            .ThenBy(x => x.Quarter)
                            .ToList();
            return new MethodResult<IEnumerable<TotalFeedbacksByQuarterViewModel>>.Success(result);
        }

        public async Task<MethodResult<IEnumerable<TotalFeedbacksByYearViewModel>>> GetTotalFeedbacksByYearAsync()
        {
            var feedbacks = await _uow.GetRepository<Feedback>().GetListAsync(
                selector: s => s.CreateDate
            );

            var result = feedbacks.GroupBy(x => x.Year)
                            .Select(o => new TotalFeedbacksByYearViewModel
                            {
                                Year = o.Key,
                                TotalFeedbacks = o.Count(),
                            })
                            .OrderBy(x => x.Year)
                            .ToList();
            return new MethodResult<IEnumerable<TotalFeedbacksByYearViewModel>>.Success(result);
        }


    }
}
