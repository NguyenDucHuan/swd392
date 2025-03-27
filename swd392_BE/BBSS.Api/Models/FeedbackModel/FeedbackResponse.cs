namespace BBSS.Api.Models.FeedbackModel
{
    public class FeedbackResponse
    {
        public int FeedbackId { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string? Image { get; set; }
        public string UserName { get; set; }
        public string BlindBoxName { get; set; }
        public int UpVote { get; set; }
        public int DownVote { get; set; }
        public List<string> BlindBoxFeatures { get; set; } = new List<string>();
        public List<string> BlindBoxImages { get; set; } = new List<string>();
        public DateTime CreateDate { get; set; }
        public bool Status { get; set; }
    }

}
