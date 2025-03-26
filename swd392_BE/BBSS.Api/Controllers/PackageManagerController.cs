using BBSS.Api.Constants;
using BBSS.Api.Models.PackageModel;
using BBSS.Api.Routes;
using BBSS.Api.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BBSS.Api.Controllers
{

    public class PackageManagerController : ControllerBase
    {
        private readonly IPackageService _packageService;

        public PackageManagerController(IPackageService packageService)
        {
            _packageService = packageService;
        }

        [HttpGet]
        [Route(Router.PackageRoute.GetPackage)]
        public async Task<ActionResult> GetPackage(int packageId, string filter)
        {
            var result = await _packageService.GetPackageByIdAsync(packageId, filter);
            return result.Match(
                (l, c) => Problem(detail: l, statusCode: c),
                Ok
            );
        }
        [HttpGet]
        [Route(Router.PackageRoute.GetPackagesByPackageCode)]
        public async Task<ActionResult> GetPackagesByPackageCode([FromQuery] string packageCode, [FromQuery] string filter = "")
        {
            var result = await _packageService.GetPackagesByPackageCodeAsync(packageCode, filter);
            return result.Match(
                (l, c) => Problem(detail: l, statusCode: c),
                Ok
            );
        }
        [HttpGet]
        [Route(Router.PackageRoute.GetPackages)]
        public async Task<ActionResult> GetPackages([FromQuery] PaginateModel model, [FromQuery] bool? isKnown, [FromQuery] int categoryId = 0, [FromQuery] int representativeCount = 0)
        {
            var result = await _packageService.GetPackagesAsync(model, isKnown, categoryId, representativeCount);
            return result.Match(
                (l, c) => Problem(detail: l, statusCode: c),
                Ok
            );
        }
        [HttpPut]
        [Route(Router.PackageRoute.UpdatePackage)]
        [Authorize(Roles = UserConstant.USER_ROLE_STAFF)]
        public async Task<ActionResult> UpdatePackage(int packageId, PackageUpdateRequest request)
        {
            var result = await _packageService.UpdatePackageAsync(packageId, request);
            return result.Match(
                (l, c) => Problem(detail: l, statusCode: c),
                Ok
            );
        }

        [HttpDelete]
        [Route(Router.PackageRoute.DeletePackage)]
        [Authorize(Roles = UserConstant.USER_ROLE_STAFF)]
        public async Task<ActionResult> DeletePackage(int packageId)
        {
            var result = await _packageService.DeletePackageAsync(packageId);
            return result.Match(
                (l, c) => Problem(detail: l, statusCode: c),
                Ok
            );
        }

        [HttpPost]
        [Route(Router.PackageRoute.CreateUnknownPackage)]
        [Authorize(Roles = UserConstant.USER_ROLE_STAFF)]
        public async Task<ActionResult> CreateUnknownPackage(PackageUnknownCreateRequest request)
        {
            var result = await _packageService.CreateUnknownPackageAsync(request);
            return result.Match(
                (l, c) => Problem(detail: l, statusCode: c),
                Ok
            );
        }

        [HttpPost]
        [Route(Router.PackageRoute.CreateKnownPackage)]
        [Authorize(Roles = UserConstant.USER_ROLE_STAFF)]
        public async Task<ActionResult> CreateKnownPackage(PackageKnownCreateRequest request)
        {
            var result = await _packageService.CreateKnownPackageAsync(request);
            return result.Match(
                (l, c) => Problem(detail: l, statusCode: c),
                Ok
            );
        }
    }
}