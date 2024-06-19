namespace AzureSLA.Shared
{
    public class DaemonConfig
    {
        public AzureOpenAIConfig GetAzureOpenAIConfig() 
        {
            var endpoint = GetEnvironmentVariableAsString("AZURE_OPENAI_ENDPOINT", "https://api.openai.com");
            var key = GetEnvironmentVariableAsString("AZURE_OPENAI_API_KEY", "");
            var deploymentName = GetEnvironmentVariableAsString("AZURE_OPENAI_GPT_DEPLOYMENT_ID", "");
            return new AzureOpenAIConfig(endpoint, key, deploymentName);
        }


        private static string GetEnvironmentVariableAsString(string name, string defaultValue)
        {
            var value = Environment.GetEnvironmentVariable(name);
            return string.IsNullOrWhiteSpace(value) ? defaultValue : value;
        }

        private static bool GetEnvironmentVariableAsBool(string name, bool defaultValue)
        {
            var value = ReadEnvironmentKey(name);
            return string.IsNullOrWhiteSpace(value) ? defaultValue : bool.Parse(value);
        }

        private static string ReadEnvironmentKey(string key)
        {
            var value = Environment.GetEnvironmentVariable(key);
            if (string.IsNullOrEmpty(value))
            {
                throw new InvalidOperationException($"Environment variable {key} is not set");
            }
            return value;
        }
    }

    public record AzureOpenAIConfig(string endpoint, string key, string deploymentName);
}
