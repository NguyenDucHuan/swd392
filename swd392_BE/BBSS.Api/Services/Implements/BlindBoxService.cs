using AutoMapper;
using BBSS.Api.Helper;
using BBSS.Api.Models.PackageModel;
using BBSS.Api.Services.Interfaces;
using BBSS.Api.ViewModels;
using BBSS.Domain.Entities;
using BBSS.Domain.Paginate;
using BBSS.Repository.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BBSS.Api.Services.Implements
{
    public class BlindBoxService : IBlindBoxService
    {
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;
        private readonly ICloudinaryService _cloudinaryService;

        public BlindBoxService(IUnitOfWork uow, IMapper mapper, ICloudinaryService cloudinaryService)
        {
            _uow = uow;
            _mapper = mapper;
            _cloudinaryService = cloudinaryService;
        }

        //public async Task<MethodResult<string>> UpdateBlindBoxAsync(int blindBoxId, BlindBoxUpdateRequest request)
        //{
        //    try
        //    {
        //        var blindBox = await _uow.GetRepository<BlindBox>().SingleOrDefaultAsync(
        //            predicate: bb => bb.BlindBoxId == blindBoxId,
        //            include: i => i.Include(bb => bb.BlindBoxImages)
        //                          .Include(bb => bb.BlindBoxFeatures)
        //        );

        //        if (blindBox == null)
        //        {
        //            return new MethodResult<string>.Failure("BlindBox not found", StatusCodes.Status404NotFound);
        //        }

        //        _mapper.Map(request, blindBox);
        //        _uow.GetRepository<BlindBox>().UpdateAsync(blindBox);

        //        // Handle images
        //        if (request.ImageFiles != null && request.ImageFiles.Any())
        //        {
        //            var imageUrls = await _cloudinaryService.UploadMultipleImagesAsync(request.ImageFiles);

        //            if (imageUrls.Any())
        //            {
        //                // Delete old images
        //                foreach (var image in blindBox.BlindBoxImages.ToList())
        //                {
        //                    _uow.GetRepository<BlindBoxImage>().DeleteAsync(image);
        //                }

        //                // Add new images
        //                foreach (var imageUrl in imageUrls)
        //                {
        //                    await _uow.GetRepository<BlindBoxImage>().InsertAsync(new BlindBoxImage
        //                    {
        //                        BlindBoxId = blindBox.BlindBoxId,
        //                        Url = imageUrl
        //                    });
        //                }
        //            }
        //        }

        //        // Handle features (many-to-many relationship)
        //        if (request.FeatureIds != null)
        //        {
        //            // Remove existing features
        //            foreach (var feature in blindBox.BlindBoxFeatures.ToList())
        //            {
        //                _uow.GetRepository<BlindBoxFeature>().DeleteAsync(feature);
        //            }

        //            // Add new features
        //            foreach (var featureId in request.FeatureIds)
        //            {
        //                await _uow.GetRepository<BlindBoxFeature>().InsertAsync(new BlindBoxFeature
        //                {
        //                    BlindBoxId = blindBox.BlindBoxId,
        //                    FeatureId = featureId
        //                });
        //            }
        //        }

        //        return new MethodResult<string>.Success("BlindBox updated successfully");
        //    }
        //    catch (Exception ex)
        //    {
        //        return new MethodResult<string>.Failure(ex.Message, StatusCodes.Status500InternalServerError);
        //    }
        //}

        //public async Task<MethodResult<string>> CreateBlindBoxAsync(int packageId, BlindBoxUpdateRequest request)
        //{
        //    try
        //    {
        //        var blindBox = _mapper.Map<BlindBox>(request);
        //        blindBox.PackageId = packageId;
        //        blindBox.IsSold = false;

        //        await _uow.GetRepository<BlindBox>().InsertAsync(blindBox);

        //        // Handle images
        //        if (request.ImageFiles != null && request.ImageFiles.Any())
        //        {
        //            var imageUrls = await _cloudinaryService.UploadMultipleImagesAsync(request.ImageFiles);

        //            foreach (var imageUrl in imageUrls)
        //            {
        //                await _uow.GetRepository<BlindBoxImage>().InsertAsync(new BlindBoxImage
        //                {
        //                    BlindBoxId = blindBox.BlindBoxId,
        //                    Url = imageUrl
        //                });
        //            }
        //        }

        //        // Handle features
        //        if (request.FeatureIds != null && request.FeatureIds.Any())
        //        {
        //            foreach (var featureId in request.FeatureIds)
        //            {
        //                await _uow.GetRepository<BlindBoxFeature>().InsertAsync(new BlindBoxFeature
        //                {
        //                    BlindBoxId = blindBox.BlindBoxId,
        //                    FeatureId = featureId
        //                });
        //            }
        //        }

        //        return new MethodResult<string>.Success("BlindBox created successfully");
        //    }
        //    catch (Exception ex)
        //    {
        //        return new MethodResult<string>.Failure(ex.Message, StatusCodes.Status500InternalServerError);
        //    }
        //}

        public async Task<MethodResult<BlindBoxViewModel>> GetBlindBoxAsync(int blindBoxId)
        {
            var result = await _uow.GetRepository<BlindBox>().SingleOrDefaultAsync<BlindBoxViewModel>(
                    selector: s => _mapper.Map<BlindBoxViewModel>(s),
                    predicate: p => p.BlindBoxId == blindBoxId,
                    include: i => i.Include(p => p.Package)
                );

            return new MethodResult<BlindBoxViewModel>.Success(result);
        }
    }
}