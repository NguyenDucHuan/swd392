﻿using AutoMapper;
using BBSS.Api.Enums;
using BBSS.Api.Helper;
using BBSS.Api.Models.PackageModel;
using BBSS.Api.Services.Interfaces;
using BBSS.Api.ViewModels;
using BBSS.Domain.Entities;
using BBSS.Domain.Paginate;
using BBSS.Repository.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

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


        public async Task<MethodResult<PackageViewModel>> GetPackageByIdAsync(int id, string filter = "")
        {
            try
            {
                var package = await _uow.GetRepository<Package>().SingleOrDefaultAsync(
                    predicate: p => p.PackageId == id,
                    include: i => i.Include(p => p.BlindBoxes).ThenInclude(p => p.BlindBoxFeatures).ThenInclude(p => p.Feature)
                                   .Include(p => p.PackageImages)
                                   .Include(p => p.Category)
                );

                if (package == null)
                {
                    return new MethodResult<PackageViewModel>.Failure("Package not found", StatusCodes.Status404NotFound);
                }

                var result = _mapper.Map<PackageViewModel>(package);

                bool useAvailableOnly = filter?.ToLower().Contains("available") == true;

                // Filter blind boxes based on the filter parameter
                var filteredBlindBoxes = result.BlindBoxes
                    .Where(bb => !useAvailableOnly || !bb.IsSold)
                    .ToList();

                if (filteredBlindBoxes.Any())
                {
                    decimal minPrice = filteredBlindBoxes.Min(b => b.DiscountedPrice);
                    decimal totalPrice = filteredBlindBoxes.Sum(b => b.DiscountedPrice);

                    result.Price = minPrice == totalPrice
                        ? minPrice.ToString("N0") + " ₫"
                        : minPrice.ToString("N0") + " - " + totalPrice.ToString("N0") + " ₫";
                }
                else
                {
                    result.Price = "Liên hệ";
                    //result.Pack = new List<int>();
                }

                return new MethodResult<PackageViewModel>.Success(result);
            }
            catch (Exception ex)
            {
                return new MethodResult<PackageViewModel>.Failure(ex.Message, StatusCodes.Status500InternalServerError);
            }
        }

        public async Task<MethodResult<PackageViewModel>> GetPackagesByPackageCodeAsync(string packageCode, string filter = "")
        {
            try
            {
                if (string.IsNullOrEmpty(packageCode))
                {
                    return new MethodResult<PackageViewModel>.Failure("Package code is required", StatusCodes.Status400BadRequest);
                }

                var packages = await _uow.GetRepository<Package>().GetListAsync(
                    selector: p => p,
                    predicate: p => p.PakageCode == packageCode,
                    include: i => i.Include(p => p.BlindBoxes).ThenInclude(p => p.BlindBoxFeatures).ThenInclude(p => p.Feature)
                                 .Include(p => p.PackageImages)
                                 .Include(p => p.Category)
                );
                if (!packages.Any())
                {
                    return new MethodResult<PackageViewModel>.Failure("No packages found with the given code", StatusCodes.Status404NotFound);
                }
                var mappedPackages = packages.Select(p => _mapper.Map<PackageViewModel>(p)).ToList();
                var representativePackage = mappedPackages.First();
                representativePackage.TotalPackage = mappedPackages.Count;
                representativePackage.TotalBlindBox = mappedPackages.Sum(p => p.BlindBoxes.Count);

                bool useAvailableOnly = filter?.ToLower().Contains("available") == true;
                
                var allBlindBoxes = mappedPackages
                    .SelectMany(p => p.BlindBoxes)
                    .Where(bb => !useAvailableOnly || !bb.IsSold)
                    .ToList();

                if (allBlindBoxes.Any())
                {
                    decimal minPrice = allBlindBoxes.Min(b => b.DiscountedPrice);
                    decimal totalPrice = allBlindBoxes.Sum(b => b.DiscountedPrice);

                    representativePackage.Price = minPrice == totalPrice
                        ? minPrice.ToString("N0") + " ₫"
                        : minPrice.ToString("N0") + " - " + totalPrice.ToString("N0") + " ₫";
                }
                else
                {
                    representativePackage.Price = "Liên hệ";
                }

                return new MethodResult<PackageViewModel>.Success(representativePackage);
            }
            catch (Exception ex)
            {
                return new MethodResult<PackageViewModel>.Failure(ex.Message, StatusCodes.Status500InternalServerError);
            }
        }

        public async Task<MethodResult<IPaginate<PackageViewModel>>> GetPackagesAsync(PaginateModel model, int? isKnown, int categoryId = 0, int representativeCount = 0)
        {
            try
            {
                int page = model.page > 0 ? model.page : 1;
                int size = model.size > 0 ? model.size : 10;
                string search = model.search?.ToLower() ?? string.Empty;
                string filter = model.filter?.ToLower() ?? string.Empty;
                Expression<Func<Package, bool>> predicate = p =>
                    // Search filter
                    (string.IsNullOrEmpty(search) ||
                     p.PakageCode.ToLower().Contains(search) ||
                     p.Name.ToLower().Contains(search) ||
                     p.Description.ToLower().Contains(search)) &&
                    (string.IsNullOrEmpty(filter) ||
                     (filter.Contains("available") && p.BlindBoxes.Any(bb => !bb.IsSold)) ||
                     (filter.Contains("sold") && p.BlindBoxes.All(bb => bb.IsSold))) &&
                     (!isKnown.HasValue || 
                     isKnown <= 0 && p.BlindBoxes.All(bb => !bb.IsKnowned) ||
                     isKnown > 0 && p.BlindBoxes.All(bb => bb.IsKnowned)) &&
                    (categoryId <= 0 || p.CategoryId == categoryId);

                bool useAvailableOnly = filter.Contains("available");

                bool groupByPackageCode = representativeCount > 0;

                if (groupByPackageCode)
                {
                    var packages = await _uow.GetRepository<Package>().GetListAsync(
                        selector: p => _mapper.Map<PackageViewModel>(p),
                        predicate: predicate,
                        include: i => i.Include(p => p.BlindBoxes).ThenInclude(p => p.BlindBoxFeatures).ThenInclude(p => p.Feature)
                                     .Include(p => p.PackageImages)
                                     .Include(p => p.Category),
                        orderBy: BuildOrderBy(model.sortBy)
                    );

                    var groupedPackages = packages.GroupBy(p => p.PakageCode).ToDictionary(
                        g => g.Key,
                        g => new { Packages = g.ToList() }
                    );

                    var processedGroups = new Dictionary<string, PackageViewModel>();
                    foreach (var group in groupedPackages)
                    {
                        var allPackagesInGroup = group.Value.Packages;
                        var representativePackage = allPackagesInGroup.First();

                        representativePackage.TotalPackage = allPackagesInGroup.Count;
                        representativePackage.TotalBlindBox = allPackagesInGroup.Select(x => x.BlindBoxes.Count).Sum                                                                                                                                        ();
                        var allBlindBoxes = allPackagesInGroup
                            .SelectMany(p => p.BlindBoxes)
                            .Where(bb => !useAvailableOnly || !bb.IsSold)
                            .ToList();

                        if (allBlindBoxes.Any())
                        {
                            decimal minPrice = allBlindBoxes.Min(b => b.DiscountedPrice);
                            decimal totalPrice = allBlindBoxes.Sum(b => b.DiscountedPrice);

                            representativePackage.Price = minPrice == totalPrice
                                ? minPrice.ToString("N0") + " ₫"
                                : minPrice.ToString("N0") + " - " + totalPrice.ToString("N0") + " ₫";
                        }
                        else
                        {
                            representativePackage.Price = "Liên hệ";
                        }

                        processedGroups[group.Key] = representativePackage;
                    }

                    var pagedGroups = processedGroups
                        .OrderBy(g => g.Key)
                        .Skip((page - 1) * size)
                        .Take(size)
                        .Select(g => g.Value)
                        .ToList();

                    var result = new Paginate<PackageViewModel>
                    {
                        Page = page,
                        Size = size,
                        Total = groupedPackages.Count,
                        TotalPages = (int)Math.Ceiling(groupedPackages.Count / (double)size),
                        Items = pagedGroups
                    };

                    return new MethodResult<IPaginate<PackageViewModel>>.Success(result);
                }
                else
                {
                    var packageEntities = await _uow.GetRepository<Package>().GetPagingListAsync(
                        selector: p => p,
                        predicate: predicate,
                        include: i => i.Include(p => p.BlindBoxes).ThenInclude(p => p.BlindBoxFeatures).ThenInclude(p => p.Feature)
                                     .Include(p => p.PackageImages)
                                     .Include(p => p.Category),
                        orderBy: BuildOrderBy(model.sortBy),
                        page: page,
                        size: size
                    );

                    var packageViewModels = new List<PackageViewModel>();
                    foreach (var entity in packageEntities.Items)
                    {
                        var packageVM = _mapper.Map<PackageViewModel>(entity);

                        // When not grouping, each package has a count of 1
                        packageVM.TotalPackage = 1;
                        packageVM.TotalBlindBox = packageVM.BlindBoxes.Count;

                        var filteredBlindBoxes = packageVM.BlindBoxes
                            .Where(bb => !useAvailableOnly || !bb.IsSold)
                            .ToList();

                        if (filteredBlindBoxes.Any())
                        {
                            decimal minPrice = filteredBlindBoxes.Min(b => b.DiscountedPrice);
                            decimal totalPrice = filteredBlindBoxes.Sum(b => b.DiscountedPrice);

                            packageVM.Price = minPrice == totalPrice
                                ? minPrice.ToString("N0") + " ₫"
                                : minPrice.ToString("N0") + " - " + totalPrice.ToString("N0") + " ₫";
                        }
                        else
                        {
                            packageVM.Price = "Liên hệ";
                        }

                        //packageVM.Pack = filteredBlindBoxes
                        //    .OrderBy(b => b.Number)
                        //    .Select(b => b.Number)
                        //    .ToList();

                        packageViewModels.Add(packageVM);
                    }

                    var result = new Paginate<PackageViewModel>
                    {
                        Page = packageEntities.Page,
                        Size = packageEntities.Size,
                        Total = packageEntities.Total,
                        TotalPages = packageEntities.TotalPages,
                        Items = packageViewModels
                    };

                    return new MethodResult<IPaginate<PackageViewModel>>.Success(result);
                }
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

                //if (package.BlindBoxes != null && package.BlindBoxes.Count != 0)
                //{
                //    foreach (var blindBox in package.BlindBoxes)
                //    {               
                //        var imagetoDels = await _uow.GetRepository<BlindBoxImage>().GetListAsync(
                //                predicate: p => p.BlindBoxId == blindBox.BlindBoxId
                //            );
                //        if (imagetoDels.Any())
                //        {
                //            _uow.GetRepository<BlindBoxImage>().DeleteRangeAsync(imagetoDels);
                //        }

                //        var imageUrls = await _cloudinaryService.UploadMultipleImagesAsync(blindBox.ImageFiles)
                            
                //        }
                //    }
                //}

                

                // Update BlindBoxes
                //if (request.BlindBoxes != null && request.BlindBoxes.Any())
                //{
                //    var existingBlindBoxIds = package.BlindBoxes.Select(bb => bb.BlindBoxId).ToList();
                //    var requestBlindBoxIds = request.BlindBoxes
                //        .Where(bb => bb.BlindBoxId.HasValue)
                //        .Select(bb => bb.BlindBoxId.Value)
                //        .ToList();

                //    foreach (var blindBoxReq in request.BlindBoxes.Where(bb => bb.BlindBoxId.HasValue))
                //    {
                //        // Update existing BlindBox
                //        if (existingBlindBoxIds.Contains(blindBoxReq.BlindBoxId.Value))
                //        {
                //            var updateResult = await _blindBoxService.UpdateBlindBoxAsync(
                //                blindBoxReq.BlindBoxId.Value, blindBoxReq);

                //            if (updateResult is MethodResult<string>.Failure)
                //            {
                //                await _uow.RollbackTransactionAsync();
                //                return updateResult;
                //            }
                //        }
                //    }

                //    // Create new BlindBoxes
                //    foreach (var blindBoxReq in request.BlindBoxes.Where(bb => !bb.BlindBoxId.HasValue))
                //    {
                //        var createResult = await _blindBoxService.CreateBlindBoxAsync(package.PackageId, blindBoxReq);

                //        if (createResult is MethodResult<string>.Failure)
                //        {
                //            await _uow.RollbackTransactionAsync();
                //            return createResult;
                //        }
                //    }

                //    var blindBoxesToRemove = package.BlindBoxes
                //        .Where(bb => !requestBlindBoxIds.Contains(bb.BlindBoxId) && !bb.IsSold)
                //        .ToList();

                //    foreach (var blindBox in blindBoxesToRemove)
                //    {
                //        // Delete features and images
                //        foreach (var feature in blindBox.BlindBoxFeatures.ToList())
                //        {
                //            _uow.GetRepository<BlindBoxFeature>().DeleteAsync(feature);
                //        }

                //        foreach (var image in blindBox.BlindBoxImages.ToList())
                //        {
                //            _uow.GetRepository<BlindBoxImage>().DeleteAsync(image);
                //        }

                //        _uow.GetRepository<BlindBox>().DeleteAsync(blindBox);
                //    }
                //}

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

        public async Task<MethodResult<string>> CreateUnknownPackageAsync(PackageUnknownCreateRequest request)
        {
            try
            {
                await _uow.BeginTransactionAsync();
                for (int i = 0; i < request.AmountPackage; i++)
                {
                    var package = _mapper.Map<Package>(request);

                    var imageUrls = await _cloudinaryService.UploadMultipleImagesAsync(request.PakageImages);

                    if (imageUrls.Count != 0)
                    {
                        foreach (var url in imageUrls)
                        {
                            var packageImage = new PackageImage
                            {
                                Url = url
                            };

                            package.PackageImages.Add(packageImage);
                        }
                    }

                    for (int j = 0; j < request.AmountBlindBox; j++)
                    {
                        var blindBox = new BlindBox
                        {
                            Price = request.Price,
                            Discount = request.Discount,
                            IsKnowned = false,
                            IsSpecial = false,
                            IsSold = false,
                            Number = j + 1,
                        };
                        package.BlindBoxes.Add(blindBox);
                    }

                    await _uow.GetRepository<Package>().InsertAsync(package);
                }

                await _uow.CommitAsync();
                await _uow.CommitTransactionAsync();
                return new MethodResult<string>.Success("Package Unknown created successfully");
            }
            catch (Exception ex)
            {
                await _uow.RollbackTransactionAsync();
                return new MethodResult<string>.Failure(ex.Message, StatusCodes.Status500InternalServerError);
            }
        }

        public async Task<MethodResult<string>> CreateKnownPackageAsync(PackageKnownCreateRequest request)
        {
            try
            {
                await _uow.BeginTransactionAsync();

                var package = _mapper.Map<Package>(request);

                var imageUrls = await _cloudinaryService.UploadMultipleImagesAsync(request.PakageImages);

                if (imageUrls.Count != 0)
                {
                    foreach (var url in imageUrls)
                    {
                        var packageImage = new PackageImage
                        {
                            Url = url
                        };

                        package.PackageImages.Add(packageImage);
                    }
                }
                int number = 1;
                foreach (var blindBoxRequest in request.BlindBoxes)
                {
                    var blindBox = _mapper.Map<BlindBox>(blindBoxRequest);
                    blindBox.Number = number++;

                    var blindBoxImageUrls = await _cloudinaryService.UploadMultipleImagesAsync(blindBoxRequest.BlindBoxImages);
                    if (blindBoxImageUrls.Count != 0)
                    {
                        foreach (var url in blindBoxImageUrls)
                        {
                            var blindBoxImage = new BlindBoxImage
                            {
                                Url = url
                            };
                            blindBox.BlindBoxImages.Add(blindBoxImage);
                        }
                    }
                    package.BlindBoxes.Add(blindBox);
                }

                await _uow.GetRepository<Package>().InsertAsync(package);
                await _uow.CommitAsync();
                await _uow.CommitTransactionAsync();
                return new MethodResult<string>.Success("Package Known created successfully");
            }
            catch (Exception ex)
            {
                await _uow.RollbackTransactionAsync();
                return new MethodResult<string>.Failure(ex.Message, StatusCodes.Status500InternalServerError);
            }
        }
    }
}