using System;
using System.Collections.Generic;

namespace BBSS.Domain.Entities;

public partial class Package
{
    public int PackageId { get; set; }

    public string PakageCode { get; set; } = null!;

    public string? Name { get; set; }

    public string? Description { get; set; }

    public string? Manufacturer { get; set; }

    public int CategoryId { get; set; }

    public virtual ICollection<BlindBox> BlindBoxes { get; set; } = new List<BlindBox>();

    public virtual Category Category { get; set; } = null!;

    public virtual ICollection<OrderDetail> OrderDetails { get; set; } = new List<OrderDetail>();

    public virtual ICollection<PackageImage> PackageImages { get; set; } = new List<PackageImage>();
}
