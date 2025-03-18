using AutoMapper;
using BBSS.Api.Models.AuthenticationModel;
using BBSS.Api.Models.UserModel;
using BBSS.Api.ViewModels;
using BBSS.Domain.Entities;

namespace BBSS.Api.Mapper
{
    public class TransactionProfile : Profile
    {
        public TransactionProfile()
        {            
            CreateMap<Transaction, TransactionViewModel>();
        }
    }
}
