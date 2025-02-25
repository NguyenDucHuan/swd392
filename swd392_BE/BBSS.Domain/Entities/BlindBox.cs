using System;
using System.Collections.Generic;

namespace BBSS.Domain.Entities;

public partial class BlindBox
{
    public int BlindBoxId { get; set; }

    public string? Color { get; set; }

    public bool? Status { get; set; }

    public double? Size { get; set; }

    public decimal Price { get; set; }

    public decimal Discount { get; set; }

    public int Number { get; set; }

    public bool IsKnowned { get; set; }

    public bool IsSpecial { get; set; }

    public bool IsSold { get; set; }

    public int PackageId { get; set; }

    public virtual ICollection<BlindBoxFeature> BlindBoxFeatures { get; set; } = new List<BlindBoxFeature>();

    public virtual ICollection<BlindBoxImage> BlindBoxImages { get; set; } = new List<BlindBoxImage>();

    public virtual ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();

    public virtual ICollection<InventoryItem> InventoryItems { get; set; } = new List<InventoryItem>();

    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();

    public virtual Package Package { get; set; } = null!;
}
