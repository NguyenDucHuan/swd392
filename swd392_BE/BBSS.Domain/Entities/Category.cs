using System;
using System.Collections.Generic;

namespace BBSS.Domain.Entities;

public partial class Category
{
    public int CategoryId { get; set; }

    public string Name { get; set; } = null!;

    public virtual ICollection<Package> Packages { get; set; } = new List<Package>();
}
