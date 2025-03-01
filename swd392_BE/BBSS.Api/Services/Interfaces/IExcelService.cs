using BBSS.Api.ViewModels;

namespace BBSS.Api.Services.Interfaces
{
    public interface IExcelService
    {
        Task<IEnumerable<RevenueByMonthViewModel>> GetRevenueByMonthAsync();
        Task<IEnumerable<RevenueByQuarterViewModel>> GetRevenueByQuarterAsync();
        Task<IEnumerable<RevenueByYearViewModel>> GetRevenueByYearAsync();
    }
}
