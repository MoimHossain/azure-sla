
namespace AzureSLA.Shared.Prompts
{
    public class DiagramExtractionPrompt
    {
        public async Task<SystemChatMessage> GetSystemPromptAsync(CancellationToken cancellationToken)
        {
            await Task.CompletedTask;
            return new SystemChatMessage(
"""
You MUST generate JSON data structure for the used Azure services into a given Azure Solution Diagram.
Each rectangle in the diagram represents a region, stamp or group of services. The diagram can contain multiple regions, stamps or groups.
If you know the SLA for that service please provide it, otherwise provide 99.9.
Your response MUST always be in JSON, no text before or after. The response MUST adhere to the following schemas:
```
export enum PLACEMENT {
    STAMP = "Stamp",
    Group = "Group",
    REGIONAL = "Regional",
    ZONAL = "Zonal",
    GLOBAL = "Global",
    UNKNOWN = "Unknown"
}

export interface AzureResource {    
    name: string;
    placement: PLACEMENT;
    StampName?: string;
    tier: Data | Compute | Storage | Messaging | Networking | TrafficRouting | Security | Identity | Developer | Monitoring | UNKNOWN;
    type: string;
    count: number;
    sla: number;
    location: string;
}
```
"""
                );
        }

        public async Task<UserChatMessage> GetUserPromptAsync(CancellationToken cancellationToken)
        {
            await Task.CompletedTask;
            return new UserChatMessage("Please give me the azure resources used into this diagram in JSON format.");
        }

        public async Task<UserChatMessage> GetImagePromptAsync(
            BinaryData diagramData,
            string mimeType,
            CancellationToken cancellationToken)
        {
            await Task.CompletedTask;
            var diagramMessage = ChatMessageContentPart.CreateImageMessageContentPart(diagramData, mimeType);
            return new UserChatMessage(diagramMessage);
        }
    }
}
