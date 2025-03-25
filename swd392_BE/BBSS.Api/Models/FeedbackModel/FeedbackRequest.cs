namespace BBSS.Api.Models.FeedbackModel
{
    public class FeedbackRequest
    {
        public int UserId { get; set; }
        public int BlindBoxId { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string? Image { get; set; }
    }

}
