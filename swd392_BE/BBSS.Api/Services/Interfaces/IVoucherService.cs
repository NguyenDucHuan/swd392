using BBSS.Api.Helper;
using BBSS.Api.Models.VoucherModel;

namespace BBSS.Api.Services.Interfaces
{
    public interface IVoucherService
    {
        Task<MethodResult<VoucherResponse>> GetVoucherByIdAsync(int id);
        Task<MethodResult<List<VoucherResponse>>> GetVouchersAsync();
        Task<MethodResult<VoucherResponse>> CreateVoucherAsync(VoucherRequest request);
        Task<MethodResult<string>> UpdateVoucherAsync(int id, VoucherRequest request);
        Task<MethodResult<string>> DeleteVoucherAsync(int id);
        Task<MethodResult<List<VoucherResponse>>> CheckExpiredVouchersAsync();
    }


}
