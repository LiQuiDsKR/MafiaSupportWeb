document.addEventListener("DOMContentLoaded", function () {
  const boxTypeSelect = document.getElementById("box-type");
  const itemsList = document.getElementById("items-list");
  const remainingEquipSumElement = document.getElementById("remaining-equip-sum");
  
  // 부스트 아이템 선택 요소
  const boostItemSelects = [
    document.getElementById('boost-item-1'),
    document.getElementById('boost-item-2'),
    document.getElementById('boost-item-3'),
    document.getElementById('boost-item-4')
  ];

  function fetchItems(boxType) {
    fetch(`/get_items/${boxType}`)
      .then(response => response.json())
      .then(data => {
        updateItemsList(boxType, data);
      });
  }

  function updateItemsList(boxType, items) {
    itemsList.innerHTML = '';
    const savedState = JSON.parse(localStorage.getItem(`randbox_${boxType}`)) || {};

    items.forEach(item => {
      const rowElement = document.createElement('div');
      rowElement.classList.add('row');

      const checkBoxCell = document.createElement('div');
      checkBoxCell.classList.add('cell');
      if (item.equip) {
        const checkBox = document.createElement('input');
        checkBox.type = 'checkbox';
        checkBox.classList.add('item-checkbox');
        checkBox.dataset.name = item.name;
        checkBox.dataset.chance = item.chance;
        checkBox.dataset.equip = item.equip;
        checkBox.dataset.originalChance = item.chance; // 원래 확률 저장
        checkBox.checked = savedState[item.name] || false; // 저장된 상태 반영
        checkBox.addEventListener('change', () => {
          saveState(boxType);
          updateChances();
        });
        checkBoxCell.appendChild(checkBox);
      }
      rowElement.appendChild(checkBoxCell);

      const imageCell = document.createElement('div');
      imageCell.classList.add('cell'); // cell 클래스를 추가하여 동일한 레이아웃 적용
      const imagePath = `/static/images/EquipImage/${item.name}.webp`; // 이미지 경로
      const imageElement = document.createElement('img');
      imageElement.src = imagePath;
      imageElement.alt = item.name;
      imageElement.classList.add('item-image'); // CSS에서 이미지 크기 제어
      imageCell.appendChild(imageElement);
      rowElement.appendChild(imageCell);
      
      const nameCell = document.createElement('div');
      nameCell.classList.add('cell');
      nameCell.dataset.name = item.name;
      nameCell.dataset.originalChance = item.chance; // 원래 확률 저장
      nameCell.textContent = item.name;
      rowElement.appendChild(nameCell);

      const chanceCell = document.createElement('div');
      chanceCell.classList.add('cell');
      chanceCell.dataset.originalChance = item.chance; // 원래 확률 저장
      chanceCell.textContent = `${parseFloat(item.chance).toFixed(6)}%`;
      rowElement.appendChild(chanceCell);

      itemsList.appendChild(rowElement);
    });

    updateChances();
  }

  function updateChances() {
    const checkboxes = document.querySelectorAll('.item-checkbox');
    const itemRows = document.querySelectorAll('.row');
    const items = [];
  
    // 부스트 아이템의 추가율 설정
    const boostValues = {
      '1.00': 0,       // 없음 (0% 증가)
      '1.025': 2.5,    // 분홍송편 (2.5% 증가)
      '1.05': 5,       // 송기송편 (5% 증가)
      '1.1': 10,       // 꽃송편 (10% 증가)
      '1.2': 20,       // 돼지송편 (20% 증가)
      '1.25': 25       // 가문송편 (25% 증가)
    };
  
    // 부스트 아이템 효과 계산 (선택한 값에 따라 증가율 합산)
    const totalBoostPercentage = boostItemSelects.reduce((total, select) => {
      const selectedBoost = select.value;  // 선택한 부스트 값 (문자열)
      return total + (boostValues[selectedBoost] || 0);  // 선택된 부스트의 추가율을 합산
    }, 0);

    itemRows.forEach((row, index) => {
      const checkbox = checkboxes[index];
      const nameCell = row.children[2]; // 이미지 셀이 추가되었으므로 이름은 2번째 셀로 변경
      const chanceCell = row.children[3]; // 확률은 3번째 셀로 변경
      items.push({
        element: row,
        name: nameCell.dataset.name,
        originalChance: parseFloat(chanceCell.dataset.originalChance),
        equip: checkbox ? checkbox.dataset.equip === 'true' : false,
        checked: checkbox ? checkbox.checked : false
      });
    });    

    const obtainedSum = items
      .filter(item => item.checked)
      .reduce((sum, item) => sum + item.originalChance, 0);

    const remainSum = 100 - obtainedSum;

    let remainingEquipSum = 0;
    items.forEach(item => {
      const chanceCell = item.element.children[3];
      if (item.checked) {
        chanceCell.textContent = '0.00%';
      } else {
        const adjustedChance = (item.originalChance / remainSum) * 100;
        const boostedChance = adjustedChance * (1 + totalBoostPercentage / 100);
        chanceCell.textContent = `${boostedChance.toFixed(6)}%`;
        if (item.equip) {
          remainingEquipSum += boostedChance;
        }
      }
    });

    remainingEquipSumElement.textContent = `${remainingEquipSum.toFixed(6)}%`;
  }

  function saveState(boxType) {
    const checkboxes = document.querySelectorAll('.item-checkbox');
    const state = {};
    checkboxes.forEach(checkbox => {
      state[checkbox.dataset.name] = checkbox.checked;
    });
    localStorage.setItem(`randbox_${boxType}`, JSON.stringify(state));
  }

  boxTypeSelect.addEventListener('change', (event) => {
    const boxType = event.target.value;
    fetchItems(boxType);
  });

  // 부스트 아이템이 변경될 때 확률 업데이트
  boostItemSelects.forEach(select => select.addEventListener('change', updateChances));

  // 초기 로드 시 750 루나 상자 아이템 로드
  fetchItems('750');
});
