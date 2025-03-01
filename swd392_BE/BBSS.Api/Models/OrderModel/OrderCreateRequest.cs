using System.ComponentModel.DataAnnotations;

namespace BBSS.Api.Models.OrderModel
{
    public class OrderCreateRequest
    {
        [Phone]
        public string Phone { get; set; }
        public string Address { get; set; }
        public List<OrderDetailCreateRequest> Products { get; set; }  = new List<OrderDetailCreateRequest>();
    }

    public class OrderDetailCreateRequest
    {
        public string Type { get; set; }
        public string PakageCode { get; set; }
        public int Quantity { get; set; }
    }
}
