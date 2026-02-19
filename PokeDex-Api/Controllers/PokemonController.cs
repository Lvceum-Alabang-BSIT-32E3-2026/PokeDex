// TODO: This controller will be implemented in future tasks when IPokemonService and ICaptureService are created
/*
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
public class PokemonController : ControllerBase
{
	[HttpGet]
	public IActionResult GetAllPokemons()
	{
		var pokemons = _pokemonService.GetAll(); // placeholder for your service

		var userId = User?.Identity?.IsAuthenticated == true
					 ? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
					 : null;

		List<int> capturedPokemonIds = new List<int>();
		if (userId != null)
		{
			capturedPokemonIds = _captureService.GetCapturedPokemonIds(userId);
		}

		var pokemonDtos = pokemons.Select(p => new PokemonDto
		{
			Id = p.Id,
			Name = p.Name,
			Type = p.Type,
			IsCaptured = capturedPokemonIds.Contains(p.Id)
		}).ToList();

		return Ok(pokemonDtos);
	}

	private readonly IPokemonService _pokemonService;
	private readonly ICaptureService _captureService;

	public PokemonController(IPokemonService pokemonService, ICaptureService captureService)
	{
		_pokemonService = pokemonService;
		_captureService = captureService;
	}
}
*/
