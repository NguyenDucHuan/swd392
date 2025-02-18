using System;
using System.Collections.Generic;

namespace BBSS.Domain.Entities;

public partial class BlindBoxImage
{
    public int BlindBoxImageId { get; set; }

    public string Url { get; set; } = null!;

    public int BlindBoxId { get; set; }

    public virtual BlindBox BlindBox { get; set; } = null!;
}
