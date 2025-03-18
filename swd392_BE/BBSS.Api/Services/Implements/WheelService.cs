using AutoMapper;
using BBSS.Api.Constants;
using BBSS.Api.Helper;
using BBSS.Api.Models.Configurations;
using BBSS.Api.Models.VnPayModel;
using BBSS.Api.Services.Interfaces;
using BBSS.Api.ViewModels;
using BBSS.Domain.Entities;
using BBSS.Repository.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
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

        public async Task<MethodResult<WheelViewModel>> GetWheelAsync()
        {
            var blindBoxes = await _uow.GetRepository<BlindBox>().GetListAsync(
                predicate: p => p.IsKnowned && !p.IsSold
            );

            var packages = await _uow.GetRepository<Package>().GetListAsync<PackageViewModel>(
                selector: s => _mapper.Map<PackageViewModel>(s),
                predicate: p => p.BlindBoxes.Any(b => b.IsKnowned && !b.IsSold),
                include: i => i.Include(p => p.BlindBoxes)
                                     .Include(p => p.PackageImages)
                                     .Include(p => p.Category)
            );

            var result = new WheelViewModel
            {
                Packages = packages,
                Price = packages.Average(p => p.BlindBoxes.Average(b => b.Price))
            };

            return new MethodResult<WheelViewModel>.Success(result);
        }

        public async Task<MethodResult<IEnumerable<BlindBox>>> GetPriceWheelAsync()
        {
            var result = await _uow.GetRepository<BlindBox>().GetListAsync(
                predicate: p => p.IsKnowned
            );

            return new MethodResult<IEnumerable<BlindBox>>.Success(result);
        }

        public async Task<MethodResult<IEnumerable<int>>> PlayWheelAsync(string email, int times, decimal amount)
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
                predicate: p => p.IsKnowned && !p.IsSold
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
