using BBSS.Api.Constants;
using BBSS.Api.Models.FeedbackModel;
using BBSS.Api.Models.PackageModel;
using BBSS.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using static BBSS.Api.Routes.Router;

namespace BBSS.Api.Controllers
{
    public class FeedbackController : ControllerBase
    {
        private readonly IFeedbackService _feedbackService;

        public FeedbackController(IFeedbackService feedbackService)
        {
            _feedbackService = feedbackService;
        }

        // [User] Tạo phản hồi
        [HttpPost(FeedbackRoute.CreateFeedback)]
        [Authorize(Roles = UserConstant.USER_ROLE_USER)]
        public async Task<IActionResult> CreateFeedback(FeedbackRequest request)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.Sid).Value);
            var result = await _feedbackService.CreateFeedbackAsync(userId, request);
            return result.Match(
                whenLeft: (errorMessage, statusCode) => StatusCode(statusCode, errorMessage),
                whenRight: successMessage => Ok(successMessage)
            );
        }

        [HttpGet(FeedbackRoute.GetFeedbackByProduct)]
        public async Task<IActionResult> GetFeedbackByProduct(int productId, [FromQuery] PaginateModel model, DateOnly? date, int? minVote, int? maxVote)
        {
            var result = await _feedbackService.GetFeedbackByProductAsync(productId, model, date, minVote, maxVote);
            return result.Match(
                whenLeft: (errorMessage, statusCode) => StatusCode(statusCode, errorMessage),
                whenRight: feedbacks => Ok(feedbacks)
            );
        }

        [HttpGet(FeedbackRoute.GetAllFeedbacks)]
        [Authorize(Roles = $" {UserConstant.USER_ROLE_STAFF}, {UserConstant.USER_ROLE_USER}")]
        public async Task<IActionResult> GetAllFeedbacks([FromQuery] PaginateModel model, DateOnly? date, int? minVote, int? maxVote)
        {
            var result = await _feedbackService.GetAllFeedbacksAsync(model, date, minVote, maxVote);
            return result.Match(
                whenLeft: (errorMessage, statusCode) => StatusCode(statusCode, errorMessage),
                whenRight: feedbacks => Ok(feedbacks)
            );
        }

        // [Manager] Cập nhật trạng thái phản hồi
        [HttpPut(FeedbackRoute.UpdateFeedbackStatus)]
        [Authorize(Roles = "Staff")]
        public async Task<IActionResult> UpdateFeedbackStatus(int feedbackId, [FromBody] UpdateFeedbackStatusRequest request)
        {
            var result = await _feedbackService.UpdateFeedbackStatusAsync(feedbackId, request);
            return result.Match(
                whenLeft: (errorMessage, statusCode) => StatusCode(statusCode, errorMessage),
                whenRight: successMessage => Ok(successMessage)
            );
        }
    }

}
