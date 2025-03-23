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
                .ForMember(dest => dest.PackageName, opt => opt.MapFrom(src => src.Package.Name))
                .ForMember(dest => dest.Features, opt => opt.MapFrom(src => src.BlindBoxFeatures.Select(x => new FeatureViewModel
                {
                    FeatureId = x.FeatureId,
                    Type = x.Feature.Type,
                    Description = x.Feature.Description
                }).ToList()))
                .ForMember(dest => dest.ImageUrls, opt => opt.MapFrom(src => src.BlindBoxImages.Select(img => new ImageViewModel
                {
                    Url = img.Url
                }).ToList())); ;

            CreateMap<BlindBoxCreateRequest, BlindBox>()
            .ForMember(dest => dest.IsSold, opt => opt.MapFrom(src => false))
            .ForMember(dest => dest.IsKnowned, opt => opt.MapFrom(src => true))
            .ForMember(dest => dest.BlindBoxFeatures, opt => opt.MapFrom(src => src.FeatureIds))
            .ForMember(dest => dest.BlindBoxImages, opt => opt.Ignore());
            CreateMap<PackageUnknownCreateRequest, Package>();
            CreateMap<PackageKnownCreateRequest, Package>()               
                .ForMember(dest => dest.BlindBoxes, opt => opt.Ignore());
            CreateMap<BlindBoxCreateRequest, BlindBox>()
                .ForMember(dest => dest.IsSold, opt => opt.MapFrom(src => 0))
                .ForMember(dest => dest.IsKnowned, opt => opt.MapFrom(src => 1))
                .ForMember(dest => dest.BlindBoxFeatures, opt => opt.MapFrom(src => src.FeatureIds));
            CreateMap<int, BlindBoxFeature>()
                .ForMember(dest => dest.FeatureId, opt => opt.MapFrom(src => src));

            CreateMap<PackageUpdateRequest, Package>()
                .ForMember(dest => dest.PackageId, opt => opt.Ignore())
                .ForMember(dest => dest.PakageCode, opt => opt.Ignore())
                .ForMember(dest => dest.PackageImages, opt => opt.Ignore())
                .ForMember(dest => dest.BlindBoxes, opt => opt.MapFrom(src => src.BlindBoxes));
            CreateMap<BlindBoxUpdateRequest, BlindBox>();
        }
    }
}
