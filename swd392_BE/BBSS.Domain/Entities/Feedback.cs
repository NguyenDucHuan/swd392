using System;
using System.Collections.Generic;

namespace BBSS.Domain.Entities;

public partial class Feedback
{
    public int FeedbackId { get; set; }

    public string Title { get; set; } = null!;

    public string Content { get; set; } = null!;

    public string? Image { get; set; }

    public DateTime CreateDate { get; set; }

    public bool? Status { get; set; }

    public int UserId { get; set; }

    public int BlindBoxId { get; set; }

    public virtual BlindBox BlindBox { get; set; } = null!;

    public virtual ICollection<FeedbackVote> FeedbackVotes { get; set; } = new List<FeedbackVote>();

    public virtual User User { get; set; } = null!;
}
