using AutoMapper;
using BBSS.Api.Models.CategoryModel;
using BBSS.Domain.Entities;

namespace BBSS.Api.Mapper
{
    public class CategoryProfile : Profile
    {
        public CategoryProfile()
        {
            CreateMap<Category, CategoryResponse>();

            CreateMap<CategoryRequest, Category>();
        }
    }
}
