using System.ComponentModel.DataAnnotations;

namespace BBSS.Api.Models.UserModel
{
    public class UpdateProfileRequest
    {
        [Required]
        public string Name { get; set; }
        [Required]
        public DateOnly DateOfBirth { get; set; }
        [Phone]
        public string? Phone { get; set; }
    }
}
