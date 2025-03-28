using AutoMapper;
using BBSS.Api.Constants;
using BBSS.Api.Helper;
using BBSS.Api.Models.Configurations;
using BBSS.Api.Models.OrderModel;
using BBSS.Api.Models.PackageModel;
using BBSS.Api.Models.VnPayModel;
using BBSS.Api.Services.Interfaces;
using BBSS.Api.ViewModels;
using BBSS.Domain.Entities;
using BBSS.Domain.Paginate;
using BBSS.Repository.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Linq.Expressions;
using static Org.BouncyCastle.Math.EC.ECCurve;

namespace BBSS.Api.Services.Implements
{
    public class WheelService : IWheelService
    {
        private readonly IUnitOfWork _uow;
        private readonly IMapper _mapper;

        public WheelService(IUnitOfWork uow, IMapper mapper)
        {
            _uow = uow;
            _mapper = mapper;
        }

        public async Task<MethodResult<IPaginate<WheelViewModel>>> GetWheelAsync(PaginateModel model)
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
                     (filter.Contains(p.CategoryId.ToString()))) &&
                     p.BlindBoxes.Any(bb => !bb.IsSold && bb.IsKnowned);

            var packages = await _uow.GetRepository<Package>().GetListAsync(
                        predicate: predicate,
                        include: i => i.Include(p => p.BlindBoxes)
                                       .Include(p => p.PackageImages),
                        orderBy: BuildOrderBy(model.sortBy)
                        );

            var groupedPackages = packages.GroupBy(p => p.PakageCode).ToDictionary(
                        g => g.Key,
                        g => new { Packages = g.ToList() }
                    );

            var processedGroups = new Dictionary<string, WheelViewModel>();
            foreach (var group in groupedPackages)
            {
                var allPackagesInGroup = group.Value.Packages;
                var representativePackage = allPackagesInGroup.OrderByDescending(p => p.BlindBoxes.Count(bb => !bb.IsSold)).First();
                var allBlindBoxes = allPackagesInGroup
                    .SelectMany(p => p.BlindBoxes)
                    .Where(bb => !bb.IsSold && bb.IsKnowned)
                    .ToList();
                var totalBlindBoxes = allBlindBoxes.Count;
                var rate = (float) allBlindBoxes.Count(bb => bb.IsSpecial) / totalBlindBoxes;
                var price = allBlindBoxes.Average(bb => bb.Price * (1 - bb.Discount / 100));

                var wheel = _mapper.Map<WheelViewModel>(representativePackage);
                wheel.PackageCode = group.Key;
                wheel.Price = price;
                wheel.TotalBlindBoxes = totalBlindBoxes;
                wheel.Rate = rate;
                
                processedGroups.Add(group.Key, wheel);
            }

            var pagedGroups = processedGroups
                        .OrderBy(g => g.Key)
                        .Skip((page - 1) * size)
                        .Take(size)
                        .Select(g => g.Value)
                        .ToList();

            var result = new Paginate<WheelViewModel>
            {
                Page = page,
                Size = size,
                Total = groupedPackages.Count,
                TotalPages = (int)Math.Ceiling(groupedPackages.Count / (double)size),
                Items = pagedGroups
            };
            
            return new MethodResult<IPaginate<WheelViewModel>>.Success(result);
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

        public async Task<MethodResult<WheelDetailViewModel>> GetWheelDetailAsync(string packageCode)
        {
            var blindBoxes = await _uow.GetRepository<BlindBox>().GetListAsync(
                selector: s => _mapper.Map<BlindBoxViewModel>(s),
                predicate: p => p.IsKnowned && !p.IsSold && (string.IsNullOrEmpty(packageCode) || p.Package.PakageCode == packageCode),
                include: i => i.Include(p => p.Package)
                               .Include(p => p.BlindBoxFeatures).ThenInclude(p => p.Feature)
                               .Include(p => p.BlindBoxImages)

            );
            var totalBlindBoxes = blindBoxes.Count;

            var package = await _uow.GetRepository<Package>().SingleOrDefaultAsync(
                predicate: p => string.IsNullOrEmpty(packageCode) || p.PakageCode == packageCode,
                include: i => i.Include(p => p.PackageImages),
                orderBy: o => o.OrderByDescending(p => p.PackageImages.Count)
            );
            var images = package.PackageImages.Select(p => _mapper.Map<ImageViewModel>(p)).ToList();

            var whellBlindBoxes = new List<WheelBlindBoxViewModel>();

            var groupedBlindBoxes = new Dictionary<(string, string), List<BlindBoxViewModel>> ();

            if (string.IsNullOrEmpty(packageCode))
            {
                groupedBlindBoxes = blindBoxes.GroupBy(g => ((string?)null, g.Color)).ToDictionary(
                    g => g.Key,
                    g => g.ToList()
                );
            }
            else
            {
                groupedBlindBoxes = blindBoxes.GroupBy(g => (g.PackageCode, g.Color)).ToDictionary(
                    g => g.Key,
                    g => g.ToList()
                );
            }

            foreach (var group in groupedBlindBoxes)
            {
                var wheelBlindBoxViewModel = new WheelBlindBoxViewModel
                {
                    PackageCode = group.Value.First().PackageCode,
                    Color = group.Key.Item2,
                    Quantity = group.Value.Count,
                    Rate = (float) group.Value.Count / totalBlindBoxes * 100,
                    BlindBoxes = group.Value,
                };

                whellBlindBoxes.Add(wheelBlindBoxViewModel);
            }

            var result = new WheelDetailViewModel
            {                               
                Price = blindBoxes.Average(b => b.DiscountedPrice),
                TotalBlindBoxes = totalBlindBoxes,
                Images = images,
                WheelBlindBoxes = whellBlindBoxes
            };

            return new MethodResult<WheelDetailViewModel>.Success(result);
        }

