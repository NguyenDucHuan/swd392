using BBSS.Api.Helper;
using BBSS.Api.Models.PackageModel;
using BBSS.Api.ViewModels;

namespace BBSS.Api.Services.Interfaces
{
    public interface IBlindBoxService
    {
        //Task<MethodResult<string>> UpdateBlindBoxAsync(int blindBoxId, BlindBoxUpdateRequest request);
        //Task<MethodResult<string>> CreateBlindBoxAsync(int packageId, BlindBoxUpdateRequest request);
        Task<MethodResult<BlindBoxViewModel>> GetBlindBoxAsync(int blindBoxId);
    }
}