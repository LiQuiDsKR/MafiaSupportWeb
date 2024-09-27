document.addEventListener('DOMContentLoaded', function() {
    const categories = ['Level', 'Fame', 'RP', 'Rate', 'Heart', 'Mentor', 'Guild', 'Frame', 'NameTag', 'Collection', 'ProfileBackground', 'Skin', 'Jewel'];
    const profileContainer = document.querySelector('.profile-container');
    const previewContainer = document.querySelector('.preview-container');

    const unrankedCheck = document.getElementById('unrankedCheck');
    const rpText = document.getElementById('rpText');
    const rankText = document.getElementById('rankText');

    unrankedCheck.addEventListener('change', updatePreview);

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

    // 사용자 이름 색상 변경
    const usernameColorPicker = document.getElementById('username-color');
    usernameColorPicker.addEventListener('input', function() {
        const usernameElement = previewContainer.querySelector('.username');
        if (usernameElement) {
            usernameElement.style.color = this.value;
        }
    });

    // HeartBackground 요소 추가
    const heartBackground = document.createElement('div');
    heartBackground.className = 'preview-image heartbackground';
    previewContainer.appendChild(heartBackground);

    // 하트 배경 색상 변경
    const heartColorPicker = document.getElementById('heart-color');
    heartColorPicker.addEventListener('input', function() {
        heartBackground.style.backgroundColor = this.value;
    });

    // 사용자 정보 요소들 생성
    function createPreviewText(className, initialText = '') {
        const element = document.createElement('div');
        element.className = `preview-text ${className}`;
        element.textContent = initialText;
        previewContainer.appendChild(element);
        return element;
    }

    const usernameElement = createPreviewText('usernameText');
    const levelElement = createPreviewText('levelText');
    const fameElement = createPreviewText('fameText');
    const winLossElement = createPreviewText('winlossText');
    const rpElement = createPreviewText('rpText');
    const guildElement = createPreviewText('guildText');
    const bioElement = createPreviewText('bioText');

    // 입력 필드 이벤트 리스너
    document.getElementById('usernameText').addEventListener('input', updatePreview);
    document.getElementById('username-color').addEventListener('input', updatePreview);
    document.getElementById('levelText').addEventListener('input', updatePreview);
    document.getElementById('fameText').addEventListener('input', updatePreview);
    document.getElementById('winsText').addEventListener('input', updatePreview);
    document.getElementById('lossesText').addEventListener('input', updatePreview);
    document.getElementById('rpText').addEventListener('input', updatePreview);
    document.getElementById('rankText').addEventListener('input', updatePreview);
    document.getElementById('guildText').addEventListener('input', updatePreview);
    document.getElementById('bioText').addEventListener('input', updatePreview);

    function updatePreview() {
        usernameElement.textContent = document.getElementById('usernameText').value;
        usernameElement.style.color = document.getElementById('username-color').value;
        levelElement.textContent = `${document.getElementById('levelText').value}`;
        fameElement.textContent = `명성 : ${document.getElementById('fameText').value}`;
        
        const wins = document.getElementById('winsText').value;
        const losses = document.getElementById('lossesText').value;
        winLossElement.textContent = `${wins}승 ${losses}패`;
        
        if (unrankedCheck.checked) {
            rpElement.textContent = 'UNRANKED';
            rpText.disabled = true;
            rankText.disabled = true;
        } else {
            const rp = document.getElementById('rpText').value;
            const rank = document.getElementById('rankText').value;
            rpElement.textContent = `${rp}RP (${rank}위)`;
            rpText.disabled = false;
            rankText.disabled = false;
        }
        
        guildElement.textContent = document.getElementById('guildText').value;
        bioElement.textContent = document.getElementById('bioText').value;
    }

    // 초기 업데이트
    updatePreview();
});
