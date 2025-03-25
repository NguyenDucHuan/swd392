using BBSS.Api.Helper;
using BBSS.Api.Models.FeedbackModel;

namespace BBSS.Api.Services.Interfaces
{
    public interface IFeedbackService
    {
        /// <summary>
        /// Tạo phản hồi mới (Feedback) nếu người dùng đã mua hàng.
        /// </summary>
        Task<MethodResult<string>> CreateFeedbackAsync(FeedbackRequest request);

        /// <summary>
        /// Lấy danh sách phản hồi của một sản phẩm theo ProductId.
        /// </summary>
        Task<MethodResult<List<FeedbackResponse>>> GetFeedbackByProductAsync(int productId);

        /// <summary>
        /// Lấy danh sách toàn bộ phản hồi (dành cho Manager).
        /// </summary>
        Task<MethodResult<List<FeedbackResponse>>> GetAllFeedbacksAsync();

        /// <summary>
        /// Cập nhật trạng thái của một phản hồi (phê duyệt / từ chối).
        /// </summary>
        Task<MethodResult<string>> UpdateFeedbackStatusAsync(int feedbackId, UpdateFeedbackStatusRequest request);
    }
}
