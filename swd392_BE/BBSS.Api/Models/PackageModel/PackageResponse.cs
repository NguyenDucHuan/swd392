using BBSS.Domain.Entities;

namespace BBSS.Api.Models.PackageModel
{
    public class PackageResponse
    {
        public int PackageId { get; set; }

        public string PakageCode { get; set; } = null!;

        public string? Name { get; set; }

        public string? Description { get; set; }

        public string? Manufacturer { get; set; }

        public int CategoryId { get; set; }

        public ICollection<PackageImageResponse> PackageImages { get; set; } = new List<PackageImageResponse>();
    }

}


