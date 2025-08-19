// DOM Elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const dietFilter = document.getElementById('diet-filter');
const mealType = document.getElementById('meal-type');
const resultsContainer = document.getElementById('results');
const loadingElement = document.getElementById('loading');
const noResultsElement = document.getElementById('no-results');
const modal = document.getElementById('recipe-modal');
const closeBtn = document.querySelector('.close-btn');
const recipeDetails = document.getElementById('recipe-details');

// API Configuration
const API_KEY = 'YOUR_SPOONACULAR_API_KEY'; // Replace with your API key
const BASE_URL = 'https://api.spoonacular.com/recipes';

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Load saved recipes from localStorage if available
    const savedRecipes = JSON.parse(localStorage.getItem('savedRecipes')) || [];
    
    // Set up event listeners
    searchBtn.addEventListener('click', searchRecipes);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchRecipes();
    });
    
    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto'; // Re-enable scrolling
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    });
});

// Search for recipes
async function searchRecipes() {
    const ingredients = searchInput.value.trim();
    if (!ingredients) {
        alert('Please enter at least one ingredient');
        return;
    }
    
    // Show loading state
    loadingElement.classList.remove('hidden');
    resultsContainer.innerHTML = '';
    noResultsElement.classList.add('hidden');
    
    try {
        // Build the API URL with query parameters
        const params = new URLSearchParams({
            apiKey: API_KEY,
            includeIngredients: ingredients,
            number: 12,
            addRecipeInformation: true,
            fillIngredients: true,
            diet: dietFilter.value,
            type: mealType.value
        });
        
        const response = await fetch(`${BASE_URL}/findByIngredients?${params}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch recipes');
        }
        
        const recipes = await response.json();
        
        // Hide loading state
        loadingElement.classList.add('hidden');
        
        if (recipes.length === 0) {
            noResultsElement.classList.remove('hidden');
            return;
        }
        
        // Display recipes
        displayRecipes(recipes);
        
    } catch (error) {
        console.error('Error fetching recipes:', error);
        loadingElement.classList.add('hidden');
        alert('Failed to fetch recipes. Please try again later.');
    }
}

// Display recipes in the UI
function displayRecipes(recipes) {
    resultsContainer.innerHTML = '';
    
    recipes.forEach(recipe => {
        const recipeCard = document.createElement('div');
        recipeCard.className = 'recipe-card';
        
        // Create image URL or use placeholder
        const imageUrl = recipe.image || 'https://via.placeholder.com/300x200?text=No+Image';
        
        // Format missing ingredients
        const missingIngredients = recipe.missedIngredients
            .slice(0, 3) // Show only first 3 missing ingredients
            .map(ing => ing.name)
            .join(', ');
        
        recipeCard.innerHTML = `
            <img src="${imageUrl}" alt="${recipe.title}" class="recipe-img">
            <div class="recipe-info">
                <h3 class="recipe-title">${recipe.title}</h3>
                <div class="recipe-meta">
                    <span><i class="fas fa-utensils"></i> ${recipe.servings || 'N/A'} servings</span>
                    <span><i class="far fa-clock"></i> ${recipe.readyInMinutes || 'N/A'} min</span>
                </div>
                ${missingIngredients ? `<p class="missing-ingredients"><strong>Missing:</strong> ${missingIngredients}${recipe.missedIngredients.length > 3 ? '...' : ''}</p>` : ''}
                <button class="view-recipe" data-id="${recipe.id}">View Recipe</button>
            </div>
        `;
        
        resultsContainer.appendChild(recipeCard);
    });
    
    // Add event listeners to view recipe buttons
    document.querySelectorAll('.view-recipe').forEach(button => {
        button.addEventListener('click', () => {
            const recipeId = button.getAttribute('data-id');
            getRecipeDetails(recipeId);
        });
    });
}

// Get detailed recipe information
async function getRecipeDetails(recipeId) {
    try {
        loadingElement.classList.remove('hidden');
        
        const response = await fetch(`${BASE_URL}/${recipeId}/information?apiKey=${API_KEY}&includeNutrition=false`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch recipe details');
        }
        
        const recipe = await response.json();
        loadingElement.classList.add('hidden');
        displayRecipeDetails(recipe);
        
    } catch (error) {
        console.error('Error fetching recipe details:', error);
        loadingElement.classList.add('hidden');
        alert('Failed to load recipe details. Please try again.');
    }
}

// Display detailed recipe in modal
function displayRecipeDetails(recipe) {
    // Format ingredients
    const ingredientsList = recipe.extendedIngredients
        .map(ingredient => `<li>${ingredient.original}</li>`)
        .join('');
    
    // Format instructions (handle both string and array formats)
    let instructions = '<p>No instructions available.</p>';
    if (recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0) {
        instructions = recipe.analyzedInstructions[0].steps
            .map(step => `<li>${step.step}</li>`)
            .join('');
        instructions = `<ol>${instructions}</ol>`;
    } else if (recipe.instructions) {
        instructions = `<div>${recipe.instructions}</div>`;
    }
    
    // Create recipe details HTML
    recipeDetails.innerHTML = `
        <div class="recipe-header">
            <h2>${recipe.title}</h2>
            <img src="${recipe.image || 'https://via.placeholder.com/800x400?text=No+Image'}" alt="${recipe.title}">
            <div class="recipe-meta">
                <span><i class="fas fa-utensils"></i> ${recipe.servings || 'N/A'} servings</span>
                <span><i class="far fa-clock"></i> ${recipe.readyInMinutes || 'N/A'} min</span>
                <span><i class="fas fa-fire"></i> ${recipe.healthScore || 'N/A'} health score</span>
            </div>
            <p>${recipe.summary ? recipe.summary.replace(/<[^>]*>?/gm, '') : 'No summary available.'}</p>
        </div>
        
        <div class="recipe-details">
            <div class="ingredients">
                <h3><i class="fas fa-shopping-basket"></i> Ingredients</h3>
                <ul>${ingredientsList}</ul>
            </div>
            
            <div class="instructions">
                <h3><i class="fas fa-list-ol"></i> Instructions</h3>
                ${instructions}
            </div>
        </div>
        
        <div class="recipe-actions">
            <a href="${recipe.sourceUrl || '#'}" target="_blank" class="btn">
                <i class="fas fa-external-link-alt"></i> View Original Recipe
            </a>
        </div>
    `;
    
    // Show modal
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

// Sample data for testing (remove in production)
function loadSampleData() {
    const sampleRecipes = [
        {
            id: 1,
            title: 'Pasta Carbonara',
            image: 'https://spoonacular.com/recipeImages/716429-556x370.jpg',
            missedIngredients: [
                { name: 'pancetta' },
                { name: 'pecorino cheese' },
                { name: 'eggs' }
            ],
            servings: 4,
            readyInMinutes: 30
        },
        {
            id: 2,
            title: 'Vegetable Stir Fry',
            image: 'https://spoonacular.com/recipeImages/716426-556x370.jpg',
            missedIngredients: [
                { name: 'broccoli' },
                { name: 'carrots' },
                { name: 'soy sauce' }
            ],
            servings: 2,
            readyInMinutes: 20
        }
    ];
    
    displayRecipes(sampleRecipes);
}

// Uncomment for testing without API
// loadSampleData();
