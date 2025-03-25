using AutoMapper;
using BBSS.Api.Models.VoucherModel;
using BBSS.Domain.Entities;

namespace BBSS.Api.Mapper
{
    public class VoucherProfile : Profile
    {
        public VoucherProfile()
        {
            CreateMap<Voucher, VoucherResponse>();
            CreateMap<VoucherRequest, Voucher>();
        }
    }

}
