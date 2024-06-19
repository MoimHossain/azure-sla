
namespace AzureSLA.Console
{
    public class Worker(
        DiagramAnalyzer diagramAnalyzer,
        ILogger<Worker> logger) : BackgroundService
    {
        protected async override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            logger.LogInformation("Worker running at: {time}", DateTimeOffset.Now);

            var imagePath = @"C:\Users\mohossa\Pictures\Saved Pictures\Architectures\abc.png";
            await diagramAnalyzer.AnalyzeAsync(imagePath);
            
            
        }
    }
}
