using System;
using System.Collections.Generic;

namespace BBSS.Domain.Entities;

public partial class OrderDetail
{
    public int OrderDetailId { get; set; }

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }

    public int OrderId { get; set; }

    public int BlindBoxId { get; set; }

    public virtual BlindBox BlindBox { get; set; } = null!;

    public virtual Order Order { get; set; } = null!;
}
