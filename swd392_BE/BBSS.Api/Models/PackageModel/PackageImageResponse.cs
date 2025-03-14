namespace BBSS.Api.Models.PackageModel
{
    public class PackageImageResponse
    {
        public int PackageImageId { get; set; }

        public string Url { get; set; } = null!;

        public int PackageId { get; set; }
    }
}
