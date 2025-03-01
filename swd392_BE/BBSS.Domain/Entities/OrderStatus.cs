using System;
using System.Collections.Generic;

namespace BBSS.Domain.Entities;

public partial class OrderStatus
{
    public int OrderStatusId { get; set; }

    public string? Status { get; set; }

    public DateTime UpdateTime { get; set; }

    public int OrderId { get; set; }

    public virtual Order Order { get; set; } = null!;
}
