# Card Data Structure

This document describes the structure of the `cards.json` file that contains all Star Wars: Unlimited card data.

## File Location
`src/data/cards.json`

## Structure

The file should be a JSON object with a `cards` array:

```json
{
  "cards": [
    {
      "id": "SOR-001",
      "name": "Luke Skywalker",
      "set": "SOR",
      "rarity": "Legendary",
      "type": "Leader",
      "aspects": ["Heroism", "Command"],
      "cost": 0,
      "isLeader": true,
      "isBase": false,
      "imageUrl": "https://swudb.com/images/cards/SOR-001.jpg"
    }
  ],
  "metadata": {
    "version": "1.0.0",
    "lastUpdated": "2025-01-14"
  }
}
```

## Card Object Properties

### Required Fields

- **id** (string): Unique identifier for the card (e.g., "SOR-001", "SHD-042")
- **name** (string): The card's name
- **set** (string): Set code - one of: `SOR`, `SHD`, `TWI`, `JTL`, `LOF`, `SEC`
- **rarity** (string): One of: `Common`, `Uncommon`, `Rare`, `Legendary`
- **type** (string): Card type - `Leader`, `Base`, `Unit`, `Event`, `Upgrade`, etc.
- **isLeader** (boolean): `true` if this is a leader card
- **isBase** (boolean): `true` if this is a base card

### Optional Fields

- **aspects** (array of strings): Card aspects (e.g., `["Villainy", "Command"]`, `["Heroism"]`, `["Cunning"]`)
- **cost** (number): Resource cost of the card
- **imageUrl** (string): URL to the card image
- **subtitle** (string): Card subtitle
- **text** (string): Card text/ability text
- **power** (number): Power value (for units)
- **health** (number): Health value (for units)
- **traits** (array of strings): Card traits (e.g., `["Jedi", "Rebel"]`)

## Set Codes

- **SOR**: Spark of Rebellion
- **SHD**: Shadows of the Galaxy
- **TWI**: Twilight of the Republic
- **JTL**: Jump to Lightspeed
- **LOF**: Legends of the Force
- **SEC**: Secrets of Power

## Rarity Values

- **Common**: Common rarity cards
- **Uncommon**: Uncommon rarity cards
- **Rare**: Rare rarity cards
- **Legendary**: Legendary rarity cards

## Card Types

- **Leader**: Leader cards (guaranteed 1 per pack)
- **Base**: Base cards (guaranteed 1 per pack)
- **Unit**: Unit cards
- **Event**: Event cards
- **Upgrade**: Upgrade cards
- **Resource**: Resource cards

## Example Card Entries

### Leader Card
```json
{
  "id": "SOR-001",
  "name": "Luke Skywalker",
  "set": "SOR",
  "rarity": "Legendary",
  "type": "Leader",
  "aspects": ["Heroism", "Command"],
  "cost": 0,
  "isLeader": true,
  "isBase": false,
  "imageUrl": "https://swudb.com/images/cards/SOR-001.jpg"
}
```

### Base Card
```json
{
  "id": "SOR-BASE-001",
  "name": "Rebel Base",
  "set": "SOR",
  "rarity": "Common",
  "type": "Base",
  "aspects": ["Heroism"],
  "cost": 0,
  "isLeader": false,
  "isBase": true,
  "imageUrl": "https://swudb.com/images/cards/SOR-BASE-001.jpg"
}
```

### Unit Card
```json
{
  "id": "SOR-042",
  "name": "Stormtrooper",
  "set": "SOR",
  "rarity": "Common",
  "type": "Unit",
  "aspects": ["Villainy"],
  "cost": 2,
  "power": 2,
  "health": 2,
  "isLeader": false,
  "isBase": false,
  "traits": ["Trooper"],
  "imageUrl": "https://swudb.com/images/cards/SOR-042.jpg"
}
```

## Populating the Data

To populate `cards.json`, you can:

1. **Manual Entry**: Add cards manually following the structure above
2. **API Integration**: Create a script to fetch cards from swudb.com API
3. **Import from CSV/Excel**: Convert existing card databases to JSON format

The app will automatically use cards from this file when generating booster packs.
