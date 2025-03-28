namespace BBSS.Api.Models.OrderModel
{
    public class OrderWheelCreateRequest
    {
        public string Phone { get; set; }
        public string Address { get; set; }
        public decimal TotalAmount { get; set; }
        public List<int> BlindBoxIds { get; set; } = new List<int>();
    }
}
