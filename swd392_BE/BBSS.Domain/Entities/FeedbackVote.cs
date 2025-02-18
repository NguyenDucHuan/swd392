using System;
using System.Collections.Generic;

namespace BBSS.Domain.Entities;

public partial class FeedbackVote
{
    public int VoteId { get; set; }

    public int FeedbackId { get; set; }

    public int UserId { get; set; }

    public DateTime VoteDate { get; set; }

    public string? VoteType { get; set; }

    public virtual Feedback Feedback { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
