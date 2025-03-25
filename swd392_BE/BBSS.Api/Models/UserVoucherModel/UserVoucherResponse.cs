namespace BBSS.Api.Models.UserVoucherModel
{
    public class UserVoucherResponse
    {
        public int UserVoucherId { get; set; }
        public int UserId { get; set; }
        public int VoucherId { get; set; }
        public DateTime AssignedDate { get; set; }
        public bool IsRedeemed { get; set; }
    }

}
