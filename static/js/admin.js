// static/js/admin.js
document.addEventListener("DOMContentLoaded", function () {
  const boxTypeSelect = document.getElementById("box-type");
  const itemsTableBody = document.querySelector("#items-table tbody");
  const saveButton = document.getElementById("save-button");
  const addButton = document.getElementById("add-button");

  function fetchItems(boxType) {
    fetch(`/get_items/${boxType}`)
      .then(response => response.json())
      .then(data => {
        updateItemsTable(data);
      });
  }

  function updateItemsTable(items) {
    itemsTableBody.innerHTML = '';
    items.forEach((item, index) => {
      const row = document.createElement('tr');

      const nameCell = document.createElement('td');
      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.value = item.name;
      nameCell.appendChild(nameInput);
      row.appendChild(nameCell);

      const chanceCell = document.createElement('td');
      const chanceInput = document.createElement('input');
      chanceInput.type = 'number';
      chanceInput.step = '0.01';
      chanceInput.value = item.chance.toFixed(2);
      chanceCell.appendChild(chanceInput);
      row.appendChild(chanceCell);

      const equipCell = document.createElement('td');
      const equipCheckbox = document.createElement('input');
      equipCheckbox.type = 'checkbox';
      equipCheckbox.checked = item.equip;
      equipCell.appendChild(equipCheckbox);
      row.appendChild(equipCell);

      const deleteCell = document.createElement('td');
      const deleteButton = document.createElement('button');
      deleteButton.textContent = '삭제';
      deleteButton.addEventListener('click', () => {
        row.remove();
      });
      deleteCell.appendChild(deleteButton);
      row.appendChild(deleteCell);

      itemsTableBody.appendChild(row);
    });
  }

  function saveItems(boxType) {
    const rows = itemsTableBody.querySelectorAll('tr');
    const items = [];
    rows.forEach(row => {
      const name = row.querySelector('td:nth-child(1) input').value;
      const chance = parseFloat(row.querySelector('td:nth-child(2) input').value);
      const equip = row.querySelector('td:nth-child(3) input').checked;
      items.push({ name, chance, equip });
    });

    fetch('/save_items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ box_type: boxType, items }),
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        alert('파일이 저장되었습니다.');
      } else {
        alert('파일 저장에 실패했습니다.');
      }
    });
  }

  function addItem() {
    const row = document.createElement('tr');

    const nameCell = document.createElement('td');
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameCell.appendChild(nameInput);
    row.appendChild(nameCell);

    const chanceCell = document.createElement('td');
    const chanceInput = document.createElement('input');
    chanceInput.type = 'number';
    chanceInput.step = '0.01';
    chanceCell.appendChild(chanceInput);
    row.appendChild(chanceCell);

    const equipCell = document.createElement('td');
    const equipCheckbox = document.createElement('input');
    equipCheckbox.type = 'checkbox';
    equipCell.appendChild(equipCheckbox);
    row.appendChild(equipCell);

    const deleteCell = document.createElement('td');
    const deleteButton = document.createElement('button');
    deleteButton.textContent = '삭제';
    deleteButton.addEventListener('click', () => {
      row.remove();
    });
    deleteCell.appendChild(deleteButton);
    row.appendChild(deleteCell);

    itemsTableBody.appendChild(row);
  }

  boxTypeSelect.addEventListener('change', (event) => {
    const boxType = event.target.value;
    fetchItems(boxType);
  });

  saveButton.addEventListener('click', () => {
    const boxType = boxTypeSelect.value;
    saveItems(boxType);
  });

  addButton.addEventListener('click', () => {
    addItem();
  });

  // 초기 로드 시 750 루나 상자 아이템 로드
  fetchItems('750');
});
