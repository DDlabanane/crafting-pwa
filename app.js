async function initApp() {
    let recipes = [];
    let currentCategory = 'All';
    let searchQuery = '';

    const recipeList = document.getElementById('recipe-list');
    const searchInput = document.getElementById('search-input');
    const categoryNav = document.getElementById('category-nav');
    const detailView = document.getElementById('recipe-detail');
    const backBtn = document.getElementById('back-btn');

    try {
        const response = await fetch('data/recipes.json');
        recipes = await response.json();
    } catch (e) {
        console.error('Failed to load recipes', e);
        return;
    }

    const categories = ['All', ...new Set(recipes.map(r => r.category))];
    categories.forEach(cat => {
        if (cat === 'All') return;
        const btn = document.createElement('button');
        btn.className = 'cat-btn';
        btn.textContent = cat;
        btn.dataset.category = cat;
        categoryNav.appendChild(btn);
    });

    function createItemHtml(itemId) {
        if (!itemId) return '';
        // Using the community-maintained Minecraft Item Assets CDN
        // This provides the isometric inventory icons
        const iconUrl = `https://minecraft-items.com/icons/${itemId}.png`;

        return `
            <img src="${iconUrl}"
                 onerror="this.onerror=null; this.style.display='none'; this.nextSibling.style.display='block';"
                 alt="${itemId}">
            <span style="display:none">${itemId}</span>
        `;
    }

    function renderList() {
        recipeList.innerHTML = '';
        const filtered = recipes.filter(r => {
            const matchesCat = currentCategory === 'All' || r.category === currentCategory;
            const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCat && matchesSearch;
        });

        filtered.forEach(recipe => {
            const card = document.createElement('div');
            card.className = 'recipe-card';

            const itemHtml = createItemHtml(recipe.result);

            card.innerHTML = `
                <div class="slot" style="margin: 0 auto 10px auto">${itemHtml}</div>
                <span>${recipe.name}</span>
            `;
            card.onclick = () => showDetail(recipe);
            recipeList.appendChild(card);
        });
    }

    function showDetail(recipe) {
        document.getElementById('detail-name').textContent = recipe.name;
        const gridEl = document.getElementById('crafting-grid');
        const resEl = document.getElementById('result-item');
        const ingEl = document.getElementById('ingredients-list');

        if (recipe.type === 'shaped' || recipe.type === 'shapeless') {
            gridEl.classList.remove('hidden');
            gridEl.style.gridTemplateColumns = `repeat(${recipe.gridSize || 3}, 50px)`;
            gridEl.innerHTML = '';

            recipe.grid.flat().forEach(item => {
                const slot = document.createElement('div');
                slot.className = 'slot';
                slot.innerHTML = item ? createItemHtml(item) : '';
                gridEl.appendChild(slot);
            });
        } else {
            gridEl.classList.add('hidden');
        }

        resEl.innerHTML = createItemHtml(recipe.result);

        ingEl.innerHTML = '';
        recipe.ingredients.forEach(ing => {
            const li = document.createElement('li');
            li.innerHTML = `${createItemHtml(ing.item)} ${ing.count}x ${ing.item}`;
            ingEl.appendChild(li);
        });

        detailView.classList.remove('hidden');
    }

    searchInput.oninput = (e) => {
        searchQuery = e.target.value;
        renderList();
    };

    categoryNav.onclick = (e) => {
        if (e.target.classList.contains('cat-btn')) {
            document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.dataset.category;
            renderList();
        }
    };

    backBtn.onclick = () => {
        detailView.classList.add('hidden');
    };

    renderList();
}

initApp();
