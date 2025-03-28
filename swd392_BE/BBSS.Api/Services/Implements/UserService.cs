using AutoMapper;
using BBSS.Api.Helper;
using BBSS.Api.Models.AuthenticationModel;
using BBSS.Api.Models.PackageModel;
using BBSS.Api.Models.UserModel;
using BBSS.Api.Services.Interfaces;
using BBSS.Api.ViewModels;
using BBSS.Domain.Entities;
using BBSS.Domain.Paginate;
using BBSS.Repository.Interfaces;
using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;

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

        public async Task<MethodResult<string>> DisableUserAsync()
        {

            return new MethodResult<string>.Success("Update profile successfully");
        }

        public async Task<MethodResult<UserResponse>> CreateUserAsync(UserRequest request)
        {
            try
            {
                // Ánh xạ từ request sang entity
                var user = _mapper.Map<User>(request);

                await _uow.GetRepository<User>().InsertAsync(user);
                await _uow.CommitAsync();

                // Ánh xạ từ entity sang response
                var response = _mapper.Map<UserResponse>(user);
                return new MethodResult<UserResponse>.Success(response);
            }
            catch (Exception ex)
            {
                return new MethodResult<UserResponse>.Failure(ex.Message, StatusCodes.Status500InternalServerError);
            }
        }

        // Cập nhật hồ sơ cá nhân


        // Cập nhật thông tin người dùng
        public async Task<MethodResult<string>> UpdateUserAsync(int id, UserRequest request)
        {
            try
            {
                // Sử dụng overload cho thực thể đầy đủ
                var user = await _uow.GetRepository<User>().SingleOrDefaultAsync(
                    predicate: u => u.UserId == id
                );

                if (user == null)
                    return new MethodResult<string>.Failure("User not found", StatusCodes.Status404NotFound);

                // Ánh xạ từ request sang user
                _mapper.Map(request, user);

                _uow.GetRepository<User>().UpdateAsync(user);
                await _uow.CommitAsync();

                return new MethodResult<string>.Success("User updated successfully");
            }
            catch (Exception ex)
            {
                return new MethodResult<string>.Failure(ex.Message, StatusCodes.Status500InternalServerError);
            }
        }

        // Cập nhật trạng thái người dùng
        public async Task<MethodResult<string>> UpdateUserStatusAsync(int id, UpdateStatusRequest request)
        {
            try
            {
                // Chọn đúng overload để chỉ lấy thực thể
                var user = await _uow.GetRepository<User>().SingleOrDefaultAsync(
                    predicate: u => u.UserId == id
                );

                if (user == null)
                    return new MethodResult<string>.Failure("User not found", StatusCodes.Status404NotFound);

                // Cập nhật trạng thái
                _mapper.Map(request, user);

                _uow.GetRepository<User>().UpdateAsync(user);
                await _uow.CommitAsync();

                return new MethodResult<string>.Success("User status updated successfully");
            }
            catch (Exception ex)
            {
                return new MethodResult<string>.Failure(ex.Message, StatusCodes.Status500InternalServerError);
            }
        }

        public async Task<MethodResult<IPaginate<UserViewModel>>> GetAllUsersAsync(PaginateModel model)
        {
            int page = model.page > 0 ? model.page : 1;
            int size = model.size > 0 ? model.size : 10;
            string search = model.search?.ToLower() ?? string.Empty;
            string filter = model.filter?.ToLower() ?? string.Empty;

            Expression<Func<User, bool>> predicate = p =>
                (string.IsNullOrEmpty(search) || p.Name.Contains(search) ||
                                                 p.Email.Contains(search)) &&
                (string.IsNullOrEmpty(filter) || filter == p.Role.ToLower());

            var users = await _uow.GetRepository<User>().GetPagingListAsync(
                selector: s => _mapper.Map<UserViewModel>(s),
                predicate: predicate,
                include: i => i.Include(p => p.InventoryItems),
                orderBy: BuildOrderBy(model.sortBy),
                page: page,
                size: size
            );

            return new MethodResult<IPaginate<UserViewModel>>.Success(users);
        }

        private Func<IQueryable<User>, IOrderedQueryable<User>> BuildOrderBy(string sortBy)
        {
            if (string.IsNullOrEmpty(sortBy)) return null;

            return sortBy.ToLower() switch
            {
                "wallet" => q => q.OrderBy(p => p.WalletBalance),
                "wallet_desc" => q => q.OrderByDescending(p => p.WalletBalance),
                "date" => q => q.OrderBy(p => p.DateOfBirth),
                "date_desc" => q => q.OrderByDescending(p => p.DateOfBirth),
                _ => q => q.OrderByDescending(p => p.UserId) // Default sort
            };
        }
    }
}
