using BBSS.Api.Constants;
using BBSS.Api.Helper;
using BBSS.Api.Models.CategoryModel;
using BBSS.Api.Models.PackageModel;
using BBSS.Api.Routes;
using BBSS.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BBSS.Api.Controllers
{
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly ICategoryService _categoryService;

        public CategoryController(ICategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        [HttpGet]
        [Route(Router.CategoryRoute.GetCategories)]
        public async Task<ActionResult> GetCategories()
        {
            var result = await _categoryService.GetCategoriesAsync();
            return result.Match(
                (l, c) => Problem(detail: l, statusCode: c),
                Ok
            );
        }

        [HttpGet]
        [Route(Router.CategoryRoute.GetCategory)]
        public async Task<ActionResult> GetCategory(int id)
        {
            var result = await _categoryService.GetCategoryByIdAsync(id);
            return result.Match(
                (l, c) => Problem(detail: l, statusCode: c),
                Ok
            );
        }

        [HttpPost]
        [Route(Router.CategoryRoute.CreateCategory)]
        //[Authorize(Roles = UserConstant.USER_ROLE_ADMIN)]
        public async Task<ActionResult> CreateCategory([FromBody] CategoryRequest request)
        {
            var result = await _categoryService.CreateCategoryAsync(request);
            return result.Match(
                (l, c) => Problem(detail: l, statusCode: c),
                Ok
            );
        }

        [HttpPut]
        [Route(Router.CategoryRoute.UpdateCategory)]
        //[Authorize(Roles = UserConstant.USER_ROLE_ADMIN)]
        public async Task<ActionResult> UpdateCategory(int id, [FromBody] CategoryRequest request)
        {
            var result = await _categoryService.UpdateCategoryAsync(id, request);
            return result.Match(
                (l, c) => Problem(detail: l, statusCode: c),
                Ok
            );
        }

        [HttpDelete]
        [Route(Router.CategoryRoute.DeleteCategory)]
        //[Authorize(Roles = UserConstant.USER_ROLE_ADMIN)]
        public async Task<ActionResult> DeleteCategory(int id)
        {
            var result = await _categoryService.DeleteCategoryAsync(id);
            return result.Match(
                (l, c) => Problem(detail: l, statusCode: c),
                Ok
            );
        }
    }
}