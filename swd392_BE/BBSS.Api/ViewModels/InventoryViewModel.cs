using BBSS.Domain.Entities;

namespace BBSS.Api.ViewModels
{
    public class InventoryViewModel
    {
        public int InventoryItemId { get; set; }

        public DateTime AddDate { get; set; }

        public int UserId { get; set; }

        public int BlindBoxId { get; set; }

        public string? Status { get; set; }

        public BlindBoxViewModel BlindBox { get; set; }        
    }
}
