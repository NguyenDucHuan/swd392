using BBSS.Api.Helper;
using BBSS.Api.Models.PackageModel;
using BBSS.Api.ViewModels;
using BBSS.Domain.Entities;
using BBSS.Domain.Paginate;

namespace BBSS.Api.Services.Interfaces
{
    public interface IPackageService
    {
        Task<MethodResult<PackageViewModel>> GetPackageByIdAsync(int id);
        Task<MethodResult<IPaginate<PackageViewModel>>> GetPackagesAsync(PaginateModel model);

        Task<MethodResult<string>> UpdatePackageAsync(int id, PackageUpdateRequest request);
        Task<MethodResult<string>> DeletePackageAsync(int id);

    }
}