        public async Task<MethodResult<IEnumerable<int>>> PlayWheelAsync(string email, string packageCode, int times, decimal amount)
        {
            var user = await _uow.GetRepository<User>().SingleOrDefaultAsync(
                predicate: p => p.Email == email
            );

            if (user.WalletBalance < amount)
            {
                return new MethodResult<IEnumerable<int>>.Failure("Wallet is not enough", 404);
            }

            user.WalletBalance -= amount;

            var blindBoxes = await _uow.GetRepository<BlindBox>().GetListAsync(
                predicate: p => p.IsKnowned && !p.IsSold && (string.IsNullOrEmpty(packageCode) || p.Package.PakageCode == packageCode)
            );

            if (blindBoxes.Count < times)
            {
                return new MethodResult<IEnumerable<int>>.Failure("Box is not enough", 404);
            }

            var result = new List<int>();

            for (int i = 0; i < times; i++)
            {
                var random = new Random();
                var index = random.Next(0, blindBoxes.Count);
                var blindBox = blindBoxes.ToList()[index];                
                blindBox.IsSold = true;

                _uow.GetRepository<User>().UpdateAsync(user);
                _uow.GetRepository<BlindBox>().UpdateAsync(blindBox);
                await CreateInventoryItem(user, blindBox.BlindBoxId);
                result.Add(blindBox.BlindBoxId);
                blindBoxes.Remove(blindBox);
            }

            await CreateBlindBoxOpenTransactionAsync(user.UserId, times, amount);
            await _uow.CommitAsync();

            return new MethodResult<IEnumerable<int>>.Success(result);
        }

        private async Task CreateInventoryItem(User user, int blindBoxId)
        {
            var inventoryItem = new InventoryItem
            {
                UserId = user.UserId,
                BlindBoxId = blindBoxId,
                AddDate = DateTime.Now,
                Status = InventoryConstant.INVENTORY_STATUS_AVAILABLE
            };
            await _uow.GetRepository<InventoryItem>().InsertAsync(inventoryItem);
        }

        private async Task CreateBlindBoxOpenTransactionAsync(int userId, int times, decimal amount)
        {
            var transaction = new Transaction
            {
                Amount = amount,
                CreateDate = DateTime.Now,
                Type = TransactionConstant.TRANSACTION_TYPE_BLINDBOXOPEN,
                UserId = userId,
                Description = $"User có ID {userId} chơi vòng quay may mắn {times} lần với số tiền {amount}"
            };

            await _uow.GetRepository<Transaction>().InsertAsync(transaction);
        }

        public async Task<MethodResult<string>> CreateOrderWheelAsync(int userId, OrderWheelCreateRequest request)
        {
            try
            {
                await _uow.BeginTransactionAsync();
                var order = _mapper.Map<Order>(request);
                order.UserId = userId;

                await _uow.GetRepository<Order>().InsertAsync(order);
                await _uow.CommitAsync();

                foreach (var blindBoxId in request.BlindBoxIds)
                {
                    var orderDetail = new OrderDetail
                    {
                        OrderId = order.OrderId,
                        BlindBoxId = blindBoxId,
                        UnitPrice = request.TotalAmount / request.BlindBoxIds.Count
                    };
                    await _uow.GetRepository<OrderDetail>().InsertAsync(orderDetail);

                    var inventoryItem = await _uow.GetRepository<InventoryItem>().SingleOrDefaultAsync(
                        predicate: p => p.UserId == userId && p.BlindBoxId == blindBoxId && p.Status == InventoryConstant.INVENTORY_STATUS_AVAILABLE
                    );

                    inventoryItem.Status = InventoryConstant.INVENTORY_STATUS_OWNED;
                    _uow.GetRepository<InventoryItem>().UpdateAsync(inventoryItem);
                }

                var orderStatus = new OrderStatus
                {
                    OrderId = order.OrderId,
                    Status = OrderConstant.ORDER_STATUS_PAID,
                    UpdateTime = DateTime.Now
                };
                await _uow.GetRepository<OrderStatus>().InsertAsync(orderStatus);                

                await _uow.CommitAsync();
                await _uow.CommitTransactionAsync();
                return new MethodResult<string>.Success("Create order wheel successfully");
            }
            catch (Exception e)
            {
                await _uow.RollbackTransactionAsync();
                return new MethodResult<string>.Failure(e.ToString(), StatusCodes.Status500InternalServerError);
            }
        }
    }
}
