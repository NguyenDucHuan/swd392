using AutoMapper;
using BBSS.Api.Helper;
using BBSS.Api.Models.FeatureModel;
using BBSS.Api.Services.Interfaces;
using BBSS.Api.ViewModels;
using BBSS.Domain.Entities;
using BBSS.Repository.Interfaces;

namespace BBSS.Api.Services.Implements
{
    public class FeatureService : IFeatureService
    {
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;

        public FeatureService(IUnitOfWork uow, IMapper mapper)
        {
            _uow = uow;
            _mapper = mapper;
        }

        public async Task<MethodResult<string>> CreateFeatureAsync(FeatureCreateRequest request)
        {
            try
            {
                var features = _mapper.Map<Feature>(request);
                await _uow.GetRepository<Feature>().InsertAsync(features);
                await _uow.CommitAsync();
                return new MethodResult<string>.Success("Create feature successfully");
            }
            catch (Exception e)
            {
                return new MethodResult<string>.Failure(e.ToString(), StatusCodes.Status500InternalServerError);
            }            
        }

        public async Task<MethodResult<IEnumerable<FeatureViewModel>>> GetFeaturesAsync()
        {
            var features = await _uow.GetRepository<Feature>().GetListAsync(
                selector: s => _mapper.Map<FeatureViewModel>(s)
            );
            return new MethodResult<IEnumerable<FeatureViewModel>>.Success(features);
        }

        public async Task<MethodResult<FeatureViewModel>> GetFeatureByIdAsync(int featureId)
        {
            var feature = await _uow.GetRepository<Feature>().SingleOrDefaultAsync(
                selector: s => _mapper.Map<FeatureViewModel>(s),
                predicate: p => p.FeatureId == featureId
            );
            return new MethodResult<FeatureViewModel>.Success(feature);
        }
    }
}
