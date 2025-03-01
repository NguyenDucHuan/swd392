namespace BBSS.Api.ViewModels
{
    public class ProfileViewModel
    {
        public int UserId { get; set; }

        public string Name { get; set; }

        public string Email { get; set; } 

        public decimal? WalletBalance { get; set; }

        public DateOnly? DateOfBirth { get; set; }

        public bool ConfirmedEmail { get; set; }

        public string? Phone { get; set; }

        public string? Image { get; set; }
    }
}
