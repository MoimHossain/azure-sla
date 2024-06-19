



namespace AzureSLA.Shared.CognitiveServices
{
    public class DiagramAnalyzeService(
        DaemonConfig config,
        AzureOpenAIClient azureOpenAIClient,
        DiagramExtractionPrompt diagramExtractionPrompt,
        ILogger<DiagramAnalyzeService> logger)
    {
        public async Task AnalyzeAsync(
            BinaryData diagramData, 
            string mimeType, 
            CancellationToken cancellationToken)
        {
            try
            {
                var chatClient = CreateChatClient(config, azureOpenAIClient);

                var diagramMessage = ChatMessageContentPart.CreateImageMessageContentPart(diagramData, mimeType);
                var textMessage = ChatMessageContentPart.CreateTextMessageContentPart("Can you list all the azure resources into the diagram?");

                ChatCompletion completion = await chatClient.CompleteChatAsync(
                    [
                        await diagramExtractionPrompt.GetSystemPromptAsync(cancellationToken),
                        new UserChatMessage(diagramMessage),
                        new UserChatMessage(textMessage)
                    ], cancellationToken: cancellationToken);

                logger.LogInformation($"{completion.Role}: {completion.Content[0].Text}");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error while analyzing the diagram");
            }
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
