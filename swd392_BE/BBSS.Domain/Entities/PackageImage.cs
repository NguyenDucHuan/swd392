using System;
using System.Collections.Generic;

namespace BBSS.Domain.Entities;

public partial class PackageImage
{
    public int PackageImageId { get; set; }

    public string Url { get; set; } = null!;

    public int PackageId { get; set; }

    public virtual Package Package { get; set; } = null!;
}
