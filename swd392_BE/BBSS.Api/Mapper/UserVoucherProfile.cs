using AutoMapper;

using BBSS.Api.Models.UserVoucherModel;
using BBSS.Domain.Entities;

namespace BBSS.Api.Mapper
{
    public class UserVoucherProfile : Profile
    {
        public UserVoucherProfile()
        {
            CreateMap<UserVoucher, UserVoucherResponse>();
            CreateMap<UserVoucherRequest, UserVoucher>();
        }
    }

}
