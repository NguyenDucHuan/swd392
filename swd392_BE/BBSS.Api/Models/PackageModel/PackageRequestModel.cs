namespace BBSS.Api.Models.PackageModel
{
    public class PackageCreateRequest
    {
        public string PakageCode { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public string? Manufacturer { get; set; }
        public int CategoryId { get; set; }
        public List<IFormFile>? ImageFiles { get; set; }
    }

    public class PackageUpdateRequest
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Manufacturer { get; set; }
        public int? CategoryId { get; set; }
        public List<IFormFile>? ImageFiles { get; set; }
        public List<BlindBoxUpdateRequest>? BlindBoxes { get; set; }
    }
    public class BlindBoxUpdateRequest
    {
        public int? BlindBoxId { get; set; }  // Added to identify existing BlindBoxes
        public string? Color { get; set; }
        public bool? Status { get; set; }
        public double? Size { get; set; }
        public decimal Price { get; set; }
        public decimal Discount { get; set; }
        public int Number { get; set; } // ko cho chỉnh lại 
        public bool IsKnowned { get; set; }
        public bool IsSpecial { get; set; }
        public List<IFormFile>? ImageFiles { get; set; }
        public List<int>? FeatureIds { get; set; }
    }

}
