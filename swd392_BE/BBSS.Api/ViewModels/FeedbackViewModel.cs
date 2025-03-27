namespace BBSS.Api.ViewModels
{
    public class TotalFeedbacksByMonthViewModel
    {
        public int Month { get; set; }
        public int Year { get; set; }
        public int TotalFeedbacks { get; set; }
    }

    public class TotalFeedbacksByQuarterViewModel
    {
        public int Quarter { get; set; }
        public int Year { get; set; }
        public int TotalFeedbacks { get; set; }
    }

    public class TotalFeedbacksByYearViewModel
    {
        public int Year { get; set; }
        public int TotalFeedbacks { get; set; }
    }
}
