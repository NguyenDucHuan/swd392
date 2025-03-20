using AutoMapper;
using BBSS.Api.Models.CategoryModel;
using BBSS.Api.Models.FeatureModel;
using BBSS.Api.ViewModels;
using BBSS.Domain.Entities;

namespace BBSS.Api.Mapper
{
    public class FeatureProfile : Profile
    {
        public FeatureProfile()
        {
            CreateMap<Feature, FeatureViewModel>();

            CreateMap<FeatureCreateRequest, Feature>();
        }
    }
}
