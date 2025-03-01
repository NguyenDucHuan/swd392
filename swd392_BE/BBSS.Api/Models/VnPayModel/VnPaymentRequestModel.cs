
namespace BBSS.Api.Models.VnPayModel
{
    public class VnPaymentRequestModel
    {
        public int OrderId { get; set; }
        public float Amount { get; set; }
        public DateTime CreatedDate { get; set; }
    }
}
