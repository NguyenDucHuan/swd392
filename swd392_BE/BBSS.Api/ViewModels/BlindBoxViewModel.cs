namespace BBSS.Api.ViewModels
{
    public class BlindBoxViewModel
    {
        public int BlindBoxId { get; set; }

        public string? Color { get; set; }

        public bool? Status { get; set; }

        public double? Size { get; set; }

        public decimal Price { get; set; }

        public decimal Discount { get; set; }

        public decimal DiscountedPrice => Price * (1 - Discount / 100);

        public int Number { get; set; }

        public bool IsKnowned { get; set; }

        public bool IsSpecial { get; set; }

        public bool IsSold { get; set; }

        public int PackageId { get; set; }

        public string PackageCode { get; set; }

        public string PackageName { get; set; }

        public List<ImageViewModel> ImageUrls { get; set; } = new List<ImageViewModel>();

        public List<FeatureViewModel> Features { get; set; } = new List<FeatureViewModel>();
    }
}