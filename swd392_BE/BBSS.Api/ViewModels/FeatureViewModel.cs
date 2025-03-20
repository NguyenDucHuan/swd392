namespace BBSS.Api.ViewModels
{
    public class FeatureViewModel
    {
        public int FeatureId { get; set; }

        public string Description { get; set; } = null!;

        public string? Type { get; set; }
    }
}
