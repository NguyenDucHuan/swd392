namespace BBSS.Api.ViewModels
{
    public class UserViewModel
    {
        public int UserId { get; set; }

        public string Name { get; set; } = null!;

        public string Email { get; set; } = null!;

        public decimal? WalletBalance { get; set; }

        public string? Role { get; set; }

        public DateOnly? DateOfBirth { get; set; }

        public bool ConfirmedEmail { get; set; }

        public bool? Status { get; set; }

        public string? Phone { get; set; }

        public string? Image { get; set; }

        public int AmountInventoryItems { get; set; }
    }
}
