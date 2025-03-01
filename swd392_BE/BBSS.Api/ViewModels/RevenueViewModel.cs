namespace BBSS.Api.ViewModels
{
    public class RevenueByMonthViewModel
    {
        public int Month { get; set; }
        public int Year { get; set; }
        public decimal Amount { get; set; }
    }

    public class RevenueByQuarterViewModel
    {
        public int Quarter { get; set; }
        public int Year { get; set; }
        public decimal Amount { get; set; }
    }

    public class RevenueByYearViewModel
    {
        public int Year { get; set; }
        public decimal Amount { get; set; }
    }
}
