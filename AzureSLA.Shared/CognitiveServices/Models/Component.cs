using System.Text.Json.Serialization;

namespace AzureSLA.Shared.CognitiveServices.Models
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum PLACEMENT
    {
        STAMP,
        REGIONAL,
        ZONAL,
        GLOBAL,
        UNKNOWN
    }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum TIER
    {
        Data,
        Compute,
        Storage,
        Messaging,
        TrafficRouting,
        Networking,
        Security,
        Identity,
        Developer,
        Monitoring,
        UNKNOWN
    }
    public class AzureComponent
    {
        public string Name { get; set; } = string.Empty;
        public PLACEMENT Placement { get; set; }
        public string StampName { get; set; } = string.Empty;
        public TIER Tier { get; set; }
        public string Type { get; set; } = string.Empty;
        public int Count { get; set; }
        public string Location { get; set; } = string.Empty;

        public string SLAString { get; set; } = string.Empty;
        public float SLA { get; set; }

        public static List<AzureComponent>? FromJson(string rawContent, JsonSerializerOptions jsonSerializerOptions)
        {
            rawContent = $"{rawContent}".Trim();
            // also cover text starts with ```json and ends with ```
            var startIndex = rawContent.IndexOf('[');
            var endIndex = rawContent.LastIndexOf(']');
            if (startIndex > -1 && endIndex > -1 && startIndex < endIndex)
            {
                rawContent = rawContent.Substring(startIndex, endIndex - startIndex + 1);
            }
            return JsonSerializer.Deserialize<List<AzureComponent>>(rawContent, jsonSerializerOptions);
        }

        public override string ToString()
        {
            return $"{Name} {Placement} ({Tier}) - {Location} ({Type})";
        }
    }

    public class ComponentGroup
    {
        public string GroupName { get; set; } = string.Empty;
        public List<AzureComponent> Components { get; set; } = [];
    }
}
