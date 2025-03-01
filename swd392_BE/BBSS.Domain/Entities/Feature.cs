using System;
using System.Collections.Generic;

namespace BBSS.Domain.Entities;

public partial class Feature
{
    public int FeatureId { get; set; }

    public string Description { get; set; } = null!;

    public string? Type { get; set; }

    public virtual ICollection<BlindBoxFeature> BlindBoxFeatures { get; set; } = new List<BlindBoxFeature>();
}
