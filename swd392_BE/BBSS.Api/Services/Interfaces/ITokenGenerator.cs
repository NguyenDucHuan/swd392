﻿using BBSS.Api.Models.AuthenticationModel;
using BBSS.Domain.Entities;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace BBSS.Api.Services.Interfaces
{
    public interface ITokenGenerator
    {
        Task<AccessToken> GenerateAccessToken(User user);
        Task<RefreshToken> GenerateRefreshToken();
        Task<string> GenerateEmailVerificationToken(string email);
    }
}
