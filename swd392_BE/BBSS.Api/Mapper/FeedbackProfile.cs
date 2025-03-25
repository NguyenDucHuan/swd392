namespace BBSS.Api.Mapper
{
    using AutoMapper;
    using BBSS.Api.Models.FeedbackModel;
    using BBSS.Domain.Entities;

    public class FeedbackProfile : Profile
    {
        public FeedbackProfile()
        {
            // Ánh xạ từ Feedback sang FeedbackResponse
            CreateMap<Feedback, FeedbackResponse>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.Name)) // Tên người dùng
                .ForMember(dest => dest.BlindBoxName, opt => opt.MapFrom(src => src.BlindBox.Color)) // Tên của BlindBox
                .ForMember(dest => dest.BlindBoxFeatures, opt => opt.MapFrom(src => src.BlindBox.BlindBoxFeatures.Select(f => f.Feature.Description))) // Danh sách tính năng
                .ForMember(dest => dest.BlindBoxImages, opt => opt.MapFrom(src => src.BlindBox.BlindBoxImages.Select(i => i.Url))); // URL ảnh của BlindBox

            // Ánh xạ từ FeedbackRequest sang Feedback
            CreateMap<FeedbackRequest, Feedback>()
                .ForMember(dest => dest.BlindBox, opt => opt.Ignore()); // BlindBox sẽ được xử lý qua BlindBoxId trong logic service
        }
    }

}
