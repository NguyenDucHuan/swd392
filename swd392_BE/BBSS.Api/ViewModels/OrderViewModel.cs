namespace BBSS.Api.ViewModels
{
    public class OrderViewModel
    {
        public int OrderId { get; set; }

        public string Address { get; set; } = null!;

        public string Phone { get; set; } = null!;

        public decimal TotalAmount { get; set; }

        public string Status { get; set; } = null!;

        public DateTime OrderDate { get; set; }

        public List<OrderDetailViewModel> Details { get; set; } = null!;
    }

    public class OrderDetailViewModel
    {
        public int OrderDetailId { get; set; }

        public int BlindBoxId { get; set; }
       
        public decimal Price { get; set; }

        public int Quantity { get; set; }
    }
}
