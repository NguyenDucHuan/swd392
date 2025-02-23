using System;
using System.Collections.Generic;

namespace BBSS.Domain.Entities;

public partial class Package
{
    public int PackageId { get; set; }

    public string? Name { get; set; }

    public string? Description { get; set; }

    public string? Manufacturer { get; set; }

    public string? Themes { get; set; }

    public int? Stock { get; set; }

    public int CategoryId { get; set; }

    public virtual ICollection<BlindBox> BlindBoxes { get; set; } = new List<BlindBox>();

    public virtual Category Category { get; set; } = null!;
}
