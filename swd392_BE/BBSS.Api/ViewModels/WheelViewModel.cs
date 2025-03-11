using BBSS.Domain.Entities;

namespace BBSS.Api.ViewModels
{
    public class WheelViewModel
    {
        public IEnumerable<Package> Packages { get; set; }
        public decimal Price { get; set; }
    }
}
