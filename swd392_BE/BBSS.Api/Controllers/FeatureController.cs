using BBSS.Api.Models.CategoryModel;
using BBSS.Api.Models.FeatureModel;
using BBSS.Api.Routes;
using BBSS.Api.Services.Implements;
using BBSS.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BBSS.Api.Controllers
{
    public class FeatureController : ControllerBase
    {
        private readonly IFeatureService _featureService;

        public FeatureController(IFeatureService featureService)
        {
            _featureService = featureService;
        }

        [HttpGet]
        [Route(Router.FeatureRoute.GetFeatures)]
        public async Task<ActionResult> GetCategories()
        {
            var result = await _featureService.GetFeaturesAsync();
            return result.Match(
                (l, c) => Problem(detail: l, statusCode: c),
                Ok
            );
        }

        [HttpGet]
        [Route(Router.FeatureRoute.GetFeature)]
        public async Task<ActionResult> GetCategory(int id)
        {
            var result = await _featureService.GetFeatureByIdAsync(id);
            return result.Match(
                (l, c) => Problem(detail: l, statusCode: c),
                Ok
            );
        }

        [HttpPost]
        [Route(Router.FeatureRoute.CreateFeature)]
        //[Authorize(Roles = UserConstant.USER_ROLE_ADMIN)]
        public async Task<ActionResult> CreateCategory([FromBody] FeatureCreateRequest request)
        {
            var result = await _featureService.CreateFeatureAsync(request);
            return result.Match(
                (l, c) => Problem(detail: l, statusCode: c),
                Ok
            );
        }
    }
}
