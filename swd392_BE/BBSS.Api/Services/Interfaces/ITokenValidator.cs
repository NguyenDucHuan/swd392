using BBSS.Api.Helper;

namespace BBSS.Api.Services.Interfaces
{
    public interface ITokenValidator
    {        
        MethodResult<string> GetEmailFromExpiredAccessToken(string token);
        bool ValidateRefreshToken(string token);
        Task<string> ValidateEmailVerificationToken(string token);
    }
}
