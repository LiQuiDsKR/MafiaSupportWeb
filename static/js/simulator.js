document.addEventListener('DOMContentLoaded', () => {
  if (typeof Card === 'undefined') {
    console.error('Card class is not defined');
    return;
  }

  const cardContainer = document.getElementById('card-container');
  const selectedExpDisplay = document.getElementById('selected-exp-display');
  const cardsPerRowSelect = document.getElementById('cards-per-row');
  const cards = loadCardsFromLocalStorage();
  let isUpgrading = false;
  let mainCard = null;
  const subCards = [];

  // 초기화 버튼 이벤트 핸들러
  document.getElementById('confirm-reset').addEventListener('click', () => {
    const confirmationInput = document.getElementById('reset-confirmation').value;
    if (confirmationInput === '초기화') {
      resetCards();
      $('#resetModal').modal('hide');
    } else {
      alert('초기화를 입력하지 않았습니다.');
    }
  });

  cardsPerRowSelect.addEventListener('change', () => {
    updateCardGrid();
    saveCardsToLocalStorage(cards);
  });

  function updateCardGrid() {
    const cardsPerRow = parseInt(cardsPerRowSelect.value, 10) + 1; // idk why +1 is needed
    cardContainer.style.gridTemplateColumns = `repeat(auto-fit, minmax(${100 / cardsPerRow}%, 1fr))`;
  }

  function createCard(tier, role) {
    let abilities = getAbilities(tier, role);
    const maxExpValues = {1: 1000, 2: 2000, 3: 4000, 4: 8000, 5: 16000, 6: 32000};
    const maxExp = maxExpValues[tier];
    const exp = tier === 6 ? 32000 : 0;
    return new Card(role, tier, abilities, exp, maxExp);
  }

  function handleCardClick(event) {
    const cardElement = event.currentTarget;
    const cardIndex = cardElement.dataset.index;
    const card = cards[cardIndex];
  
    if (isUpgrading) {
      if (!mainCard) {
        if (card.tier === 6) {
          alert('6티어 카드는 강화할 수 없습니다.');
          return;
        }
        mainCard = card;
        cardElement.classList.add('main-card');
      } else {
        if (mainCard === card) {
          return; // 주 강화 카드를 다시 선택할 수 없음
        }
  
        if (subCards.includes(card)) {
          // 이미 선택된 부강화 카드를 다시 선택하면 선택 취소
          subCards.splice(subCards.indexOf(card), 1);
          cardElement.classList.remove('sub-card');
        } else {
          if (mainCard.exp === mainCard.maxExp) {
            handleMaxExpCard(card, cardElement);
          } else {
            handleExpGainCard(card, cardElement);
          }
        }
      }
    }
    updateCardOverlay();
  }

  function handleExpGainCard(card, cardElement) {
    const currentExp = mainCard.exp;
    const accumulatedExp = subCards.reduce((sum, c) => sum + getExpValue(c.tier), 0);
  
    if (currentExp + accumulatedExp < mainCard.maxExp) {
      subCards.push(card);
      cardElement.classList.add('sub-card');
    } else {
      alert('최대 경험치를 초과할 수 없습니다.');
    }
    updateCardOverlay();
  }

  function handleMaxExpCard(card, cardElement) {
    if (mainCard.role === card.role && mainCard.tier === card.tier) {
      subCards.push(card);
      cardElement.classList.add('sub-card');
    } else {
      alert('같은 티어와 같은 직업의 카드만 선택할 수 있습니다.');
    }
    updateCardOverlay();
  }

  function getExpValue(tier) {
    const expValues = {1: 250, 2: 500, 3: 1000, 4: 2000, 5: 4000, 6: 8000};
    return expValues[tier];
  }

  function updateCardOverlay() {
    document.querySelectorAll('.card').forEach(card => {
      const overlay = card.querySelector('.card-selected-overlay');
      if (overlay) {
        overlay.remove();
      }
    });
  
    if (mainCard) {
      const mainCardElement = cardContainer.querySelector(`[data-index="${cards.indexOf(mainCard)}"]`);
      const mainOverlay = document.createElement('div');
      mainOverlay.classList.add('card-selected-overlay');
      mainCardElement.appendChild(mainOverlay);
    }
  
    subCards.forEach(subCard => {
      const subCardElement = cardContainer.querySelector(`[data-index="${cards.indexOf(subCard)}"]`);
      const subOverlay = document.createElement('div');
      subOverlay.classList.add('card-selected-overlay');
      subCardElement.appendChild(subOverlay);
    });
  }

  function updateCardDisplay(cards, cardContainer) {
    cardContainer.innerHTML = '';
    sortCards(cards).forEach((card, index) => {
      const cardElement = createCardElement(card, index);
      cardElement.addEventListener('click', handleCardClick);
      cardContainer.appendChild(cardElement);
    });
    updateCardGrid(); // 카드 표시 업데이트 시 그리드 갱신
    saveCardsToLocalStorage(cards);
  }

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

  // 경험치 바 계산
  const expPercentage = (card.exp / card.maxExp) * 100;
  const expBarColor = card.exp === card.maxExp ? 'full' : '';

  cardElement.innerHTML = `
    <img src="${jobIllustrationPath}" alt="${card.role}" class="job-illustration">
    <div class="card-overlay">
      <img src="${jobThumbnailPath}" alt="${card.role}" class="job-thumbnail">
      <div class="abilities-container">
        ${abilitiesImagesTags}
      </div>
      <p>경험치: ${card.exp}/${card.maxExp}</p>
    </div>
    <div class="exp-bar">
      <div class="exp-bar-inner ${expBarColor}" style="width: ${expPercentage}%"></div>
    </div>
  `;
  return cardElement;
}


  function applyExpGain() {
    let expGained = 0;
    subCards.forEach(card => {
      expGained += getExpValue(card.tier);
      const index = cards.indexOf(card);
      if (index > -1) {
        cards.splice(index, 1);
      }
    });
    mainCard.gainExp(expGained);
  }

  function applyMaxExpUpgrade() {
    if (subCards.length === mainCard.tier) {
      let additionalAbility;
  
      // 중복 능력이 없을 때까지 반복
      do {
        additionalAbility = getRandomItem(tier4_6Abilities[mainCard.role]);
      } while (mainCard.abilities.includes(additionalAbility));
  
      // 중복되지 않는 능력을 추가
      mainCard.upgrade(additionalAbility);
      subCards.forEach(card => {
        const index = cards.indexOf(card);
        if (index > -1) {
          cards.splice(index, 1);
        }
      });
    } else {
      alert(`재료 카드의 개수가 올바르지 않습니다. 티어 ${mainCard.tier} 카드는 ${mainCard.tier}개의 부 강화 카드가 필요합니다.`);
      return;
    }
  }
  

  document.getElementById('buy-low-card').addEventListener('click', () => {
    const tier = getRandomTier('low');
    const role = tier === 1 ? getRandomItem(["시민", "악인"]) : getRandomJob();
    const card = createCard(tier, role);
    cards.push(card);
    updateCardDisplay(cards, cardContainer);
  });

  document.getElementById('buy-low-pack').addEventListener('click', () => {
    for (let i = 0; i < 10; i++) {
      document.getElementById('buy-low-card').click();
    }
  });

  document.getElementById('buy-high-card').addEventListener('click', () => {
    const tier = getRandomTier('high');
    const role = getRandomJob();
    const card = createCard(tier, role);
    cards.push(card);
    updateCardDisplay(cards, cardContainer);
  });

  document.getElementById('buy-high-pack').addEventListener('click', () => {
    const pack = [];
    for (let i = 0; i < 10; i++) {
      const tier = getRandomTier('high');
      const role = getRandomJob();
      const card = createCard(tier, role);
      pack.push(card);
    }
    if (!pack.some(card => card.tier >= 4)) {
      const role = getRandomJob();
      const abilities = getAbilities(4, role);
      pack[9] = new Card(role, 4, abilities, 0, 8000);
    }
    cards.push(...pack);
    updateCardDisplay(cards, cardContainer);
  });

  document.getElementById('upgrade-card').addEventListener('click', () => {
    isUpgrading = true;
    mainCard = null;
    subCards.length = 0;
    document.querySelectorAll('.card').forEach(card => {
      card.classList.remove('main-card');
      card.classList.remove('sub-card');
      card.style.borderColor = '';
    });
    
  });

  document.getElementById('apply-upgrade').addEventListener('click', () => {
    if (mainCard) {
      if (mainCard.exp < mainCard.maxExp) {
        applyExpGain();
      } else {
        applyMaxExpUpgrade();
      }
      updateCardDisplay(cards, cardContainer);
    }
    isUpgrading = false;
    mainCard = null;
    subCards.length = 0;
    document.querySelectorAll('.card').forEach(card => {
      card.classList.remove('main-card');
      card.classList.remove('sub-card');
    });
    updateCardOverlay();
  });

  function saveCardsToLocalStorage(cards) {
    const cardsData = cards.map(card => ({
      role: card.role,
      tier: card.tier,
      abilities: card.abilities,
      exp: card.exp,
      maxExp: card.maxExp
    }));
    localStorage.setItem('cards', JSON.stringify(cardsData));
  }

  function loadCardsFromLocalStorage() {
    const cardsData = JSON.parse(localStorage.getItem('cards')) || [];
    return cardsData.map(data => new Card(data.role, data.tier, data.abilities, data.exp, data.maxExp));
  }

  function resetCards() {
    localStorage.removeItem('cards');
    cards.length = 0;
    updateCardDisplay(cards, cardContainer);
  }

  // 초기 카드 표시 업데이트
  updateCardDisplay(cards, cardContainer);
  
  updateCardGrid(); // 초기 카드 그리드 설정
});

