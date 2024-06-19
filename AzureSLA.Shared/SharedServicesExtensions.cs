


namespace AzureSLA.Shared
{
    public static class SharedServicesExtensions
    {
        public static IServiceCollection AddRequiredServices(this IServiceCollection services)
        {
            services.AddSingleton<DaemonConfig>();
            services.AddSingleton(serviceProvider => 
            {
                var oaiConfig = serviceProvider.GetRequiredService<DaemonConfig>().GetAzureOpenAIConfig();
                var azureClient = new AzureOpenAIClient(
                    new Uri(oaiConfig.endpoint),
                    new AzureKeyCredential(oaiConfig.key));
                return azureClient;
            });
            services.AddSingleton<ImageHelper>();
            services.AddSingleton<DiagramAnalyzer>();

            return services;
        }
    }
}
