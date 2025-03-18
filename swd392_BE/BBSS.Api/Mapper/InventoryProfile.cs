using AutoMapper;
using BBSS.Api.Models.CategoryModel;
using BBSS.Api.ViewModels;
using BBSS.Domain.Entities;

namespace BBSS.Api.Mapper
{
    public class InventoryProfile : Profile
    {
        public InventoryProfile()
        {
            CreateMap<InventoryItem, InventoryViewModel>()
                .ForMember(dest => dest.BlindBox, opt => opt.MapFrom(src => src.BlindBox));
        }
    }
}
