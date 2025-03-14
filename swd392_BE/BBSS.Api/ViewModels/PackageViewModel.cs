namespace BBSS.Api.ViewModels
{
    public class PackageViewModel
    {
        public int PackageId { get; set; }

        public string PakageCode { get; set; } = null!;

        public string? Name { get; set; }

        public string? Description { get; set; }

        public string? Manufacturer { get; set; }

        public int CategoryId { get; set; }

        public List<ImageViewModel> Images { get; set; } = new List<ImageViewModel>();
        public List<BlindBoxViewModel> BlindBoxes { get; set; } = new List<BlindBoxViewModel>();
    }

    public class ImageViewModel
    {
        public int ImageId { get; set; }
        public string Url { get; set; } = null!;
    }
}
