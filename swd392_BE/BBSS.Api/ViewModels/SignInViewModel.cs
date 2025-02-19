using BBSS.Api.Models.AuthenticationModel;

namespace BBSS.Api.ViewModels
{
    public class SignInViewModel
    {
        public AccessToken AccessToken { get; set; }
        public RefreshToken RefreshToken { get; set; }
    }
}
