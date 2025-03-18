using System.ComponentModel.DataAnnotations;

namespace BBSS.Api.Models.CategoryModel
{
    public class CategoryRequest
    {
        [Required]
        public string Name { get; set; }
    }
}
