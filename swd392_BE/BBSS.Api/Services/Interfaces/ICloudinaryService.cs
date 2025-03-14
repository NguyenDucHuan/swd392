﻿namespace BBSS.Api.Services.Interfaces
{
    public interface ICloudinaryService
    {
        Task<string> UploadImageAsync(IFormFile file);
        Task<List<string>> UploadMultipleImagesAsync(List<IFormFile> files);
    }
}
