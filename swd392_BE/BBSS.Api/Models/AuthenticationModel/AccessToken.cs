﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BBSS.Api.Models.AuthenticationModel
{
    public class AccessToken
    {
        public string Token { get; set; }
        public DateTime ExpirationTime { get; set; }
    }
}
