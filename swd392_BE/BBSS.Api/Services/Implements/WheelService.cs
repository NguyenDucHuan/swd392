using AutoMapper;
using BBSS.Api.Constants;
using BBSS.Api.Helper;
using BBSS.Api.Models.Configurations;
using BBSS.Api.Models.VnPayModel;
using BBSS.Api.Services.Interfaces;
using BBSS.Api.ViewModels;
using BBSS.Domain.Entities;
using BBSS.Domain.Paginate;
using BBSS.Repository.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Swashbuckle.AspNetCore.SwaggerGen;
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

        public async Task<MethodResult<WheelViewModel>> GetWheelAsync(string packageCode)
        {
            var blindBoxes = await _uow.GetRepository<BlindBox>().GetListAsync(
                selector: s => _mapper.Map<BlindBoxViewModel>(s),
                predicate: p => p.IsKnowned && !p.IsSold && (string.IsNullOrEmpty(packageCode) || p.Package.PakageCode == packageCode),
                include: i => i.Include(p => p.Package)
                               .Include(p => p.BlindBoxFeatures).ThenInclude(p => p.Feature)
                               .Include(p => p.BlindBoxImages)

            );
            var totalBlindBoxes = blindBoxes.Count;

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

            var result = new WheelViewModel
            {                               
                Price = blindBoxes.Average(b => b.DiscountedPrice),
                TotalBlindBoxes = totalBlindBoxes,
                WheelBlindBoxes = whellBlindBoxes
            };

            return new MethodResult<WheelViewModel>.Success(result);
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

                _uow.GetRepository<BlindBox>().UpdateAsync(blindBox);
                await CreateInventoryItem(user, blindBox.BlindBoxId);
                result.Add(blindBox.BlindBoxId);
                blindBoxes.Remove(blindBox);
            }
            
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
    }
}
