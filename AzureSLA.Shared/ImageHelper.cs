

namespace AzureSLA.Shared
{
    public class ImageHelper
    {
        // read an image from a folder path
        // then generate the image to its base64 data format example: data:image/png;base64,iVB....
        public async Task<BinaryData> GetBase64EmbeddedUriForImageAsync(string imagePath)
        {
            var imageBytes = await File.ReadAllBytesAsync(imagePath);
            var binaryData = new BinaryData(imageBytes);
            return binaryData;
        }
    }
}
