using BBSS.Api.Helper;

namespace BBSS.Api.Services.Interfaces
{
    public interface ITokenValidator
    {        
        MethodResult<string> GetEmailFromExpiredAccessToken(string token);
        bool ValidateRefreshToken(string token);
        MethodResult<string> ValidateEmailVerificationToken(string token);
    }
}
