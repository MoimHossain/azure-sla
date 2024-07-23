using System.Text.Json.Serialization;
using System.Text.Json;
using AzureSLA.Shared;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Microsoft.Extensions.Options;
using SLAFrontend;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddRazorPages(razorPageOptions => 
{
    razorPageOptions.Conventions.Add(new HomePageRouteModelConvention());
});
builder.Services.AddControllers();
builder.Services.AddLogging(logging =>
{
    logging.AddConfiguration(builder.Configuration.GetSection("Logging"));
    logging.AddConsole();
    logging.AddDebug();
});
builder.Services.AddSingleton(services =>
{
    var jsonSerializerOptions = new JsonSerializerOptions
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = true,
        AllowTrailingCommas = true,
        PropertyNameCaseInsensitive = true
    };
    jsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    return jsonSerializerOptions;
});
builder.Services.AddTransient<TokenValidator>();
builder.Services.AddHttpClient();
builder.Services.AddRequiredServices();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapRazorPages();
//app.MapFallbackToPage("/Home");
app.MapControllers(); // Add this line to map controllers

app.Run();
