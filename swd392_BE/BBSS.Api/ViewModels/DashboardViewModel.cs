namespace BBSS.Api.ViewModels
{
    public class DashboardViewModel
    {
        public int TotalPackages { get; set; }
        public int IsSoldPackages { get; set; }
        public int TotalBlindBoxes { get; set; }
        public int IsSoldBlindBoxes { get; set; }
        public int TotalOrders { get; set; }
        public int CompletedOrders { get; set; }
        public int TotalUsers { get; set; }
    }
}
