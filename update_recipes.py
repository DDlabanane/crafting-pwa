import requests
import json

def fetch_recipes():
    print("Fetching recipes from Minecraft Data API...")
    # Using a common community API for Minecraft data
    # Note: API structures change, but we'll aim for a comprehensive set
    url = "https://minecraft-data.com/api/recipes" # Example endpoint

    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()

        # We need to transform the API data into the format the app uses
        # The app expects: { id, name, category, result, gridSize, grid, ingredients }
        processed_recipes = []

        for recipe in data:
            # This is where we "map" the API's weird names to our app's names
            # Note: If the API structure is different, this mapping will need adjustment
            item_id = recipe.get('id', 'unknown')
            name = recipe.get('name', item_id.replace('_', ' ').title())

            # Mocking category based on item name for this example
            # since most APIs don't provide a clean 'category'
            category = "General"
            if any(word in name.lower() for word in ['sword', 'axe', 'pickaxe', 'shovel', 'hoe']):
                category = "Tools"
            elif any(word in name.lower() for word in ['bread', 'apple', 'cake', 'cookie']):
                category = "Food"
            elif any(word in name.lower() for word in ['torch', 'crafting table', 'furnace']):
                category = "Utility"

            # Transform the pattern (e.g., ["DDD", " S ", " S "]) into a 2D array
            pattern = recipe.get('pattern', [])
            grid = []
            if pattern:
                # This is a simplification: we assume the API provides
                # the ingredients mapped to characters
                ingredients_map = recipe.get('ingredients', {})
                for row_str in pattern:
                    row = []
                    for char in row_str:
                        row.append(ingredients_map.get(char, None))
                    grid.append(row)

            # Create the final object for the app
            processed_recipes.append({
                "id": item_id,
                "name": name,
                "category": category,
                "result": item_id,
                "gridSize": len(grid) if grid else 3,
                "grid": grid,
                "ingredients": [
                    {"item": val, "count": 1} for val in ingredients_map.values()
                ] if 'ingredients' in recipe else []
            })

        return processed_recipes

    except Exception as e:
        print(f"Error fetching from API: {e}")
        return None

if __name__ == "__main__":
    recipes = fetch_recipes()
    if recipes:
        with open('data/recipes.json', 'w', encoding='utf-8') as f:
            json.dump(recipes, f, indent=2)
        print(f"Successfully wrote {len(recipes)} recipes to data/recipes.json")
    else:
        print("Failed to update recipes.")
