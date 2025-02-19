

using AutoMapper;
using BBSS.Api.Constants;
using BBSS.Api.Helper;
using BBSS.Api.Models.AuthenticationModel;
using BBSS.Api.Services.Interfaces;
using BBSS.Api.ViewModels;
using BBSS.Domain.Entities;
using BBSS.Repository.Interfaces;
using System.Security.Principal;

namespace BBSS.Api.Services.Implements
{
	public class AuthenticationService : IAuthenticationService
	{
        private readonly IUnitOfWork _uow;
        private readonly ITokenGenerator _tokenGenerator;
        private readonly IUserService _userService;
        private readonly IMapper _mapper;
        private readonly IEmailService _emailService;

        public AuthenticationService(IUnitOfWork uow, ITokenGenerator tokenGenerator,
            IUserService userService, IMapper mapper, IEmailService emailService)
        {
            _uow = uow;
            _tokenGenerator = tokenGenerator;
            _userService = userService;
            _mapper = mapper;
            _emailService = emailService;
        }

        public async Task<MethodResult<string>> SignUpAsync(SignupRequest request)
        {
            try
            {
                var dupeEmailUser = await _uow.GetRepository<User>().SingleOrDefaultAsync(
                    predicate: p => p.Email == request.Email
                );
                if (dupeEmailUser != null)
                {
                    return new MethodResult<string>.Failure("Email already in use", StatusCodes.Status400BadRequest);
                }

                var dupePhoneUser = await _uow.GetRepository<User>().SingleOrDefaultAsync(
                    predicate: p => p.Phone == request.Phone
                );
                if (dupePhoneUser != null)
                {
                    return new MethodResult<string>.Failure("Phone number already in use", StatusCodes.Status400BadRequest);
                }

                var user = _mapper.Map<User>(request);
                await _uow.GetRepository<User>().InsertAsync(user);
                await _uow.CommitAsync();

                return await _emailService.SendAccountVerificationEmailAsync(user);
            }
            catch (Exception e)
            {
                return new MethodResult<string>.Failure(e.ToString(), StatusCodes.Status500InternalServerError);
            }

        }

        public async Task<MethodResult<SignInViewModel>> SigninAsync(LoginRequest request)
        {
            var user = await _uow.GetRepository<User>().SingleOrDefaultAsync(
                predicate: p => p.Email == request.Email
            );
            if ( user == null )
            {
                return new MethodResult<SignInViewModel>.Failure("Invalid email", StatusCodes.Status400BadRequest);
            }

            var correctedPassword = BCrypt.Net.BCrypt.Verify(request.Password, user.Password);
            if (!correctedPassword)
            {
                return new MethodResult<SignInViewModel>.Failure("Password is not correct", 400);
            }

            if (user.Status == UserConstant.USER_STATUS_INACTIVE)
            {
                return new MethodResult<SignInViewModel>.Failure("Your account has been inactivated", 400);
            }

            var result = new SignInViewModel
            {
                AccessToken = await _tokenGenerator.GenerateAccessToken(user),
                RefreshToken = await _tokenGenerator.GenerateRefreshToken()
            };

            return new MethodResult<SignInViewModel>.Success(result);
        }         
    }
}
