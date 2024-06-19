

namespace AzureSLA.Shared.CognitiveServices
{
    public class DiagramAnalyzeService(
        DaemonConfig config,
        JsonSerializerOptions jsonSerializerOptions,
        AzureOpenAIClient azureOpenAIClient,
        DiagramExtractionPrompt diagramExtractionPrompt,
        ILogger<DiagramAnalyzeService> logger)
    {
        public async Task<List<AzureComponent>?> AnalyzeAsync(
            BinaryData diagramData, 
            string mimeType, 
            CancellationToken cancellationToken)
        {
            try
            {
                var chatClient = CreateChatClient(config, azureOpenAIClient);

                var systemPrompt = await diagramExtractionPrompt
                    .GetSystemPromptAsync(cancellationToken);
                var diagramMessage = await diagramExtractionPrompt
                    .GetImagePromptAsync(diagramData, mimeType, cancellationToken);
                var userPrompt = await diagramExtractionPrompt
                    .GetUserPromptAsync(cancellationToken);

                ChatMessage[] prompts = [systemPrompt, diagramMessage, userPrompt];
                ChatCompletion completion = await chatClient
                    .CompleteChatAsync(prompts, cancellationToken: cancellationToken);
                logger.LogInformation("{role}: {response}", completion.Role, completion.Content[0].Text);
                var components = AzureComponent.FromJson(completion.Content[0].Text, jsonSerializerOptions);

                return components;
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while analyzing the diagram");
            }
            return [];
        }

        private static ChatClient CreateChatClient(
            DaemonConfig config, AzureOpenAIClient azureOpenAIClient)
        {
            var azureOpenAIConfig = config.GetAzureOpenAIConfig();

            ChatClient chatClient = azureOpenAIClient.GetChatClient(azureOpenAIConfig.deploymentName);
            return chatClient;
        }
    }
}