function sortCards(cards) {
  const jobOrder = ["마피아", "스파이", "짐승인간", "마담", "도둑", "마녀", "과학자", "사기꾼", "청부업자", "경찰", "자경단원", "요원", "의사", "군인", "정치인", "영매", "연인", "기자", "건달", "사립탐정", "도굴꾼", "테러리스트", "성직자", "예언자", "간호사", "판사", "마술사", "해커", "심리학자", "용병", "공무원", "비밀결사", "파파라치", "교주"];

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

function getRandomJob() {
  const totalSlots = 12;
  const jobSlots = {
    mafia: 3,
    support: 1,
    police: 1,
    doctor: 1,
    special: 5,
    cult: 1
  };

  const jobs = {
    mafia: ["마피아"],
    support: ["스파이", "짐승인간", "도둑", "마담", "마녀", "과학자", "사기꾼", "청부업자"],
    police: ["경찰", "자경단원", "요원"],
    doctor: ["의사"],
    special: ["군인", "정치인", "영매", "연인", "기자", "건달", "사립탐정", "도굴꾼", "테러리스트", "성직자", "예언자", "간호사", "판사", "마술사", "해커", "심리학자", "용병", "공무원", "비밀결사", "파파라치"],
    cult: ["교주"]
  };

  const jobProbabilities = {
    mafia: jobSlots.mafia / totalSlots,
    support: jobSlots.support / totalSlots / jobs.support.length,
    police: jobSlots.police / totalSlots / jobs.police.length,
    doctor: jobSlots.doctor / totalSlots,
    special: jobSlots.special / totalSlots / jobs.special.length,
    cult: jobSlots.cult / totalSlots
  };

  const rand = Math.random();
  let cumulativeProbability = 0;

  cumulativeProbability += jobProbabilities.mafia;
  if (rand < cumulativeProbability) {
    return "마피아";
  }

  cumulativeProbability += jobProbabilities.support * jobs.support.length;
  if (rand < cumulativeProbability) {
    return getRandomItem(jobs.support);
  }

  cumulativeProbability += jobProbabilities.police * jobs.police.length;
  if (rand < cumulativeProbability) {
    return getRandomItem(jobs.police);
  }

  cumulativeProbability += jobProbabilities.doctor;
  if (rand < cumulativeProbability) {
    return "의사";
  }

  cumulativeProbability += jobProbabilities.special * jobs.special.length;
  if (rand < cumulativeProbability) {
    return getRandomItem(jobs.special);
  }

  return "교주";
}

function getRandomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function getRandomTier(type) {
  const rand = Math.random();
  if (type === 'low') {
    if (rand < 0.891) return 1;
    if (rand < 0.99) return 2;
    return 3;
  } else if (type === 'high') {
    //if (rand < 0.891) return 3;
    //if (rand < 0.99) return 4;
    return 5;
  }
}
