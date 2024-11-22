document.addEventListener("DOMContentLoaded", function () {
  const boxTypeSelect = document.getElementById("box-type");
  const itemsList = document.getElementById("items-list");
  const remainingEquipSumElement = document.getElementById("remaining-equip-sum");

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
        checkBox.dataset.originalChance = item.chance;
        checkBox.checked = savedState[item.name] || false;
        checkBox.addEventListener('change', () => {
          saveState(boxType);
          updateChances();
        });
        checkBoxCell.appendChild(checkBox);
      }
      rowElement.appendChild(checkBoxCell);

      const imageCell = document.createElement('div');
      imageCell.classList.add('cell');
      const imagePath = `/static/images/EquipImage/${item.name}.webp`;
      const imageElement = document.createElement('img');
      imageElement.src = imagePath;
      imageElement.alt = item.name;
      imageElement.classList.add('item-image');
      imageCell.appendChild(imageElement);
      rowElement.appendChild(imageCell);
      
      const nameCell = document.createElement('div');
      nameCell.classList.add('cell');
      nameCell.dataset.name = item.name;
      nameCell.dataset.originalChance = item.chance;
      nameCell.textContent = item.name;
      rowElement.appendChild(nameCell);

      const chanceCell = document.createElement('div');
      chanceCell.classList.add('cell');
      chanceCell.dataset.originalChance = item.chance;
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

    itemRows.forEach((row, index) => {
      const checkbox = checkboxes[index];
      const nameCell = row.children[2];
      const chanceCell = row.children[3];
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
        chanceCell.textContent = `${adjustedChance.toFixed(6)}%`;
        if (item.equip) {
          remainingEquipSum += adjustedChance;
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

  fetchItems('750');
});
