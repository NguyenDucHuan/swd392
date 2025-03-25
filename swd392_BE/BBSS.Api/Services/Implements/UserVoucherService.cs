using AutoMapper;
using BBSS.Api.Helper;
using BBSS.Api.Models.UserVoucherModel;
using BBSS.Api.Services.Interfaces;
using BBSS.Domain.Entities;
using BBSS.Repository.Interfaces;

namespace BBSS.Api.Services.Implements
{
    public class UserVoucherService : IUserVoucherService
    {
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;

        public UserVoucherService(IUnitOfWork uow, IMapper mapper)
        {
            _uow = uow;
            _mapper = mapper;
        }

        public async Task<MethodResult<UserVoucherResponse>> GetUserVoucherByIdAsync(int id)
        {
            var userVoucher = await _uow.GetRepository<UserVoucher>().SingleOrDefaultAsync(
                predicate: uv => uv.UserVoucherId == id
            );
            if (userVoucher == null)
                return new MethodResult<UserVoucherResponse>.Failure("User voucher not found", 404);

            var response = _mapper.Map<UserVoucherResponse>(userVoucher);
            return new MethodResult<UserVoucherResponse>.Success(response);
        }

        public async Task<MethodResult<List<UserVoucherResponse>>> GetUserVouchersByUserIdAsync(int userId)
        {
            var userVouchers = await _uow.GetRepository<UserVoucher>().GetListAsync(
                selector: uv => _mapper.Map<UserVoucherResponse>(uv),
                predicate: uv => uv.UserId == userId
            );
            return new MethodResult<List<UserVoucherResponse>>.Success(userVouchers.ToList());
        }

        public async Task<MethodResult<UserVoucherResponse>> AssignVoucherToUserAsync(UserVoucherRequest request)
        {
            var userVoucher = _mapper.Map<UserVoucher>(request);
            userVoucher.RedeemedDate = null; // Chưa được đổi
            userVoucher.Status = false; // Mặc định chưa sử dụng

            await _uow.GetRepository<UserVoucher>().InsertAsync(userVoucher);
            await _uow.CommitAsync();

            var response = _mapper.Map<UserVoucherResponse>(userVoucher);
            return new MethodResult<UserVoucherResponse>.Success(response);
        }

        public async Task<MethodResult<string>> RedeemUserVoucherAsync(int id)
        {
            var userVoucher = await _uow.GetRepository<UserVoucher>().SingleOrDefaultAsync(
                predicate: uv => uv.UserVoucherId == id
            );
            if (userVoucher == null)
                return new MethodResult<string>.Failure("User voucher not found", 404);

            if (userVoucher.Status)
                return new MethodResult<string>.Failure("Voucher already redeemed", 400);

            userVoucher.Status = true; // Đánh dấu là đã sử dụng
            userVoucher.RedeemedDate = DateTime.UtcNow; // Ghi nhận thời gian sử dụng
            _uow.GetRepository<UserVoucher>().UpdateAsync(userVoucher);
            await _uow.CommitAsync();

            return new MethodResult<string>.Success("Voucher redeemed successfully");
        }

        public async Task<MethodResult<string>> CheckVoucherStatusAsync(int id)
        {
            var userVoucher = await _uow.GetRepository<UserVoucher>().SingleOrDefaultAsync(
                predicate: uv => uv.UserVoucherId == id
            );

            if (userVoucher == null)
                return new MethodResult<string>.Failure("User voucher not found", 404);

            if (userVoucher.RedeemedDate.HasValue)
                return new MethodResult<string>.Success($"Voucher redeemed on {userVoucher.RedeemedDate.Value}");

            return new MethodResult<string>.Success("Voucher is valid and not redeemed");
        }
    }


}
