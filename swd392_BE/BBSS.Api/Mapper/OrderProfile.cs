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
                .ForMember(dest => dest.VoucherId, opt => opt.MapFrom(src => src.VoucherId ?? null))
                .ForMember(dest => dest.OrderDate, opt => opt.MapFrom(src => DateTime.Now))
                .ForMember(dest => dest.TotalAmount, opt => opt.MapFrom(src => 0));

            CreateMap<Order, OrderViewModel>()
                .ForMember(dest => dest.Details, opt => opt.MapFrom(src => src.OrderDetails.Select(x => new OrderDetailViewModel
                {
                    OrderDetailId = x.OrderId,
                    //BlindBoxId = x.BlindBoxId,
                    //Quantity = x.Quantity,
                    Price = x.UnitPrice
                })));
        }
    }
}
