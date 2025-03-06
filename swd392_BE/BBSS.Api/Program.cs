
using BBSS.Api.Extensions;
using BBSS.Api.Models.Configurations;
using BBSS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

namespace BBSS.Api
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddService().AddAuthenticationConfig()
                            ;

            builder.Services.AddControllers()
                .AddJsonOptions(options =>
                {
                    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.Preserve;
                    options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
                    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
                });// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle

            builder.Services.AddDbContext<BlindboxDbContext>(options =>
                options.UseMySql(builder.Configuration.GetConnectionString("BlindBoxDbConnection"),
                new MySqlServerVersion(new Version(8, 0, 37))));
            builder.Services.Configure<MailConfiguration>(builder.Configuration.GetSection("MailConfiguration"));
            builder.Services.Configure<AuthenticationConfiguration>(builder.Configuration.GetSection("AuthenticationConfiguration"));
            builder.Services.Configure<VnPayConfig>(builder.Configuration.GetSection("VnPayConfig"));

            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();

            builder.Services.AddSwaggerConfig();

            //CORS
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                {
                    policy.WithOrigins("http://localhost:5173") // Your frontend URL
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials(); // Important for cookies/auth
                });
            });


            // Load assemblies for auto mapper to scan
            var assemblies = AppDomain.CurrentDomain.GetAssemblies()
                                .Where(a => !a.IsDynamic)
                                .ToArray();

            builder.Services.AddAutoMapper(assemblies);

            var app = builder.Build();

            app.UseCors("AllowNextApp");

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();
            app.UseCors("AllowFrontend");
            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            app.Run();
        }
    }
}
