/* 'async' means this function can wait for things to happen (like loading a file)
   without freezing the rest of the browser */
async function initApp() {
    // These variables store the state of the app
    let recipes = [];          // All the recipes loaded from the JSON file
    let currentCategory = 'All'; // Which category is currently selected
    let searchQuery = '';      // What the user has typed in the search box

    // We "grab" the HTML elements we need to change them later
    const recipeList = document.getElementById('recipe-list');
    const searchInput = document.getElementById('search-input');
    const categoryNav = document.getElementById('category-nav');
    const detailView = document.getElementById('recipe-detail');
    const backBtn = document.getElementById('back-btn');

    try {
        /* 'fetch' goes to the server and asks for the file.
           'await' tells JS: "Wait until the file arrives before moving to the next line" */
        const response = await fetch('data/recipes.json');
        recipes = await response.json(); // Converts the raw text file into a JavaScript Array/Object
    } catch (e) {
        console.error('Failed to load recipes', e);
        return;
    }

    /* To create the category buttons, we first find all unique categories
       in our data using a 'Set' (a Set only allows unique values) */
    const categories = ['All', ...new Set(recipes.map(r => r.category))];
    categories.forEach(cat => {
        if (cat === 'All') return; // 'All' is already in the HTML

        // Create a new <button> element in memory
        const btn = document.createElement('button');
        btn.className = 'cat-btn';
        btn.textContent = cat;
        btn.dataset.category = cat; // Stores the category name inside the button itself

        // Add the button to the HTML navigation bar
        categoryNav.appendChild(btn);
    });

    /* This is the heart of the app. It clears the screen and
       re-draws the recipes based on the current search and category */
    function renderList() {
        recipeList.innerHTML = ''; // Clear the current list

        const filtered = recipes.filter(r => {
            // Check if it matches the category
            const matchesCat = currentCategory === 'All' || r.category === currentCategory;
            // Check if the name contains the search letters (both converted to lowercase)
            const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCat && matchesSearch;
        });

        filtered.forEach(recipe => {
            const card = document.createElement('div');
            card.className = 'recipe-card';
            card.innerHTML = `
                <div class="slot" style="margin: 0 auto 10px auto">${recipe.result}</div>
                <span>${recipe.name}</span>
            `;
            // When the card is clicked, call the showDetail function
            card.onclick = () => showDetail(recipe);
            recipeList.appendChild(card);
        });
    }

    function showDetail(recipe) {
        document.getElementById('detail-name').textContent = recipe.name;
        const gridEl = document.getElementById('crafting-grid');
        const resEl = document.getElementById('result-item');
        const ingEl = document.getElementById('ingredients-list');

        // Adjust the grid (2x2 or 3x3) based on the recipe data
        gridEl.style.gridTemplateColumns = `repeat(${recipe.gridSize}, 50px)`;
        gridEl.innerHTML = '';

        /* '.flat()' turns a 2D array [[1,2],[3,4]] into a 1D array [1,2,3,4]
           so we can loop through all cells easily */
        recipe.grid.flat().forEach(item => {
            const slot = document.createElement('div');
            slot.className = 'slot';
            slot.textContent = item || ''; // Show the item name, or empty if null
            gridEl.appendChild(slot);
        });

        resEl.textContent = recipe.result;

        ingEl.innerHTML = '';
        recipe.ingredients.forEach(ing => {
            const li = document.createElement('li');
            li.textContent = `${ing.count}x ${ing.item}`;
            ingEl.appendChild(li);
        });

        // Remove the 'hidden' class to make the detail screen visible
        detailView.classList.remove('hidden');
    }

    // --- Event Listeners (Watching for user action) ---

    searchInput.oninput = (e) => {
        searchQuery = e.target.value; // Update the search variable
        renderList(); // Refresh the list
    };

    categoryNav.onclick = (e) => {
        // Only trigger if a button was clicked, not the space between buttons
        if (e.target.classList.contains('cat-btn')) {
            document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.dataset.category;
            renderList();
        }
    };

    backBtn.onclick = () => {
        detailView.classList.add('hidden'); // Hide the detail screen
    };

    renderList(); // Initial draw of the list when app starts
}

initApp();
