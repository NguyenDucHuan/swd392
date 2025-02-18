using System;
using System.Collections.Generic;

namespace BBSS.Domain.Entities;

public partial class User
{
    public int UserId { get; set; }

    public string Name { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string Password { get; set; } = null!;

    public decimal? WalletBalance { get; set; }

    public string? Role { get; set; }

    public DateOnly? DateOfBirth { get; set; }

    public bool? Status { get; set; }

    public string? Phone { get; set; }

    public string? Image { get; set; }

    public virtual ICollection<FeedbackVote> FeedbackVotes { get; set; } = new List<FeedbackVote>();

    public virtual ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();

    public virtual ICollection<InventoryItem> InventoryItems { get; set; } = new List<InventoryItem>();

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();

    public virtual ICollection<UserVoucher> UserVouchers { get; set; } = new List<UserVoucher>();
}
