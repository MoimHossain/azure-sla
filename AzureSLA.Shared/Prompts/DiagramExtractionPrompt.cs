/*
 

Each rectangle in the diagram represents a region, stamp or group of services. The diagram can contain multiple regions, stamps or groups.
Always group services if they are surrounded by a rectangle.
Each rectangle should be named with 'StampName'. Unless Stamp Name are given in diagram, assign 'Stamp 1', 'Stamp 2' or 'Stamp A','Stamp B' etc. But StampName can't be empty 
If you know the SLA for that service please provide it, otherwise provide 99.9.
Your response MUST always be in JSON, no text before or after. The response MUST adhere to the following schemas:
*/

namespace AzureSLA.Shared.Prompts
{
    public class DiagramExtractionPrompt
    {
        public async Task<SystemChatMessage> GetSystemPromptAsync(CancellationToken cancellationToken)
        {
            await Task.CompletedTask;
            return new SystemChatMessage(
"""
You MUST generate JSON data structure for the used Azure services into a given Azure Solution Diagram. You MUST follow the following rules:
1. Every Azure service in the diagram should be placed into its immediate parent rectangle. 
2. Every rectangle should be named with an unique 'StampName'.
    2a. If Stamp Name is missing for a rectangle, assign 'Stamp 1', 'Stamp 2' or 'Stamp A','Stamp B' etc.
    2b. When stamp name is missing the placement value can also be used as StampName.
    2c. StampName can't be empty!
    2d. Do not use the same StampName for multiple rectangles.
3. If you know the SLA for that service please provide it, otherwise provide 99.9.
4. Your response MUST always be in JSON, no text before or after. The response MUST adhere to the following schemas:
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
