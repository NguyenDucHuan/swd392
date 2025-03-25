namespace BBSS.Api.Models.UserModel
{
    public class UserResponse
    {
        public int UserId { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
        public decimal WalletBalance { get; set; }
        public DateTime DateOfBirth { get; set; }
        public bool? Status { get; set; }
    }
}
