

namespace AzureSLA.Shared.Prompts
{
    public class SlaExtractionPrompt
    {
        public async Task<SystemChatMessage> GetSystemPromptAsync(CancellationToken cancellationToken)
        {
            await Task.CompletedTask;
            return new SystemChatMessage(
"""
You know the following Azure services and their SLAs.
```
const ServiceSLA = {
    "Azure Active Directory": 99.99,
    "API Management": 99.99,
    "App Configuration": 99.9,
    "App Service": 99.99,
    "Application Gateway": 99.95,
    "Azure AI search": 99.9,
    "Azure Container Apps": 99.95,
    "Azure Container Instance": 99.9,
    "Azure Container Registry": 99.9,
    "Azure Cosmos DB": 99.999,
    "Azure Database for MariaDB": 99.99,
    "Azure Database for MySQL": 99.99,
    "Azure Database for PostgreSQL": 99.99,
    "Azure SQL Database": 99.995,
    "Azure DevOps": 99.9,
    "Azure DNS": 100,
    "Azure Firewall": 99.99,
    "Azure Front Door": 99.99,
    "Azure Kubernetes Service": 99.95,
    "Azure Logic Apps": 99.9,
    "Azure Monitor": 99.9,
    "Azure Red Hat OpenShift": 99.9,
    "Azure Sentinel": 99.9,
    "Azure Service Bus": 99.9,
    "Azure SignalR Service": 99.9,    
    "Azure Traffic Manager": 100,
    "Azure Web Apps": 99.95,
    "Azure Web PubSub": 99.9,
    "Azure Event Grid": 99.99,
    "Azure Event Hubs": 99.9,
    "Azure Functions": 99.95,
    "Azure Key Vault": 99.99,
    "Azure Virtual Network": 99.99,
    "Azure Cache for Redis": 99.9
}
```

You will be given a list of azure azure services, you need to fill up the SLA for each service.
"""
                );
        }
    }
}
