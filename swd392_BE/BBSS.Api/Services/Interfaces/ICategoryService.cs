using BBSS.Api.Helper;
using BBSS.Api.Models.CategoryModel;
using BBSS.Api.Models.PackageModel;
using BBSS.Domain.Paginate;

namespace BBSS.Api.Services.Interfaces
{
    public interface ICategoryService
    {
        Task<MethodResult<CategoryResponse>> GetCategoryByIdAsync(int id);
        Task<MethodResult<List<CategoryResponse>>> GetCategoriesAsync();
        Task<MethodResult<CategoryResponse>> CreateCategoryAsync(CategoryRequest request);
        Task<MethodResult<string>> UpdateCategoryAsync(int id, CategoryRequest request);
        Task<MethodResult<string>> DeleteCategoryAsync(int id);
    }
}
