using BBSS.Api.Models.PackageModel;
using BBSS.Api.Routes;
using BBSS.Api.Services.Implements;
using BBSS.Api.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace BBSS.Api.Controllers
{
    public class BlindBoxController : ControllerBase
    {
        private readonly IBlindBoxService _blindBoxService;

        public BlindBoxController(IBlindBoxService blindBoxService)
        {
            _blindBoxService = blindBoxService;
        }

        [HttpGet]
        [Route(Router.BlindBoxRoute.GetBlindBox)]
        public async Task<ActionResult> GetBlindBox(int id)
        {
            var result = await _blindBoxService.GetBlindBoxAsync(id);
            return result.Match(
                (l, c) => Problem(detail: l, statusCode: c),
                Ok);
        }
    }
}
