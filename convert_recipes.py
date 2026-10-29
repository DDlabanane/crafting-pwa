import os
import json

def convert_minecraft_recipes():
    input_folder = 'data/recipe'
    output_file = 'data/recipes.json'

    all_recipes = []

    if not os.path.exists(input_folder):
        print(f"Error: {input_folder} not found")
        return

    files = [f for f in os.listdir(input_folder) if f.endswith('.json')]
    print(f"Processing {len(files)} recipe files...")

    for filename in files:
        with open(os.path.join(input_folder, filename), 'r', encoding='utf-8') as f:
            try:
                data = json.load(f)

                # Extract basic info
                recipe_type = data.get('type', '')
                recipe_id = data['result']['id'].replace('minecraft:', '') if isinstance(data['result'], dict) else data['result'].replace('minecraft:', '')
                name = recipe_id.replace('_', ' ').title()
                category = data.get('category', 'General')
                if isinstance(category, str):
                    category = category.replace('minecraft:', '').title()
                elif isinstance(category, list):
                    category = category[0].replace('minecraft:', '').title()

                grid = []
                ingredients_count = {}
                recipe_category_type = 'other'

                if recipe_type == 'minecraft:crafting_shaped':
                    recipe_category_type = 'shaped'
                    pattern = data.get('pattern', [])
                    key = data.get('key', {})
                    for row_str in pattern:
                        row = []
                        for char in row_str:
                            item_id = key.get(char, None)
                            if item_id:
                                if isinstance(item_id, list): item_id = item_id[0] # Handle list of items
                                if item_id.startswith('#'): item_id = item_id.replace('#minecraft:', 'material')
                                else: item_id = item_id.replace('minecraft:', '')
                                row.append(item_id)
                                ingredients_count[item_id] = ingredients_count.get(item_id, 0) + 1
                            else:
                                row.append(None)
                        grid.append(row)

                elif recipe_type == 'minecraft:crafting_shapeless':
                    recipe_category_type = 'shapeless'
                    ingredients = data.get('ingredients', [])
                    # For shapeless, we just list them in the grid sequentially
                    # We'll use a 3x3 grid and fill from top-left
                    grid = [[None]*3 for _ in range(3)]
                    idx = 0
                    for ing in ingredients:
                        item_id = ing if isinstance(ing, str) else ing.get('item', 'unknown')
                        item_id = item_id.replace('minecraft:', '')
                        if item_id.startswith('#'): item_id = item_id.replace('#', 'material')

                        # Place in grid
                        row = idx // 3
                        col = idx % 3
                        if row < 3:
                            grid[row][col] = item_id

                        ingredients_count[item_id] = ingredients_count.get(item_id, 0) + 1
                        idx += 1

                else:
                    # Smelting, Blasting, etc.
                    recipe_category_type = 'other'
                    # Just a basic ingredient list for these
                    if 'ingredients' in data:
                        for ing in data['ingredients']:
                            item_id = ing if isinstance(ing, str) else ing.get('item', 'unknown')
                            item_id = item_id.replace('minecraft:', '')
                            ingredients_count[item_id] = ingredients_count.get(item_id, 0) + 1

                all_recipes.append({
                    "id": recipe_id,
                    "name": name,
                    "category": category,
                    "type": recipe_category_type,
                    "result": recipe_id,
                    "gridSize": 3,
                    "grid": grid,
                    "ingredients": [
                        {"item": k, "count": v} for k, v in ingredients_count.items()
                    ]
                })
            except Exception as e:
                print(f"Skipping {filename} due to error: {e}")

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_recipes, f, indent=2)

    print(f"Successfully converted {len(all_recipes)} recipes to {output_file}")

if __name__ == "__main__":
    convert_minecraft_recipes()
