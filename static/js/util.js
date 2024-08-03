function createCardElement(card, index) {
  const cardElement = document.createElement('div');
  cardElement.classList.add('card');
  cardElement.dataset.index = index;

  const framePath = `${imagePaths.cardFrame}/frame${card.tier}.png`;
  const jobIllustrationPath = `${imagePaths.jobIllust}/${card.role}.png`;
  const jobThumbnailPath = `${imagePaths.jobThumbnail}/${card.role}.png`;

  cardElement.style.backgroundImage = `url(${framePath})`;

  // 각 티어에 맞는 능력 이미지 경로 설정
  const abilitiesImages = [];
  card.abilities.forEach((ability, idx) => {
    let tierFolder;
    if (idx + 1 === 1) {
      tierFolder = 'tier1';
    } else if (idx + 1 === 2) {
      tierFolder = 'tier2';
    } else if (idx + 1 === 3) {
      tierFolder = 'tier3';
    } else {
      tierFolder = 'tier456';
    }
    abilitiesImages.push(`${imagePaths.tierImage}/${tierFolder}/${ability}.png`);
  });

  // 각 능력 이미지 태그 생성
  const abilitiesImagesTags = abilitiesImages.map(imagePath => `<img src="${imagePath}" alt="${imagePath}" class="ability-image">`).join('');

  cardElement.innerHTML = `
    <img src="${jobIllustrationPath}" alt="${card.role}" class="job-illustration">
    <div class="card-overlay">
      <img src="${jobThumbnailPath}" alt="${card.role}" class="job-thumbnail">
      <div class="abilities-container">
        ${abilitiesImagesTags}
      </div>
      <p>경험치: ${card.exp}/${card.maxExp}</p>
    </div>
  `;
  return cardElement;
}

function updateCardDisplay(cards, cardContainer, upgradeCardSelect) {
  cardContainer.innerHTML = '';
  upgradeCardSelect.innerHTML = '';
  cards.forEach((card, index) => {
    cardContainer.appendChild(createCardElement(card, index));
    const option = document.createElement('option');
    option.value = index;
    option.text = `${card.role} (티어 ${card.tier})`;
    upgradeCardSelect.appendChild(option);
  });
}

class Card {
  constructor(role, tier, abilities, exp, maxExp) {
    this.role = role;
    this.tier = tier;
    this.abilities = abilities;
    this.exp = exp;
    this.maxExp = maxExp;
  }

  gainExp(amount) {
    this.exp += amount;
    if (this.exp > this.maxExp) {
      this.exp = this.maxExp;
    }
  }

  upgrade(additionalAbility) {
    if (this.exp === this.maxExp) {
      this.tier += 1;
      this.exp = 0;
      const maxExpValues = {1: 1000, 2: 2000, 3: 4000, 4: 8000, 5: 16000, 6: 32000};
      this.maxExp = maxExpValues[this.tier];
      this.abilities.push(additionalAbility);
    }
  }
}

function getRandomTier(type) {
  const rand = Math.random();
  if (type === 'low') {
    if (rand < 0.891) return 1;
    if (rand < 0.99) return 2;
    return 3;
  } else if (type === 'high') {
    if (rand < 0.891) return 3;
    if (rand < 0.99) return 4;
    return 5;
  }
}

function sortCards(cards) {
  const jobOrder = ["마피아", "스파이", "짐승인간", "마담", "도둑", "마녀", "과학자", "사기꾼", "청부업자", "경찰", "자경단원", "의사", "군인", "정치인", "영매", "연인", "기자", "건달", "사립탐정", "도굴꾼", "테러리스트", "성직자", "예언자", "간호사", "판사", "마술사", "해커", "심리학자", "용병", "공무원", "비밀결사", "파파라치", "교주"];

  return cards.sort((a, b) => {
    if (a.tier !== b.tier) {
      return b.tier - a.tier;
    }
    if (jobOrder.indexOf(a.role) !== jobOrder.indexOf(b.role)) {
      return jobOrder.indexOf(a.role) - jobOrder.indexOf(b.role);
    }
    return b.exp - a.exp;
  });
}

function updateCardGrid() {
  const cardsPerRow = document.getElementById('cards-per-row').value;
  const cardGrid = document.querySelector('.card-grid');
  cardGrid.style.gridTemplateColumns = `repeat(${cardsPerRow}, 1fr)`;
}
