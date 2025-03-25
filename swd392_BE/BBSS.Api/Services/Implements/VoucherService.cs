using AutoMapper;
using BBSS.Api.Helper;
using BBSS.Api.Models.VoucherModel;
using BBSS.Api.Services.Interfaces;
using BBSS.Domain.Entities;
using BBSS.Repository.Interfaces;

namespace BBSS.Api.Services.Implements
{

    public class VoucherService : IVoucherService
    {
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;

        public VoucherService(IUnitOfWork uow, IMapper mapper)
        {
            _uow = uow;
            _mapper = mapper;
        }

        public async Task<MethodResult<VoucherResponse>> GetVoucherByIdAsync(int id)
        {
            var voucher = await _uow.GetRepository<Voucher>().SingleOrDefaultAsync(
                predicate: v => v.VoucherId == id
            );
            if (voucher == null)
                return new MethodResult<VoucherResponse>.Failure("Voucher not found", 404);

            var response = _mapper.Map<VoucherResponse>(voucher);
            return new MethodResult<VoucherResponse>.Success(response);
        }

        public async Task<MethodResult<List<VoucherResponse>>> GetVouchersAsync()
        {
            var vouchers = await _uow.GetRepository<Voucher>().GetListAsync(
                selector: v => _mapper.Map<VoucherResponse>(v)
            );
            return new MethodResult<List<VoucherResponse>>.Success(vouchers.ToList());
        }

        public async Task<MethodResult<VoucherResponse>> CreateVoucherAsync(VoucherRequest request)
        {
            var voucher = _mapper.Map<Voucher>(request);
            voucher.Status = true;

            await _uow.GetRepository<Voucher>().InsertAsync(voucher);
            await _uow.CommitAsync();

            var response = _mapper.Map<VoucherResponse>(voucher);
            return new MethodResult<VoucherResponse>.Success(response);
        }

        public async Task<MethodResult<string>> UpdateVoucherAsync(int id, VoucherRequest request)
        {
            var voucher = await _uow.GetRepository<Voucher>().SingleOrDefaultAsync(
                predicate: v => v.VoucherId == id
            );
            if (voucher == null)
                return new MethodResult<string>.Failure("Voucher not found", 404);

            _mapper.Map(request, voucher);
            _uow.GetRepository<Voucher>().UpdateAsync(voucher);
            await _uow.CommitAsync();

            return new MethodResult<string>.Success("Voucher updated successfully");
        }

        public async Task<MethodResult<string>> DeleteVoucherAsync(int id)
        {
            var voucher = await _uow.GetRepository<Voucher>().SingleOrDefaultAsync(
                predicate: v => v.VoucherId == id
            );
            if (voucher == null)
                return new MethodResult<string>.Failure("Voucher not found", 404);

            _uow.GetRepository<Voucher>().DeleteAsync(voucher);
            await _uow.CommitAsync();

            return new MethodResult<string>.Success("Voucher deleted successfully");
        }

        public async Task<MethodResult<List<VoucherResponse>>> CheckExpiredVouchersAsync()
        {
            var expiredVouchers = await _uow.GetRepository<Voucher>().GetListAsync(
                predicate: v => v.Status == true && v.EndDate < DateTime.Now,
                selector: v => _mapper.Map<VoucherResponse>(v)
            );

            foreach (var expired in expiredVouchers)
            {
                var entity = await _uow.GetRepository<Voucher>().SingleOrDefaultAsync(
                    predicate: v => v.VoucherId == expired.VoucherId
                );
                entity.Status = false;
                _uow.GetRepository<Voucher>().UpdateAsync(entity);
            }

            await _uow.CommitAsync();
            return new MethodResult<List<VoucherResponse>>.Success(expiredVouchers.ToList());
        }
    }


}
