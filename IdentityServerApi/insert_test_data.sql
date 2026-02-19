-- Insert sample Pokemon data
INSERT INTO Pokemons (Name, Type) VALUES
('Pikachu', 'Electric'),
('Charizard', 'Fire'),
('Blastoise', 'Water'),
('Bulbasaur', 'Grass'),
('Mewtwo', 'Psychic');

-- Insert sample Capture data
INSERT INTO Captures (UserId, PokemonId, CapturedAt) VALUES
('user-123', 1, GETUTCDATE()),
('user-123', 3, GETUTCDATE()),
('user-456', 1, GETUTCDATE()),
('user-456', 2, GETUTCDATE());

-- Verify the data
SELECT * FROM Pokemons;

SELECT 
    c.Id,
    c.UserId,
    p.Name as PokemonName,
    p.Type,
    c.CapturedAt
FROM Captures c
INNER JOIN Pokemons p ON c.PokemonId = p.Id;
