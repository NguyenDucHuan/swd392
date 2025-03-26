using BBSS.Domain.Entities;

namespace BBSS.Api.ViewModels
{
    public class WheelViewModel
    {        
        public decimal Price { get; set; }
        public int TotalBlindBoxes { get; set; }
        public IEnumerable<WheelBlindBoxViewModel> WheelBlindBoxes { get; set; }
    }

    public class WheelBlindBoxViewModel
    {
        public string PackageCode { get; set; }
        public string? Color { get; set; }
        public int Quantity { get; set; }
        public float Rate { get; set; }
        public IEnumerable<BlindBoxViewModel> BlindBoxes { get; set; }
    }
}
