using AzureSLA.Shared.CognitiveServices;

namespace AzureSLA.Console
{
    public class Worker(
        DiagramAnalyzeService diagramAnalyzerService,
        ImageHelper imageHelper,
        ILogger<Worker> logger) : BackgroundService
    {
        protected async override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            logger.LogInformation("Worker running at: {time}", DateTimeOffset.Now);

            var imagePath = @"C:\Users\mohossa\Pictures\Saved Pictures\Architectures\demo.drawio.png";

            var imageBase64 = await imageHelper.GetBase64EmbeddedUriForImageAsync(imagePath);

            var components = await diagramAnalyzerService.AnalyzeAsync(imageBase64, "image/png", stoppingToken);

            if (components != null)
            {
                foreach (var component in components)
                {
                    logger.LogInformation("Component: {component}", component);
                }
            }
        }
    }
}
