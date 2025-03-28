using System.ComponentModel.DataAnnotations;

namespace BBSS.Api.Models.FeedbackModel
{
    public class FeedbackRequest
    {
        [Required]
        public int OrderId { get; set; }
        //public int? BlindBoxId { get; set; }
        //public int? PackageId { get; set; }
        [Required]
        public string Title { get; set; }
        [Required]
        public string Content { get; set; }

        public IFormFile? Image { get; set; }
    }
}

