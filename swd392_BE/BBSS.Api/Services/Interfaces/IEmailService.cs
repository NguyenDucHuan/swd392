using BBSS.Api.Helper;
using BBSS.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BBSS.Api.Services.Interfaces
{
    public interface IEmailService
    {
        Task<MethodResult<string>> SendAccountVerificationEmailAsync(User user);
    }
}
