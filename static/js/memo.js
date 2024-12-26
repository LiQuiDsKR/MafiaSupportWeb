document.addEventListener('DOMContentLoaded', () => {
  const memoPreview = document.getElementById('memo-preview');
  const backgroundScroll = document.querySelector('.background-scroll');
  const skinModal = document.getElementById('skin-modal');
  const modalContent = document.querySelector('.skin-options');
  const closeModal = document.querySelector('.close-modal');
  const modalTitle = document.getElementById('modal-title');
  const whiteTextToggle = document.getElementById('white-text-toggle');
  const toggleTextColorButton = document.getElementById('toggle-text-color');
  let isWhiteText = false;

  // 직업과 영문명 매핑
  const jobMappings = {
    "마피아": "mafia",
    "경찰": "police",
    "자경단원": "vigilante",
    "요원": "agent",
    "의사": "doctor",
    "악인": "villain",
    "시민": "citizen",
    "s1": "s1",
    "s2": "s2",
    "추리 중": "none",
    "도둑": "thief",
    "사기꾼": "pretender",
    "청부업자": "hitman",
    "s3": "s3",
    "s4": "s4",
    "군인": "soldier",
    "정치인": "politician",
    "영매": "shaman",
    "연인": "couple",
    "기자": "reporter",
    "건달": "gangster",
    "사립탐정": "detective",
    "도굴꾼": "ghoul",
    "테러리스트": "terrorist",
    "성직자": "priest",
    "예언자": "prophet",
    "판사": "judge",
    "간호사": "nurse",
    "마술사": "magician",
    "해커": "hacker",
    "심리학자": "mentalist",
    "용병": "mercenary",
    "공무원": "official",
    "비밀결사": "cabal",
    "파파라치": "paparazzi",
    "최면술사": "hypnotist"
  };

  // 메모장 배경 로드
  fetch('/get_memo_skins/MemoBackground')
    .then(response => response.json())
    .then(data => {
      data.forEach(file => {
        const img = document.createElement('img');
        img.src = `/static/images/MemoCustomizer/MemoBackground/${file}`;
        img.alt = file;
        img.className = 'background-image';
        img.addEventListener('click', () => {
          // 배경 클릭 시 미리보기 배경 변경
          memoPreview.style.backgroundImage = `url(${img.src})`;
        });
        backgroundScroll.appendChild(img);
      });
    })
    .catch(err => console.error('Error loading backgrounds:', err));

  // 직업별 스킨 선택
  const jobIconContainer = document.querySelector('.job-icons');
  Object.keys(jobMappings).forEach(job => {
    const englishName = jobMappings[job];
    
    // 직업이 없는 경우 모달을 열지 않도록 조건 추가
    if (englishName) {
      const jobContainer = document.createElement('div'); // 직업 아이콘과 이름을 묶는 컨테이너
      const img = document.createElement('img');
      const jobName = document.createElement('span'); // 직업명 추가

      // 색상 설정
      if (["s1", "s2", "s3", "s4"].includes(englishName)) {
        jobName.style.color = 'transparent';
      } else if (['mafia', 'villain'].includes(englishName)) {
        jobName.style.color = 'black';
      } else if (['police', 'vigilante', 'agent', 'doctor', 'citizen'].includes(englishName)) {
        jobName.style.color = 'black';
      } else {
        jobName.style.color = 'black';
      }

      jobName.textContent = job; // 직업명 설정

      // s1, s2, s3, s4의 경우 투명 이미지 사용
      if (['s1', 's2', 's3', 's4'].includes(englishName)) {
        img.src = '/static/images/MemoCustomizer/RoleThumb/spacer.webp'; // 투명 이미지
        img.className = 'job-icon';
        img.dataset.job = job;
        jobContainer.appendChild(img);
        jobContainer.appendChild(jobName); // 직업명 추가
        jobIconContainer.appendChild(jobContainer); // 컨테이너 추가
        return; // 모달을 띄우지 않도록 종료
      }
      img.src = `/static/images/MemoCustomizer/RoleThumb/${job}/jobthumb_${englishName}.webp`;
      img.alt = job;
      img.className = 'job-icon';
      img.dataset.job = job;

      img.addEventListener('click', () => {
        modalTitle.textContent = `${job} 스킨 선택`;
        modalContent.innerHTML = ''; // 기존 스킨 옵션 초기화

        // 스킨 데이터 로드
        fetch(`/get_memo_skins/RoleThumb/${job}`)
          .then(response => {
            if (!response.ok) {
              throw new Error('직업 스킨이 없습니다.'); // 직업 스킨이 없는 경우 에러 발생
            }
            return response.json();
          })
          .then(data => {
            data.forEach(file => {
              const skinImg = document.createElement('img');
              skinImg.src = `/static/images/MemoCustomizer/RoleThumb/${job}/${file}`;
              skinImg.alt = file;
              skinImg.addEventListener('click', () => {
                img.src = skinImg.src; // 선택된 스킨 아이콘 변경
                skinModal.classList.add('hidden'); // 모달 닫기
              });
              modalContent.appendChild(skinImg);
            });
          })
          .catch(err => {
            console.error(err);
            skinModal.classList.add('hidden'); // 모달 닫기
          });

        skinModal.classList.remove('hidden');
      });

      jobContainer.appendChild(img);
      jobContainer.appendChild(jobName); // 직업명 추가
      jobIconContainer.appendChild(jobContainer); // 컨테이너 추가
    }
  });

  // 모달 닫기
  closeModal.addEventListener('click', () => {
    skinModal.classList.add('hidden');
  });

  // 직업 이름 색상 스왑
  toggleTextColorButton.addEventListener('click', () => {
    const jobNames = document.querySelectorAll('.job-icons span');
    isWhiteText = !isWhiteText; // 상태 반전

    jobNames.forEach(jobName => {
      const englishName = jobMappings[jobName.textContent]; // 직업명에 해당하는 영문명 가져오기
      // s1, s2, s3, s4의 경우 색상 변경하지 않음
      if (!["s1", "s2", "s3", "s4"].includes(englishName)) {
        jobName.style.color = isWhiteText ? 'white' : 'black'; // 색상 변경
      }
    });

    // 버튼 텍스트 변경
    toggleTextColorButton.textContent = isWhiteText ? '직업 이름 검은색으로 바꾸기' : '직업 이름 흰색으로 바꾸기';
  });
});