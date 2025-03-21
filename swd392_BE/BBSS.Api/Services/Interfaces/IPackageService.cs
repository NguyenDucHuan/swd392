using BBSS.Api.Helper;
using BBSS.Api.Models.PackageModel;
using BBSS.Api.ViewModels;
using BBSS.Domain.Entities;
using BBSS.Domain.Paginate;

namespace BBSS.Api.Services.Interfaces
{
    public interface IPackageService
    {
        Task<MethodResult<PackageViewModel>> GetPackageByIdAsync(int id , string filter);
        Task<MethodResult<IPaginate<PackageViewModel>>> GetPackagesAsync(PaginateModel model, int? isKnown, int CategoryID = 0, int RepresentativeCount = 0);
        Task<MethodResult<PackageViewModel>> GetPackagesByPackageCodeAsync(string packageCode, string filter = "");
        Task<MethodResult<string>> UpdatePackageAsync(int id, PackageUpdateRequest request);
        Task<MethodResult<string>> DeletePackageAsync(int id);
        Task<MethodResult<string>> CreateUnknownPackageAsync(PackageUnknownCreateRequest request);
        Task<MethodResult<string>> CreateKnownPackageAsync(PackageKnownCreateRequest request);
    }
}
