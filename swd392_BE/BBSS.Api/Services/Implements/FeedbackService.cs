using AutoMapper;
using BBSS.Api.Helper;
using BBSS.Api.Models.FeedbackModel;
using BBSS.Api.Services.Interfaces;
using BBSS.Domain.Entities;
using BBSS.Repository.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BBSS.Api.Services.Implements
{
    public class FeedbackService : IFeedbackService
    {
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;

        public FeedbackService(IUnitOfWork uow, IMapper mapper)
        {
            _uow = uow;
            _mapper = mapper;
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

                var feedback = _mapper.Map<Feedback>(request);
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
        public async Task<MethodResult<List<FeedbackResponse>>> GetFeedbackByProductAsync(int productId)
        {
            try
            {
                var feedbacks = await _uow.GetRepository<Feedback>().GetListAsync(
                    predicate: f => f.BlindBox.BlindBoxId == productId,
                    selector: f => _mapper.Map<FeedbackResponse>(f),
                    include: f => f.Include(x => x.User).Include(x => x.BlindBox).ThenInclude(b => b.BlindBoxFeatures)
                );

                return new MethodResult<List<FeedbackResponse>>.Success(feedbacks.ToList());
            }
            catch (Exception ex)
            {
                return new MethodResult<List<FeedbackResponse>>.Failure($"Lỗi khi lấy danh sách phản hồi: {ex.Message}", StatusCodes.Status500InternalServerError);
            }
        }

        // Lấy tất cả phản hồi
        public async Task<MethodResult<List<FeedbackResponse>>> GetAllFeedbacksAsync()
        {
            try
            {
                var feedbacks = await _uow.GetRepository<Feedback>().GetListAsync(
                    selector: f => _mapper.Map<FeedbackResponse>(f),
                    include: f => f.Include(x => x.User).Include(x => x.BlindBox).ThenInclude(b => b.BlindBoxFeatures)
                );

                return new MethodResult<List<FeedbackResponse>>.Success(feedbacks.ToList());
            }
            catch (Exception ex)
            {
                return new MethodResult<List<FeedbackResponse>>.Failure($"Lỗi khi lấy tất cả phản hồi: {ex.Message}", StatusCodes.Status500InternalServerError);
            }
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
