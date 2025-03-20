using BBSS.Api.Helper;
using BBSS.Api.Models.FeatureModel;
using BBSS.Api.ViewModels;

namespace BBSS.Api.Services.Interfaces
{
    public interface IFeatureService
    {
        Task<MethodResult<string>> CreateFeatureAsync(FeatureCreateRequest request);
        Task<MethodResult<IEnumerable<FeatureViewModel>>> GetFeaturesAsync();
        Task<MethodResult<FeatureViewModel>> GetFeatureByIdAsync(int featureId);
    }
}
