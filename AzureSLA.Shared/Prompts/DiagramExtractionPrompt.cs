
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
Your response MUST always be in JSON, no text before or after. The response MUST adhere to the following schemas:
```
export interface AzureResource {    
    name: string;
    placement: REGIONAL | ZONAL | GLOBAL | UNKNOWN;
    tier: Data | Compute | Storage | Networking | Security | Identity | Developer | Monitoring | UNKNOWN;
    type: string;
    count: number;
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
    }
}
