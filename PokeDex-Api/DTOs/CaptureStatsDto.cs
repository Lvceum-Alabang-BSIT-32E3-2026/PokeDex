public class CaptureStatsDto
{
	public int totalCaptured { get; set; }
	public int totalAvailable { get; set; }
	public double percentComplete { get; set; }
	public List<GenerationStatsDto> byGeneration { get; set; }
}