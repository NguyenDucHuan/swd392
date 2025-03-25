﻿using BBSS.Api.Models.FeedbackModel;
using BBSS.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using static BBSS.Api.Routes.Router;

namespace BBSS.Api.Controllers
{
    [ApiController]
    [Route(FeedbackRoute.Feedbacks)]
    public class FeedbackController : ControllerBase
    {
        private readonly IFeedbackService _feedbackService;

        public FeedbackController(IFeedbackService feedbackService)
        {
            _feedbackService = feedbackService;
        }

        // [User] Tạo phản hồi
        [HttpPost(FeedbackRoute.CreateFeedback)]
        [Authorize]
        public async Task<IActionResult> CreateFeedback([FromBody] FeedbackRequest request)
        {
            var result = await _feedbackService.CreateFeedbackAsync(request);
            return result.Match(
                whenLeft: (errorMessage, statusCode) => StatusCode(statusCode, errorMessage),
                whenRight: successMessage => Ok(successMessage)
            );
        }

        // [User] Xem danh sách phản hồi của một sản phẩm
        [HttpGet(FeedbackRoute.GetFeedbackByProduct)]
        public async Task<IActionResult> GetFeedbackByProduct(int productId)
        {
            var result = await _feedbackService.GetFeedbackByProductAsync(productId);
            return result.Match(
                whenLeft: (errorMessage, statusCode) => StatusCode(statusCode, errorMessage),
                whenRight: feedbacks => Ok(feedbacks)
            );
        }

        // [Manager] Xem tất cả phản hồi
        [HttpGet(FeedbackRoute.GetAllFeedbacks)]
        [Authorize(Roles = "Staff")]
        public async Task<IActionResult> GetAllFeedbacks()
        {
            var result = await _feedbackService.GetAllFeedbacksAsync();
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
