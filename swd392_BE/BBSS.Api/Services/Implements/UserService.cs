using AutoMapper;
using BBSS.Api.Helper;
using BBSS.Api.Models.AuthenticationModel;
using BBSS.Api.Services.Interfaces;
using BBSS.Domain.Entities;
using BBSS.Repository.Interfaces;

namespace BBSS.Api.Services.Implements
{
    public class UserService : IUserService
    {
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;
        private readonly IEmailService _emailService;

        public UserService(IUnitOfWork uow, IMapper mapper, IEmailService emailService)
        {
            _uow = uow;
            _mapper = mapper;
            _emailService = emailService;
        }

        
    }
}
