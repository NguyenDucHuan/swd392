namespace BBSS.Api.Models.PackageModel
{
    public class PaginateModel
    {
        public int page { get; set; }
        public int size { get; set; }
        public string? sortBy { get; set; }
        public string? search { get; set; }
        public string? filter { get; set; }
    }


}
