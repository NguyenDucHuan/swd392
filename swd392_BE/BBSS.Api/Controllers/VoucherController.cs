using BBSS.Api.Models.VoucherModel;
using BBSS.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BBSS.Api.Controllers
{
    [ApiController]
    [Route("api/voucher")]
    public class VoucherController : ControllerBase
    {
        private readonly IVoucherService _voucherService;

        public VoucherController(IVoucherService voucherService)
        {
            _voucherService = voucherService;
        }

        // Lấy thông tin voucher theo ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetVoucherById(int id)
        {
            var result = await _voucherService.GetVoucherByIdAsync(id);
            return result.Match<IActionResult>(
                (errorMessage, statusCode) => StatusCode(statusCode, errorMessage),
                data => Ok(data)
            );
        }

        // Lấy danh sách tất cả các voucher
        [HttpGet("all")]
        public async Task<IActionResult> GetAllVouchers()
        {
            var result = await _voucherService.GetVouchersAsync();
            return result.Match<IActionResult>(
                (errorMessage, statusCode) => StatusCode(statusCode, errorMessage),
                data => Ok(data)
            );
        }

        // Tạo mới một voucher
        [HttpPost("create")]
        public async Task<IActionResult> CreateVoucher([FromBody] VoucherRequest request)
        {
            var result = await _voucherService.CreateVoucherAsync(request);
            return result.Match<IActionResult>(
                (errorMessage, statusCode) => StatusCode(statusCode, errorMessage),
                data => Ok(data)
            );
        }

        // Cập nhật thông tin voucher
        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateVoucher(int id, [FromBody] VoucherRequest request)
        {
            var result = await _voucherService.UpdateVoucherAsync(id, request);
            return result.Match<IActionResult>(
                (errorMessage, statusCode) => StatusCode(statusCode, errorMessage),
                data => Ok(data)
            );
        }

        // Xóa một voucher
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteVoucher(int id)
        {
            var result = await _voucherService.DeleteVoucherAsync(id);
            return result.Match<IActionResult>(
                (errorMessage, statusCode) => StatusCode(statusCode, errorMessage),
                data => Ok(data)
            );
        }

        // Kiểm tra và cập nhật các voucher đã hết hạn
        [HttpPost("check-expired")]
        public async Task<IActionResult> CheckExpiredVouchers()
        {
            var result = await _voucherService.CheckExpiredVouchersAsync();
            return Ok(new { message = "Expired vouchers updated.", data = result });
        }
    }


}
