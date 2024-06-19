

using AzureSLA.Shared;

var config = new DaemonConfig();

var imagePath = @"C:\Users\mohossa\Pictures\Saved Pictures\Architectures\abc.png";

var diagramAnalyzer = new DiagramAnalyzer(config);

await diagramAnalyzer.AnalyzeAsync(imagePath);


Console.WriteLine("Hello, World!");
