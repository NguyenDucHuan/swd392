using AutoMapper;
using BBSS.Api.Constants;
using BBSS.Api.Models.AuthenticationModel;
using BBSS.Domain.Entities;
using Microsoft.VisualBasic;
using System.Security.Principal;

namespace BBSS.Api.Mapper
{
    public class UserProfile : Profile
    {
        public UserProfile()
        {
            CreateMap<SignupRequest, User>()
                  .ForMember(dest => dest.Password, opt => opt.MapFrom(src => BCrypt.Net.BCrypt.HashPassword(src.Password)))
                  .ForMember(dest => dest.WalletBalance, opt => opt.MapFrom(src => 0))
                  .ForMember(dest => dest.Role, opt => opt.MapFrom(src => UserConstant.USER_ROLE_USER))
                  .ForMember(dest => dest.ConfirmedEmail, opt => opt.MapFrom(src => UserConstant.USER_CONFIRMED_EMAIL_INACTIVE))
                  .ForMember(dest => dest.Status, opt => opt.MapFrom(src => UserConstant.USER_STATUS_ACTIVE));
        }
    }
}
