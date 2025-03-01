using AutoMapper;
using BBSS.Api.Helper;
using BBSS.Api.Models.AuthenticationModel;
using BBSS.Api.Models.UserModel;
using BBSS.Api.Services.Interfaces;
using BBSS.Api.ViewModels;
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

        public async Task<MethodResult<ProfileViewModel>> GetProfileAsync(string email)
        {
            var user = await _uow.GetRepository<User>().SingleOrDefaultAsync(
                    predicate: p => p.Email == email
                );

            var result = _mapper.Map<ProfileViewModel>(user);
            return new MethodResult<ProfileViewModel>.Success(result);
        }

        public async Task<MethodResult<string>> UpdateProfileAsync(string email, UpdateProfileRequest request)
        {
            var user = await _uow.GetRepository<User>().SingleOrDefaultAsync(
                    predicate: p => p.Email == email
                );

            _mapper.Map(request, user);
            _uow.GetRepository<User>().UpdateAsync(user);
            _uow.Commit();
            return new MethodResult<string>.Success("Update profile successfully");
        }
    }
}
