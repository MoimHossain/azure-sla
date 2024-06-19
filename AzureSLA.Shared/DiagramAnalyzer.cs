

namespace AzureSLA.Shared
{
    public class DiagramAnalyzer(
        DaemonConfig config,
        AzureOpenAIClient azureOpenAIClient,
        ImageHelper imageHelper)
    {
        public async Task AnalyzeAsync(string imagePath)
        {
            try
            {
                var azureOpenAIConfig = config.GetAzureOpenAIConfig();
                
                ChatClient chatClient = azureOpenAIClient.GetChatClient(azureOpenAIConfig.deploymentName);
                                
                var imageBase64 = await imageHelper.GetBase64EmbeddedUriForImageAsync(imagePath);

                var diagramMessage = ChatMessageContentPart.CreateImageMessageContentPart(imageBase64, "image/png");
                var textMessage = ChatMessageContentPart.CreateTextMessageContentPart("Can you list all the azure resources into the diagram?");

                ChatCompletion completion = await chatClient.CompleteChatAsync(
                    [
                        new SystemChatMessage("You are a helpful assistant that talks like a pirate."),
                        new UserChatMessage(diagramMessage),
                        new UserChatMessage(textMessage)
                    ]);

                Console.WriteLine($"{completion.Role}: {completion.Content[0].Text}");
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }            
        }
    }

 
}
