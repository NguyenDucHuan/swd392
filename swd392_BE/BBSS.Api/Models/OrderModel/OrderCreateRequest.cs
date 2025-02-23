using System.ComponentModel.DataAnnotations;

namespace BBSS.Api.Models.OrderModel
{
    public class OrderCreateRequest
    {
        [Phone]
        public string Phone { get; set; }
        public string Address { get; set; }
        public int? VoucherId { get; set; }
        public List<OrderDetailCreateRequest> BlindBoxs { get; set; }  
    }

    public class OrderDetailCreateRequest
    {
        public int PackageId { get; set; }
        public int Number { get; set; }
        public int Quantity { get; set; }
    }
}
