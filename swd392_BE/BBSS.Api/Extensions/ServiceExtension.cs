using BBSS.Api.Services.Implements;
using BBSS.Api.Services.Interfaces;
using BBSS.Domain.Entities;
using BBSS.Repository.Implement;
using BBSS.Repository.Interfaces;
using MailKit.Net.Smtp;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using System.Net.Mail;

namespace BBSS.Api.Extensions
{
    public static class ServiceExtension
    {
        public static IServiceCollection AddService(this IServiceCollection service)
        {
            service.AddTransient<IUnitOfWork, UnitOfWork<BlindboxDbContext>>();
            service.AddTransient(typeof(IGenericRepository<>), typeof(GenericRepository<>));

            service.AddTransient<IAuthenticationService, AuthenticationService>();
            service.AddTransient<IEmailService, EmailService>();
            service.AddTransient<ISmtpClient, MailKit.Net.Smtp.SmtpClient>();
            service.AddTransient<ITokenGenerator, TokenGenerator>();
            service.AddTransient<ITokenValidator, TokenValidator>();
            service.AddTransient<IUserService, UserService>();
            service.AddTransient<IOrderService, OrderService>();
            service.AddTransient<IPaymentService, PaymentService>();
            service.AddTransient<IExcelService, ExcelService>();
            service.AddTransient<IWheelService, WheelService>();
            service.AddTransient<IPackageService, PackageService>();
            service.AddTransient<ICloudinaryService, CloudinaryService>();
            service.AddTransient<IBlindBoxService, BlindBoxService>();
            service.AddTransient<ICategoryService, CategoryService>();

            return service;
        }
    }
}
