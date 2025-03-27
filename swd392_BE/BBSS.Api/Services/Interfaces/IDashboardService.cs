using BBSS.Api.Helper;
using BBSS.Api.ViewModels;

namespace BBSS.Api.Services.Interfaces
{
    public interface IDashboardService
    {
        Task<MethodResult<DashboardViewModel>> GetDashboardAsync();
        Task<MethodResult<IEnumerable<TotalFeedbacksByMonthViewModel>>> GetTotalFeedbacksByMonthAsync();
        Task<MethodResult<IEnumerable<TotalFeedbacksByQuarterViewModel>>> GetTotalFeedbacksByQuarterAsync();
        Task<MethodResult<IEnumerable<TotalFeedbacksByYearViewModel>>> GetTotalFeedbacksByYearAsync();
    }
}
