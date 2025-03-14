using BBSS.Api.Models.Configurations;
using CloudinaryDotNet.Actions;
using CloudinaryDotNet;
using Microsoft.Extensions.Options;
using BBSS.Api.Services.Interfaces;

namespace BBSS.Api.Services.Implements
{
    public class CloudinaryService : ICloudinaryService
    {
        private readonly Cloudinary _cloudinary;

        public CloudinaryService(IOptions<CloudinarySettings> config)
        {
            var account = new Account(
                config.Value.CloudName,
                config.Value.ApiKey,
                config.Value.ApiSecret);

            _cloudinary = new Cloudinary(account);
        }

        public async Task<string> UploadImageAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return null;

            // Tạo stream từ file
            using var stream = file.OpenReadStream();

            // Upload parameters
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Transformation = new Transformation().Quality("auto").FetchFormat("auto")
            };

            // Upload to Cloudinary
            var result = await _cloudinary.UploadAsync(uploadParams);

            // Kiểm tra kết quả và trả về URL
            return result.Error != null ? null : result.SecureUrl.ToString();
        }

        public async Task<List<string>> UploadMultipleImagesAsync(List<IFormFile> files)
        {
            if (files == null || !files.Any())
                return new List<string>();

            var uploadTasks = files.Select(UploadImageAsync);
            var urls = await Task.WhenAll(uploadTasks);

            return urls.Where(url => url != null).ToList();
        }
    }
}
