using BBSS.Api.Constants;
using BBSS.Api.Helper;
using BBSS.Api.Models.Configurations;
using BBSS.Api.Models.VnPayModel;
using BBSS.Api.Services.Interfaces;
using BBSS.Domain.Entities;
using BBSS.Repository.Interfaces;
using Microsoft.Extensions.Options;
using static Org.BouncyCastle.Math.EC.ECCurve;

namespace BBSS.Api.Services.Implements
{
    public class WheelService : IWheelService
    {
        private readonly IUnitOfWork _uow;

        public WheelService(IUnitOfWork uow)
        {
            _uow = uow;
        }

        public async Task<MethodResult<IEnumerable<BlindBox>>> GetWheelAsync()
        {
            var result = await _uow.GetRepository<BlindBox>().GetListAsync(
                predicate: p => p.IsKnowned
            );

            return new MethodResult<IEnumerable<BlindBox>>.Success(result);
        }

        public async Task<MethodResult<string>> PlayWheelAsync(string email)
        {
            var result = await _uow.GetRepository<BlindBox>().GetListAsync(
                predicate: p => p.IsKnowned && !p.IsSold
            );

            if (result.Count == 0)
            {
                return new MethodResult<string>.Failure("No box available", 404);
            }

            var random = new Random();
            var index = random.Next(0, result.Count);
            var blindBox = result.ToList()[index];

            blindBox.IsSold = true;
            _uow.GetRepository<BlindBox>().UpdateAsync(blindBox);

            var user = await _uow.GetRepository<User>().SingleOrDefaultAsync(
                predicate: p => p.Email == email
            );

            await CreateInventoryItem(user, blindBox.BlindBoxId);
            await _uow.CommitAsync();

            return new MethodResult<string>.Success(blindBox.BlindBoxId.ToString());
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
