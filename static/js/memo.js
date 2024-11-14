const skins = {
    '마피아': ['기본 스킨', '어둠의 스킨', '붉은 밤 스킨'],
    '경찰': ['기본 스킨', '블루 스킨', '포스 스킨'],
    '자경단원': ['기본 스킨', '비밀 스킨', '전설 스킨'],
    '요원': ['기본 스킨', '다크 요원 스킨', '하얀 요원 스킨'],
    '의사': ['기본 스킨', '생명의 손길', '치유의 스킨'],
    // 더 많은 직업에 대한 스킨 추가
  };
  
  document.querySelectorAll('.job-btn').forEach(button => {
    button.addEventListener('click', () => {
      const job = button.getAttribute('data-job');
      const skinList = skins[job];
      const skinContainer = document.getElementById('skin-list');
      skinContainer.innerHTML = '';
  
      skinList.forEach(skin => {
        const skinItem = document.createElement('button');
        skinItem.className = 'btn btn-outline-primary m-2';
        skinItem.textContent = skin;
        skinContainer.appendChild(skinItem);
  
        skinItem.addEventListener('click', () => {
          alert(`${job}의 ${skin} 스킨이 선택되었습니다.`);
          $('#skinModal').modal('hide');
        });
      });
  
      $('#skinModal').modal('show');
    });
  });
  