namespace ResourceApi.Models
{
	public class Pokemon
	{
		public int Id { get; set; }
		public string Name { get; set; } = string.Empty;
		public string Type { get; set; } = string.Empty;
		public int BaseExperience { get; set; }
		public int Generation { get; set; }
	}
}
