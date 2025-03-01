using System;
using System.Collections.Generic;

namespace BBSS.Domain.Entities;

public partial class InventoryItem
{
    public int InventoryItemId { get; set; }

    public DateTime AddDate { get; set; }

    public int UserId { get; set; }

    public int BlindBoxId { get; set; }

    public string? Status { get; set; }

    public virtual BlindBox BlindBox { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
