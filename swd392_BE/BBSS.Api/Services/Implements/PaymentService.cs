using BBSS.Api.Constants;
using BBSS.Api.Helper;
using BBSS.Api.Models.Configurations;
using BBSS.Api.Models.VnPayModel;
using BBSS.Api.Services.Interfaces;
using BBSS.Domain.Entities;
using BBSS.Repository.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace BBSS.Api.Services.Implements
{
    public class PaymentService : IPaymentService
    {
        private readonly VnPayConfig _config;
        private readonly IUnitOfWork _uow;

        public PaymentService(IOptions<VnPayConfig> options, IUnitOfWork uow)
        {          
            _config = options.Value;
            _uow = uow;
        }

        public async Task<MethodResult<string>> CreatePaymentAsync(string email, int orderId, HttpContext httpContext)
        {
            var order = await _uow.GetRepository<Order>().SingleOrDefaultAsync(
                predicate: p => p.OrderId == orderId
            );

            var user = await _uow.GetRepository<User>().SingleOrDefaultAsync(
                predicate: p => p.Email == email
            );

            if (order.UserId != user.UserId)
            {
                return new MethodResult<string>.Failure("User have not this order", 400);
            }

            var orderStatus = await _uow.GetRepository<OrderStatus>().SingleOrDefaultAsync<string>(
                selector: s => s.Status,
                predicate: p => p.OrderId == orderId,
                orderBy: o => o.OrderByDescending(x => x.UpdateTime)
            );
            if (orderStatus != OrderConstant.ORDER_STATUS_PENDING)
            {
                return new MethodResult<string>.Failure($"Order Status is {orderStatus}", 400);
            }

            var vnpayModel = new VnPaymentRequestModel
            {
                Amount = (float)order.TotalAmount,
                OrderId = orderId,
                CreatedDate = DateTime.Now,
            };

            return await CreatePaymentUrl(httpContext, vnpayModel);
        }

        private async Task<MethodResult<string>> CreatePaymentUrl(HttpContext context, VnPaymentRequestModel model)
        {
            var tick = DateTime.Now.Ticks.ToString();

            var vnpay = new VnPayLibrary();

            vnpay.AddRequestData("vnp_Version", _config.Version);
            vnpay.AddRequestData("vnp_Command", _config.Command);
            vnpay.AddRequestData("vnp_TmnCode", _config.TmnCode);
            vnpay.AddRequestData("vnp_Amount", (model.Amount * 100).ToString()); //Số tiền thanh toán. Số tiền không mang các ký tự phân tách thập phân, phần nghìn, ký tự tiền tệ. Để gửi số tiền thanh toán là 100,000 VND (một trăm nghìn VNĐ thì merchant cần nhân thêm 100 lần(khử phần thập phân), sau đó gửi sang VNPAY là: 10000000                
            vnpay.AddRequestData("vnp_CreateDate", model.CreatedDate.ToString("yyyyMMddHHmmss"));
            vnpay.AddRequestData("vnp_CurrCode", _config.CurrCode);
            vnpay.AddRequestData("vnp_IpAddr", Utils.GetIpAddress(context));
            vnpay.AddRequestData("vnp_Locale", _config.Locale);

            vnpay.AddRequestData("vnp_OrderInfo", $"Thanh toán nạp tiền cho Order có ID {model.OrderId} với số tiền {model.Amount}");
            vnpay.AddRequestData("vnp_OrderType", "other"); //default value: other
            vnpay.AddRequestData("vnp_ReturnUrl", _config.ReturnUrl);
            vnpay.AddRequestData("vnp_TxnRef", tick); // Mã tham chiếu của giao dịch tại hệ thống của merchant.Mã này là duy nhất dùng để phân biệt các đơn hàng gửi sang VNPAY.Không được trùng lặp trong ngày    
            vnpay.AddRequestData("vnp_ExpireDate", DateTime.Now.AddMinutes(15).ToString("yyyyMMddHHmmss"));

            var paymentUrl = vnpay.CreateRequestUrl(_config.BaseUrl, _config.HashSecret);

            return await Task.FromResult(new MethodResult<string>.Success(paymentUrl));
        }

        public VnPaymentResponseModel PaymentExecute(IQueryCollection collections)
        {
            var vnpay = new VnPayLibrary();

            foreach (var (key, value) in collections)
            {
                if (!string.IsNullOrEmpty(key) && key.StartsWith("vnp_"))
                {
                    vnpay.AddResponseData(key, value.ToString());
                }
            }

            var vnp_OrderRefId = vnpay.GetResponseData("vnp_TxnRef");
            var vnp_TransactionId = vnpay.GetResponseData("vnp_TransactionNo");       
            var vnp_ResponseCode = vnpay.GetResponseData("vnp_ResponseCode");
            var vnp_SecureHash = collections.FirstOrDefault(x => x.Key == "vnp_SecureHash").Value;
            var vnp_OrderInfo = vnpay.GetResponseData("vnp_OrderInfo").ToString();
            var vnp_Amount = vnpay.GetResponseData("vnp_Amount");

            string pattern = @"ID \s*(\d+)\s* với số tiền";
            Regex regex = new Regex(pattern);
            Match match = regex.Match(vnp_OrderInfo);
            string vnp_OrderId = match.Groups[1].Value;

            bool checkSignature = vnpay.ValidateSignature(vnp_SecureHash, _config.HashSecret);

            if (!checkSignature)
            {
                return new VnPaymentResponseModel
                {
                    Success = false
                };
            }

            return new VnPaymentResponseModel
            {
                Success = true,
                PaymentMethod = "VnPay",
                OrderDescription = vnp_OrderInfo,
                OrderRefId = vnp_OrderRefId.ToString(),
                TransactionId = vnp_TransactionId.ToString(),
                Token = vnp_SecureHash.ToString(),
                VnPayResponseCode = vnp_ResponseCode.ToString(),
                Amount = double.Parse(vnp_Amount) / 100,
                OrderId = int.Parse(vnp_OrderId)
            };
        }

        public async Task<MethodResult<string>> ProcessResponseAsync(VnPaymentResponseModel response)
        {
            try
            {
                var order = await _uow.GetRepository<Order>().SingleOrDefaultAsync(
                    predicate: p => p.OrderId == response.OrderId
                );

                if (response.VnPayResponseCode != "00")
                {
                    return new MethodResult<string>.Failure("Payment fail", 400);
                }

                await CreateOrderStatusAsync(order);
                await CreateTransactionAsync(order, response);

                await _uow.CommitAsync();

                return new MethodResult<string>.Success("Payment success. Transaction Created");
            }
            catch (Exception e)
            {
                return new MethodResult<string>.Failure(e.ToString(), StatusCodes.Status500InternalServerError);
            }            
        }

        private async Task CreateOrderStatusAsync(Order order)
        {
            var orderStatus = new OrderStatus
            {
                OrderId = order.OrderId,
                Status = OrderConstant.ORDER_STATUS_PAID,
                UpdateTime = DateTime.Now
            };

            await _uow.GetRepository<OrderStatus>().InsertAsync(orderStatus);
        }

        private async Task CreateTransactionAsync(Order order, VnPaymentResponseModel response)
        {
            var transaction = new Transaction
            {
                Amount = order.TotalAmount,
                CreateDate = DateTime.Now,
                RelatedId = response.OrderId,
                Type = "Deduction",
                UserId = order.UserId,
                Description = response.OrderDescription
            };

            await _uow.GetRepository<Transaction>().InsertAsync(transaction);
        }                    

        public string GetRedirectUrl()
        {
            return _config.RedirectUrl;
        }
    }
}
