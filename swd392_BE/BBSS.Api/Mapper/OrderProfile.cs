using AutoMapper;
using BBSS.Api.Models.AuthenticationModel;
using BBSS.Api.Models.OrderModel;
using BBSS.Api.ViewModels;
using BBSS.Domain.Entities;

namespace BBSS.Api.Mapper
{
    public class OrderProfile : Profile
    {
        public OrderProfile()
        {
            CreateMap<OrderCreateRequest, Order>()
                .ForMember(dest => dest.OrderDate, opt => opt.MapFrom(src => DateTime.Now))
                .ForMember(dest => dest.TotalAmount, opt => opt.MapFrom(src => 0));

            CreateMap<Order, OrderViewModel>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.User.Name))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.User.Email))
                .ForMember(dest => dest.Statuses, opt => opt.MapFrom(src => src.OrderStatuses))
                .ForMember(dest => dest.Transaction, opt => opt.MapFrom(src => src.User.Transactions.FirstOrDefault(x => x.RelatedId == src.OrderId && (x.Type == Constants.TransactionConstant.TRANSACTION_TYPE_DEDUCTION || x.Type == Constants.TransactionConstant.TRANSACTION_TYPE_DEPOSIT))))
                .ForMember(dest => dest.Details, opt => opt.MapFrom(src => src.OrderDetails.Select(x => new OrderDetailViewModel
                {
                    OrderDetailId = x.OrderDetailId,
                    BlindBoxId = x.BlindBoxId,
                    PackageId = x.PackageId,
                    Price = x.UnitPrice
                })));
            CreateMap<OrderStatus, OrderStatusViewModel>();
            CreateMap<OrderWheelCreateRequest, Order>()
                .ForMember(dest => dest.OrderDate, opt => opt.MapFrom(src => DateTime.Now));
        }
    }
}
