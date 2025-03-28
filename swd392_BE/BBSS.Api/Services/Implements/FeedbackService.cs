using AutoMapper;
using BBSS.Api.Constants;
using BBSS.Api.Helper;
using BBSS.Api.Models.FeedbackModel;
using BBSS.Api.Models.PackageModel;
using BBSS.Api.Services.Interfaces;
using BBSS.Domain.Entities;
using BBSS.Domain.Paginate;
using BBSS.Repository.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace BBSS.Api.Services.Implements
{
    public class FeedbackService : IFeedbackService
    {
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;
        private readonly ICloudinaryService _cloudinaryService;

        public FeedbackService(IUnitOfWork uow, IMapper mapper, ICloudinaryService cloudinaryService)
        {
            _uow = uow;
            _mapper = mapper;
            _cloudinaryService = cloudinaryService;
        }

        // Tạo phản hồi
        public async Task<MethodResult<string>> CreateFeedbackAsync(FeedbackRequest request)
        {
            try
            {
                var hasOrder = await _uow.GetRepository<Order>().GetListAsync(
                    predicate: o => o.UserId == request.UserId
                );

                if (!hasOrder.Any())
                {
                    return new MethodResult<string>.Failure("Người dùng chưa mua hàng.", StatusCodes.Status400BadRequest);
                }

                // Upload ảnh lên Cloudinary nếu có
                string imageUrl = null;
                if (request.Image != null)
                {
                    imageUrl = await _cloudinaryService.UploadImageAsync(request.Image);
                    if (string.IsNullOrEmpty(imageUrl))
                    {
                        return new MethodResult<string>.Failure("Không thể upload ảnh.", StatusCodes.Status500InternalServerError);
                    }
                }

                var feedback = _mapper.Map<Feedback>(request);
                feedback.Image = imageUrl;
                await _uow.GetRepository<Feedback>().InsertAsync(feedback);
                await _uow.CommitAsync();

                return new MethodResult<string>.Success("Phản hồi đã được tạo thành công.");
            }
            catch (Exception ex)
            {
                return new MethodResult<string>.Failure($"Lỗi khi tạo phản hồi: {ex.Message}", StatusCodes.Status500InternalServerError);
            }
        }

        // Lấy danh sách phản hồi theo sản phẩm
        public async Task<MethodResult<IPaginate<FeedbackResponse>>> GetFeedbackByProductAsync(int productId, PaginateModel model, DateOnly? date, int? minVote, int? maxVote)
        {
            try
            {
                int page = model.page > 0 ? model.page : 1;
                int size = model.size > 0 ? model.size : 10;
                string search = model.search?.ToLower() ?? string.Empty;
                string filter = model.filter?.ToLower() ?? string.Empty;

                Expression<Func<Feedback, bool>> predicate = p =>
                        (string.IsNullOrEmpty(search) || p.BlindBox.Package.PakageCode.Contains(search) ||
                                                         p.BlindBox.Package.Name.Contains(search)) &&
                        (string.IsNullOrEmpty(filter) || string.Equals(model.filter, p.BlindBox.Package.CategoryId.ToString())) &&
                        (date == null || DateOnly.FromDateTime(p.CreateDate) == date) &&
                        (minVote == null || p.FeedbackVotes.Count(x => x.VoteType == FeedbackConstant.FEEDBACK_VOTETYPE_UPVOTE) >= minVote) &&
                        (maxVote == null || p.FeedbackVotes.Count(x => x.VoteType == FeedbackConstant.FEEDBACK_VOTETYPE_UPVOTE) <= maxVote) &&
                        p.BlindBox.BlindBoxId == productId;

                var feedbacks = await _uow.GetRepository<Feedback>().GetPagingListAsync(
                    selector: f => _mapper.Map<FeedbackResponse>(f),
                    predicate: predicate,
                    include: f => f.Include(x => x.User).Include(x => x.BlindBox).ThenInclude(b => b.BlindBoxFeatures).Include(x => x.BlindBox.Package).Include(x => x.FeedbackVotes),
                    orderBy: BuildOrderBy(model.sortBy),
                    page: page,
                    size: size
                );

                return new MethodResult<IPaginate<FeedbackResponse>>.Success(feedbacks);
            }
            catch (Exception ex)
            {
                return new MethodResult<IPaginate<FeedbackResponse>>.Failure($"Lỗi khi lấy danh sách phản hồi: {ex.Message}", StatusCodes.Status500InternalServerError);
            }
        }

        // Lấy tất cả phản hồi
        public async Task<MethodResult<IPaginate<FeedbackResponse>>> GetAllFeedbacksAsync(PaginateModel model, DateOnly? date, int? minVote, int? maxVote)
        {
            try
            {
                int page = model.page > 0 ? model.page : 1;
                int size = model.size > 0 ? model.size : 10;
                string search = model.search?.ToLower() ?? string.Empty;
                string filter = model.filter?.ToLower() ?? string.Empty;

                Expression<Func<Feedback, bool>> predicate = p =>
                        (string.IsNullOrEmpty(search) || p.BlindBox.Package.PakageCode.Contains(search) ||
                                                         p.BlindBox.Package.Name.Contains(search)) &&
                        (string.IsNullOrEmpty(filter) || string.Equals(model.filter, p.BlindBox.Package.CategoryId.ToString())) &&
                        (date == null || DateOnly.FromDateTime(p.CreateDate) == date) &&
                        (minVote == null || p.FeedbackVotes.Count(x => x.VoteType == FeedbackConstant.FEEDBACK_VOTETYPE_UPVOTE) >= minVote) &&
                        (maxVote == null || p.FeedbackVotes.Count(x => x.VoteType == FeedbackConstant.FEEDBACK_VOTETYPE_UPVOTE) <= maxVote);

                var feedbacks = await _uow.GetRepository<Feedback>().GetPagingListAsync(
                    selector: f => _mapper.Map<FeedbackResponse>(f),
                    predicate: predicate,
                    include: f => f.Include(x => x.User).Include(x => x.BlindBox).ThenInclude(b => b.BlindBoxFeatures).Include(x => x.BlindBox.Package).Include(x => x.FeedbackVotes),
                    orderBy: BuildOrderBy(model.sortBy),
                    page: page,
                    size: size
                );

                return new MethodResult<IPaginate<FeedbackResponse>>.Success(feedbacks);
            }
            catch (Exception ex)
            {
                return new MethodResult<IPaginate<FeedbackResponse>>.Failure($"Lỗi khi lấy tất cả phản hồi: {ex.Message}", StatusCodes.Status500InternalServerError);
            }
        }

        private Func<IQueryable<Feedback>, IOrderedQueryable<Feedback>> BuildOrderBy(string sortBy)
        {
            if (string.IsNullOrEmpty(sortBy)) return null;

            return sortBy.ToLower() switch
            {
                "vote" => q => q.OrderBy(p => p.FeedbackVotes.Count(x => x.VoteType == FeedbackConstant.FEEDBACK_VOTETYPE_UPVOTE)),
                "vote_desc" => q => q.OrderByDescending(p => p.FeedbackVotes.Count(x => x.VoteType == FeedbackConstant.FEEDBACK_VOTETYPE_UPVOTE)),
                "date" => q => q.OrderBy(p => p.CreateDate),
                "date_desc" => q => q.OrderByDescending(p => p.CreateDate),
                _ => q => q.OrderByDescending(p => p.FeedbackId) // Default sort
            };
        }

        // Cập nhật trạng thái phản hồi
        public async Task<MethodResult<string>> UpdateFeedbackStatusAsync(int feedbackId, UpdateFeedbackStatusRequest request)
        {
            try
            {
                var feedback = await _uow.GetRepository<Feedback>().SingleOrDefaultAsync(
                    predicate: f => f.FeedbackId == feedbackId,
                    include: f => f.Include(x => x.BlindBox).Include(x => x.User)
                );

                if (feedback == null)
                {
                    return new MethodResult<string>.Failure("Phản hồi không tồn tại.", StatusCodes.Status404NotFound);
                }

                feedback.Status = request.Status;
                _uow.GetRepository<Feedback>().UpdateAsync(feedback);
                await _uow.CommitAsync();

                return new MethodResult<string>.Success("Trạng thái phản hồi đã được cập nhật.");
            }
            catch (Exception ex)
            {
                return new MethodResult<string>.Failure($"Lỗi khi cập nhật trạng thái phản hồi: {ex.Message}", StatusCodes.Status500InternalServerError);
            }
        }
    }
}
