using BBSS.Api.Models.UserVoucherModel;
using BBSS.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BBSS.Api.Controllers
{
    [ApiController]
    [Route("api/user-voucher")]
    public class UserVoucherController : ControllerBase
    {
        private readonly IUserVoucherService _userVoucherService;

        public UserVoucherController(IUserVoucherService userVoucherService)
        {
            _userVoucherService = userVoucherService;
        }

        // Lấy thông tin UserVoucher theo ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserVoucherById(int id)
        {
            var result = await _userVoucherService.GetUserVoucherByIdAsync(id);
            return result.Match<IActionResult>(
                (errorMessage, statusCode) => StatusCode(statusCode, errorMessage),
                data => Ok(data)
            );
        }

        // Lấy danh sách UserVoucher theo UserId
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserVouchersByUserId(int userId)
        {
            var result = await _userVoucherService.GetUserVouchersByUserIdAsync(userId);
            return result.Match<IActionResult>(
                (errorMessage, statusCode) => StatusCode(statusCode, errorMessage),
                data => Ok(data)
            );
        }

        // Gán voucher cho một user
        [HttpPost("assign")]
        public async Task<IActionResult> AssignVoucherToUser([FromBody] UserVoucherRequest request)
        {
            var result = await _userVoucherService.AssignVoucherToUserAsync(request);
            return result.Match<IActionResult>(
                (errorMessage, statusCode) => StatusCode(statusCode, errorMessage),
                data => Ok(data)
            );
        }

        // Đổi một voucher
        [HttpPost("redeem/{id}")]
        public async Task<IActionResult> RedeemVoucher(int id)
        {
            var result = await _userVoucherService.RedeemUserVoucherAsync(id);
            return result.Match<IActionResult>(
                (errorMessage, statusCode) => StatusCode(statusCode, errorMessage),
                message => Ok(message)
            );
        }

        // Kiểm tra trạng thái của voucher
        [HttpGet("status/{id}")]
        public async Task<IActionResult> CheckVoucherStatus(int id)
        {
            var result = await _userVoucherService.CheckVoucherStatusAsync(id);
            return result.Match<IActionResult>(
                (errorMessage, statusCode) => StatusCode(statusCode, errorMessage),
                data => Ok(data)
            );
        }
    }

}
