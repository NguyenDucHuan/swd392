using BBSS.Api.Helper;
using BBSS.Api.Models.VnPayModel;
using BBSS.Domain.Entities;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BBSS.Api.Services.Interfaces
{
    public interface IPaymentService
    {
        VnPaymentResponseModel PaymentExecute(IQueryCollection collections);
        Task<MethodResult<string>> CreatePaymentAsync(string email, int orderId, string type, HttpContext httpContext);
        Task<MethodResult<string>> ProcessResponseAsync(VnPaymentResponseModel response);
        string GetRedirectUrl();
        Task<MethodResult<string>> AddToWalletAsync(string email, decimal amount, HttpContext httpContext);
    }
}
