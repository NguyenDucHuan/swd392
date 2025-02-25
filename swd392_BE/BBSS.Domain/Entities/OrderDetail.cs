using System;
using System.Collections.Generic;

namespace BBSS.Domain.Entities;

public partial class OrderDetail
{
    public int OrderDetailId { get; set; }

    public decimal UnitPrice { get; set; }

    public int OrderId { get; set; }

    public int? BlindBoxId { get; set; }

    public int? PackageId { get; set; }

    public virtual BlindBox? BlindBox { get; set; }

    public virtual Order Order { get; set; } = null!;

    public virtual Package? Package { get; set; }
}
