using AutoMapper;
using BBSS.Api.Enums;
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
    public class PackageService : IPackageService
    {
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;
        private readonly ICloudinaryService _cloudinaryService;
        private readonly IBlindBoxService _blindBoxService;

        public PackageService(IUnitOfWork uow, IMapper mapper, ICloudinaryService cloudinaryService, IBlindBoxService blindBoxService)
        {
            _uow = uow;
            _mapper = mapper;
            _cloudinaryService = cloudinaryService;
            _blindBoxService = blindBoxService;
        }

        public async Task<MethodResult<PackageViewModel>> GetPackageByIdAsync(int id)
        {
            try
            {
                var package = await _uow.GetRepository<Package>().SingleOrDefaultAsync(
                    predicate: p => p.PackageId == id,
                    include: i => i.Include(p => p.BlindBoxes)
                                   .Include(p => p.PackageImages)
                );

                if (package == null)
                {
                    return new MethodResult<PackageViewModel>.Failure("Package not found", StatusCodes.Status404NotFound);
                }

                var result = _mapper.Map<PackageViewModel>(package);
                return new MethodResult<PackageViewModel>.Success(result);
            }
            catch (Exception ex)
            {
                return new MethodResult<PackageViewModel>.Failure(ex.Message, StatusCodes.Status500InternalServerError);
            }
        }

        public async Task<MethodResult<IPaginate<PackageViewModel>>> GetPackagesAsync(PaginateModel model)
        {
            try
            {
                int page = model.page > 0 ? model.page : 1;
                int size = model.size > 0 ? model.size : 10;
                string search = model.search?.ToLower() ?? string.Empty;
                string filter = model.filter?.ToLower() ?? string.Empty;

                var packages = await _uow.GetRepository<Package>().GetPagingListAsync(
                    selector: p => _mapper.Map<PackageViewModel>(p),
                    predicate: p =>
                        (string.IsNullOrEmpty(search) ||
                            p.PakageCode.ToLower().Contains(search) ||
                            p.Name.ToLower().Contains(search) ||
                            p.Description.ToLower().Contains(search)) &&
                        (string.IsNullOrEmpty(filter) ||
                            (filter == "available" && p.BlindBoxes.Any(bb => !bb.IsSold)) ||
                            (filter == "sold" && p.BlindBoxes.All(bb => bb.IsSold))),
                    include: i => i.Include(p => p.BlindBoxes)
                                   .Include(p => p.PackageImages),
                    orderBy: BuildOrderBy(model.sortBy),
                    page: page,
                    size: size
                );

                return new MethodResult<IPaginate<PackageViewModel>>.Success(packages);
            }
            catch (Exception ex)
            {
                return new MethodResult<IPaginate<PackageViewModel>>.Failure(ex.Message, StatusCodes.Status500InternalServerError);
            }
        }

        private Func<IQueryable<Package>, IOrderedQueryable<Package>> BuildOrderBy(string sortBy)
        {
            if (string.IsNullOrEmpty(sortBy)) return null;

            return sortBy.ToLower() switch
            {
                "name" => q => q.OrderBy(p => p.Name),
                "name_desc" => q => q.OrderByDescending(p => p.Name),
                "code" => q => q.OrderBy(p => p.PakageCode),
                "code_desc" => q => q.OrderByDescending(p => p.PakageCode),
                _ => q => q.OrderByDescending(p => p.PackageId) // Default sort
            };
        }

        public async Task<MethodResult<string>> UpdatePackageAsync(int id, PackageUpdateRequest request)
        {
            try
            {
                await _uow.BeginTransactionAsync();

                var package = await _uow.GetRepository<Package>().SingleOrDefaultAsync(
                    predicate: p => p.PackageId == id,
                    include: i => i.Include(p => p.PackageImages)
                                 .Include(p => p.BlindBoxes)
                );

                if (package == null)
                {
                    return new MethodResult<string>.Failure("Package not found", StatusCodes.Status404NotFound);
                }

                _mapper.Map(request, package);
                _uow.GetRepository<Package>().UpdateAsync(package);

                // Upload và quản lý hình ảnh
                if (request.ImageFiles != null && request.ImageFiles.Any())
                {
                    var imageUrls = await _cloudinaryService.UploadMultipleImagesAsync(request.ImageFiles);

                    if (imageUrls.Any())
                    {
                        // Xóa ảnh cũ
                        foreach (var image in package.PackageImages.ToList())
                        {
                            _uow.GetRepository<PackageImage>().DeleteAsync(image);
                        }

                        // Thêm ảnh mới
                        foreach (var imageUrl in imageUrls)
                        {
                            await _uow.GetRepository<PackageImage>().InsertAsync(new PackageImage
                            {
                                PackageId = package.PackageId,
                                Url = imageUrl
                            });
                        }
                    }
                }

                // Update BlindBoxes
                if (request.BlindBoxes != null && request.BlindBoxes.Any())
                {
                    var existingBlindBoxIds = package.BlindBoxes.Select(bb => bb.BlindBoxId).ToList();
                    var requestBlindBoxIds = request.BlindBoxes
                        .Where(bb => bb.BlindBoxId.HasValue)
                        .Select(bb => bb.BlindBoxId.Value)
                        .ToList();

                    foreach (var blindBoxReq in request.BlindBoxes.Where(bb => bb.BlindBoxId.HasValue))
                    {
                        // Update existing BlindBox
                        if (existingBlindBoxIds.Contains(blindBoxReq.BlindBoxId.Value))
                        {
                            var updateResult = await _blindBoxService.UpdateBlindBoxAsync(
                                blindBoxReq.BlindBoxId.Value, blindBoxReq);

                            if (updateResult is MethodResult<string>.Failure)
                            {
                                await _uow.RollbackTransactionAsync();
                                return updateResult;
                            }
                        }
                    }

                    // Create new BlindBoxes
                    foreach (var blindBoxReq in request.BlindBoxes.Where(bb => !bb.BlindBoxId.HasValue))
                    {
                        var createResult = await _blindBoxService.CreateBlindBoxAsync(package.PackageId, blindBoxReq);

                        if (createResult is MethodResult<string>.Failure)
                        {
                            await _uow.RollbackTransactionAsync();
                            return createResult;
                        }
                    }

                    var blindBoxesToRemove = package.BlindBoxes
                        .Where(bb => !requestBlindBoxIds.Contains(bb.BlindBoxId) && !bb.IsSold)
                        .ToList();

                    foreach (var blindBox in blindBoxesToRemove)
                    {
                        // Delete features and images
                        foreach (var feature in blindBox.BlindBoxFeatures.ToList())
                        {
                            _uow.GetRepository<BlindBoxFeature>().DeleteAsync(feature);
                        }

                        foreach (var image in blindBox.BlindBoxImages.ToList())
                        {
                            _uow.GetRepository<BlindBoxImage>().DeleteAsync(image);
                        }

                        _uow.GetRepository<BlindBox>().DeleteAsync(blindBox);
                    }
                }

                await _uow.CommitAsync();
                await _uow.CommitTransactionAsync();

                return new MethodResult<string>.Success("Package updated successfully");
            }
            catch (Exception ex)
            {
                await _uow.RollbackTransactionAsync();
                return new MethodResult<string>.Failure(ex.Message, StatusCodes.Status500InternalServerError);
            }
        }

        public async Task<MethodResult<string>> DeletePackageAsync(int id)
        {
            try
            {
                await _uow.BeginTransactionAsync();

                var package = await _uow.GetRepository<Package>().SingleOrDefaultAsync(
                    predicate: p => p.PackageId == id,
                    include: i => i.Include(p => p.BlindBoxes).Include(p => p.PackageImages)
                );

                if (package == null)
                {
                    return new MethodResult<string>.Failure("Package not found", StatusCodes.Status404NotFound);
                }

                if (package.BlindBoxes.Any(bb => bb.IsSold))
                {
                    return new MethodResult<string>.Failure("Cannot delete package with sold blindboxes", StatusCodes.Status400BadRequest);
                }

                // Xóa tất cả hình ảnh trước
                foreach (var image in package.PackageImages.ToList())
                {
                    _uow.GetRepository<PackageImage>().DeleteAsync(image);
                }

                // Xóa tất cả blindboxes chưa được bán
                foreach (var blindBox in package.BlindBoxes.Where(b => !b.IsSold).ToList())
                {
                    _uow.GetRepository<BlindBox>().DeleteAsync(blindBox);
                }

                // Xóa package
                _uow.GetRepository<Package>().DeleteAsync(package);

                await _uow.CommitAsync();
                await _uow.CommitTransactionAsync();

                return new MethodResult<string>.Success("Package deleted successfully");
            }
            catch (Exception ex)
            {
                await _uow.RollbackTransactionAsync();
                return new MethodResult<string>.Failure(ex.Message, StatusCodes.Status500InternalServerError);
            }
        }
    }
}