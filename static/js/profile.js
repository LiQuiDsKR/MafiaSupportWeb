document.addEventListener('DOMContentLoaded', function() {
    const categories = ['Level', 'Fame', 'RP', 'Rate', 'Heart', 'Mentor', 'Guild', 'Frame', 'NameTag', 'Collection', 'ProfileBackground'];
    const profileContainer = document.querySelector('.profile-container');
    const previewContainer = document.createElement('div');
    previewContainer.className = 'preview-container';
    profileContainer.appendChild(previewContainer);

    const categoryContainer = document.createElement('div');
    categoryContainer.className = 'category-container';
    profileContainer.appendChild(categoryContainer);

    const itemContainer = document.createElement('div');
    itemContainer.className = 'item-container';
    profileContainer.appendChild(itemContainer);

    categories.forEach(category => {
        const button = document.createElement('button');
        button.textContent = category;
        button.className = 'category-button';
        button.addEventListener('click', () => loadItems(category));
        categoryContainer.appendChild(button);

        // 디폴트로 첫 번째 아이템 로드
        loadItems(category, true);
    });

    function loadItems(category, isDefault = false) {
        itemContainer.innerHTML = '';
        fetch(`/get_items/profile/${category}`)
            .then(response => response.json())
            .then(items => {
                items.forEach((item, index) => {
                    const img = document.createElement('img');
                    img.src = `/static/images/ProfileCustomizer/${category}/${item}`;
                    img.className = 'item-image';
                    img.addEventListener('click', () => applyItem(category, item));
                    itemContainer.appendChild(img);

                    // 디폴트로 첫 번째 아이템 적용
                    if (isDefault && index === 0) {
                        applyItem(category, item);
                    }
                });
            });
    }

    function applyItem(category, item) {
        const img = document.createElement('img');
        img.src = `/static/images/ProfileCustomizer/${category}/${item}`;
        img.className = `preview-image ${category.toLowerCase()}`;
        
        const existingItem = previewContainer.querySelector(`.${category.toLowerCase()}`);
        if (existingItem) {
            previewContainer.removeChild(existingItem);
        }
        
        previewContainer.appendChild(img);
    }
});
