using Microsoft.AspNetCore.Mvc;

namespace BBSS.Api.Models.PackageModel
{
    public class PackageUnknownCreateRequest
    {
        public string PakageCode { get; set; } = null!;

        public string? Name { get; set; }

        public string? Description { get; set; }

        public string? Manufacturer { get; set; }

        public int CategoryId { get; set; }

        public List<IFormFile> PakageImages { get; set; }

        public decimal Price { get; set; }

        public decimal Discount { get; set; }

        public int AmountPackage { get; set; }

        public int AmountBlindBox { get; set; }
    }

    public class PackageKnownCreateRequest
    {
        public string PakageCode { get; set; } = null!;

        public string? Name { get; set; }

        public string? Description { get; set; }

        public string? Manufacturer { get; set; }

        public int CategoryId { get; set; }
     
        public List<IFormFile> PakageImages { get; set; }
        //[FromBody]

        public List<BlindBoxCreateRequest> BlindBoxes { get; set; } = new List<BlindBoxCreateRequest>();
    }
 
    public class BlindBoxCreateRequest
    {
        public string? Color { get; set; }
        public bool? Status { get; set; } = true;
        public double? Size { get; set; }
        public decimal Price { get; set; }
        public decimal Discount { get; set; }
        public bool IsSpecial { get; set; }
        public List<IFormFile>? BlindBoxImages { get; set; }
        public List<int>? FeatureIds { get; set; }
    }
   
    public class PackageUpdateRequest
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Manufacturer { get; set; }
        public int? CategoryId { get; set; }

        public bool IsUpdateImagePackage { get; set; }
        public List<IFormFile>? ImageFiles { get; set; }
        //[FromBody]
        public List<BlindBoxUpdateRequest>? BlindBoxes { get; set; }
    }
    public class BlindBoxUpdateRequest
    {
        public int? BlindBoxId { get; set; }  // Added to identify existing BlindBoxes'
        public bool IsUpdateImageBlindBox { get; set; }
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
