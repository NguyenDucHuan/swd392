using AutoMapper;
using BBSS.Api.Models.PackageModel;
using BBSS.Api.ViewModels;
using BBSS.Domain.Entities;

namespace BBSS.Api.Mapper
{
    public class PackageProfile : Profile
    {
        public PackageProfile()
        {
            CreateMap<Package, PackageViewModel>()
               .ForMember(dest => dest.Images, opt => opt.MapFrom(src => src.PackageImages))
               .ForMember(dest => dest.BlindBoxes, opt => opt.MapFrom(src => src.BlindBoxes));
            CreateMap<PackageImage, ImageViewModel>();

            CreateMap<BlindBox, BlindBoxViewModel>()
                .ForMember(dest => dest.PackageCode, opt => opt.MapFrom(src => src.Package.PakageCode))
                .ForMember(dest => dest.PackageName, opt => opt.MapFrom(src => src.Package.Name));

            CreateMap<PackageUnknownCreateRequest, Package>();
            
            CreateMap<PackageUpdateRequest, Package>()
                .ForMember(dest => dest.PackageId, opt => opt.Ignore())
                .ForMember(dest => dest.PakageCode, opt => opt.Ignore())
                .ForMember(dest => dest.PackageImages, opt => opt.Ignore())
                .ForMember(dest => dest.BlindBoxes, opt => opt.Ignore());
        }
    }
}
