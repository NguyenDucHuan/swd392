using System;
using System.Collections.Generic;

namespace BBSS.Domain.Entities;

public partial class Voucher
{
    public int VoucherId { get; set; }

    public string VoucherCode { get; set; } = null!;

    public string? Description { get; set; }

    public decimal DiscountAmount { get; set; }

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public decimal? MinimumPurchase { get; set; }

    public int UsageLimit { get; set; }

    public bool? Status { get; set; }

    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();

    public virtual ICollection<UserVoucher> UserVouchers { get; set; } = new List<UserVoucher>();
}
