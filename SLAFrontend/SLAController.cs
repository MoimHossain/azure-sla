using AzureSLA.Shared;
using AzureSLA.Shared.CognitiveServices;
using AzureSLA.Shared.CognitiveServices.Models;
using Microsoft.AspNetCore.Mvc;



namespace SLAFrontend
{
    [Route("api/[controller]")]
    [ApiController]
    public class SLAController(DiagramAnalyzeService diagramAnalyzeService) : ControllerBase
    {
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] DiagramPayload payload)
        {
            if(payload != null && !string.IsNullOrWhiteSpace(payload.Image))
            {
                var parts = payload.Image.Split(',');

                if (parts.Length == 2)
                {
                    var mimeType = parts[0];
                    var base64 = parts[1];
                    mimeType = $"{mimeType}".Replace("data:", "").Replace(";base64", "");
                    BinaryData binaryData = new BinaryData(Convert.FromBase64String(base64));

                    var components = await diagramAnalyzeService.AnalyzeAsync(binaryData, mimeType, CancellationToken.None);

                    var groups = new List<ComponentGroup>();
                    if(components != null && components.Count > 0)
                    {
                        foreach (var component in components)
                        {
                            if(string.IsNullOrEmpty(component.StampName))
                            {
                                component.StampName = component.Placement.ToString();
                            }
                        }
                        // group by placement
                        var placementGroups = components.GroupBy(c => c.StampName);
                        foreach (var placementGroup in placementGroups)
                        {
                            var group = new ComponentGroup
                            {
                                GroupName= $"{placementGroup.Key}",
                                Components = placementGroup.ToList()
                            };
                            groups.Add(group);
                        }
                    }
                    return Ok(groups);
                }
            }
            return Ok();
        }
    }

    public record DiagramPayload(string? Image);
}
