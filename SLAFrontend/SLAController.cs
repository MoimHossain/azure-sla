using AzureSLA.Shared.CognitiveServices;
using AzureSLA.Shared.CognitiveServices.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;



namespace SLAFrontend
{
    [Route("api/[controller]")]
    [ApiController]
    public class SLAController(
        DiagramAnalyzeService diagramAnalyzeService,
        TokenValidator tokenValidator,
        ILogger<SLAController> logger) : ControllerBase
    {   
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] DiagramPayload payload)
        {   
            var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");

            if(!string.IsNullOrWhiteSpace(token))
            {
                var authority = "https://cloudoven.eu.auth0.com/";
                var audience = "https://sla.octo-lamp.nl/";

                var cp = await tokenValidator.ValidateTokenAsync(token, authority, audience);

                if(cp == null)
                {
                    return Unauthorized();
                }
            }


            if (payload != null && !string.IsNullOrWhiteSpace(payload.Image))
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
                        // group by placement
                        var placementGroups = components.GroupBy(c => c.Placement);
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



    public class HomePageRouteModelConvention : IPageRouteModelConvention
    {
        public void Apply(PageRouteModel model)
        {
            if (model.RelativePath == "/Pages/Index.cshtml")
            {
                var currentHomePage = model.Selectors
                    .Single(s => s != null && 
                    s.AttributeRouteModel != null && 
                    s.AttributeRouteModel.Template == string.Empty);
                model.Selectors.Remove(currentHomePage);
            }

            if (model.RelativePath == $"/Pages/Home.cshtml")
            {
                model.Selectors.Add(new SelectorModel()
                {
                    AttributeRouteModel = new AttributeRouteModel
                    {
                        Template = string.Empty
                    }
                });
            }
        }
    }
}
