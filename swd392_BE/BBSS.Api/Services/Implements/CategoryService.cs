using AutoMapper;
using BBSS.Api.Helper;
using BBSS.Api.Models.CategoryModel;
using BBSS.Api.Models.PackageModel;
using BBSS.Api.Services.Interfaces;
using BBSS.Domain.Entities;
using BBSS.Domain.Paginate;
using BBSS.Repository.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BBSS.Api.Services.Implements
{
    public class CategoryService : ICategoryService
    {
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;

        public CategoryService(IUnitOfWork uow, IMapper mapper)
        {
            _uow = uow;
            _mapper = mapper;
        }

        public async Task<MethodResult<CategoryResponse>> GetCategoryByIdAsync(int id)
        {
            try
            {
                var category = await _uow.GetRepository<Category>().SingleOrDefaultAsync(
                    predicate: c => c.CategoryId == id
                );

                if (category == null)
                {
                    return new MethodResult<CategoryResponse>.Failure("Category not found", StatusCodes.Status404NotFound);
                }

                var result = _mapper.Map<CategoryResponse>(category);
                return new MethodResult<CategoryResponse>.Success(result);
            }
            catch (Exception ex)
            {
                return new MethodResult<CategoryResponse>.Failure(ex.Message, StatusCodes.Status500InternalServerError);
            }
        }

        public async Task<MethodResult<List<CategoryResponse>>> GetCategoriesAsync()
        {
            try
            {
                var categories = await _uow.GetRepository<Category>().GetListAsync(
                    selector: c => _mapper.Map<CategoryResponse>(c),
                    orderBy: q => q.OrderBy(c => c.Name)
                );

                return new MethodResult<List<CategoryResponse>>.Success(categories.ToList());
            }
            catch (Exception ex)
            {
                return new MethodResult<List<CategoryResponse>>.Failure(ex.Message, StatusCodes.Status500InternalServerError);
            }
        }

        public async Task<MethodResult<CategoryResponse>> CreateCategoryAsync(CategoryRequest request)
        {
            try
            {
                var category = _mapper.Map<Category>(request);
                await _uow.GetRepository<Category>().InsertAsync(category);
                await _uow.CommitAsync();

                var result = _mapper.Map<CategoryResponse>(category);
                return new MethodResult<CategoryResponse>.Success(result);
            }
            catch (Exception ex)
            {
                return new MethodResult<CategoryResponse>.Failure(ex.Message, StatusCodes.Status500InternalServerError);
            }
        }

        public async Task<MethodResult<string>> UpdateCategoryAsync(int id, CategoryRequest request)
        {
            try
            {
                var category = await _uow.GetRepository<Category>().SingleOrDefaultAsync(
                    predicate: c => c.CategoryId == id
                );

                if (category == null)
                {
                    return new MethodResult<string>.Failure("Category not found", StatusCodes.Status404NotFound);
                }

                category.Name = request.Name;
                _uow.GetRepository<Category>().UpdateAsync(category);
                await _uow.CommitAsync();

                return new MethodResult<string>.Success("Category updated successfully");
            }
            catch (Exception ex)
            {
                return new MethodResult<string>.Failure(ex.Message, StatusCodes.Status500InternalServerError);
            }
        }

        public async Task<MethodResult<string>> DeleteCategoryAsync(int id)
        {
            try
            {
                var category = await _uow.GetRepository<Category>().SingleOrDefaultAsync(
                    predicate: c => c.CategoryId == id,
                    include: i => i.Include(c => c.Packages)
                );

                if (category == null)
                {
                    return new MethodResult<string>.Failure("Category not found", StatusCodes.Status404NotFound);
                }

                // Check if category has packages
                if (category.Packages != null && category.Packages.Any())
                {
                    return new MethodResult<string>.Failure("Cannot delete category with associated packages", StatusCodes.Status400BadRequest);
                }

                _uow.GetRepository<Category>().DeleteAsync(category);
                await _uow.CommitAsync();

                return new MethodResult<string>.Success("Category deleted successfully");
            }
            catch (Exception ex)
            {
                return new MethodResult<string>.Failure(ex.Message, StatusCodes.Status500InternalServerError);
            }
        }
    }
}