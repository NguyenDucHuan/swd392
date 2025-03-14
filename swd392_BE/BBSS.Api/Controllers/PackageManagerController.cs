﻿using BBSS.Api.Constants;
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
        public async Task<ActionResult> GetPackage(int packageId)
        {
            var result = await _packageService.GetPackageByIdAsync(packageId);
            return result.Match(
                (l, c) => Problem(detail: l, statusCode: c),
                Ok
            );
        }
        [HttpGet]
        [Route(Router.PackageRoute.GetPackages)]
        public async Task<ActionResult> GetPackages([FromQuery] PaginateModel model)
        {
            var result = await _packageService.GetPackagesAsync(model);
            return result.Match(
                (l, c) => Problem(detail: l, statusCode: c),
                Ok
            );
        }
        [HttpPut]
        [Route(Router.PackageRoute.UpdatePackage)]
        //[Authorize(Roles = UserConstant.USER_ROLE_ADMIN)]
        public async Task<ActionResult> UpdatePackage(int packageId, [FromForm] PackageUpdateRequest request)
        {
            var result = await _packageService.UpdatePackageAsync(packageId, request);
            return result.Match(
                (l, c) => Problem(detail: l, statusCode: c),
                Ok
            );
        }

        [HttpDelete]
        [Route(Router.PackageRoute.DeletePackage)]
        //[Authorize(Roles = UserConstant.USER_ROLE_ADMIN)]
        public async Task<ActionResult> DeletePackage(int packageId)
        {
            var result = await _packageService.DeletePackageAsync(packageId);
            return result.Match(
                (l, c) => Problem(detail: l, statusCode: c),
                Ok
            );
        }

    }
}
