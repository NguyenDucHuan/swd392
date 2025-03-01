using System;
using System.Collections.Generic;

namespace BBSS.Domain.Entities;

public partial class BlindBoxFeature
{
    public int BlindBoxFeatureId { get; set; }

    public int BlindBoxId { get; set; }

    public int FeatureId { get; set; }

    public virtual BlindBox BlindBox { get; set; } = null!;

    public virtual Feature Feature { get; set; } = null!;
}
