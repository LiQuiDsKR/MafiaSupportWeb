document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('suggestionForm');
  const submitButton = form.querySelector('button[type="submit"]');
  const agreePolicy = document.getElementById('agreePolicy');
  const agreePrivacy = document.getElementById('agreePrivacy');

  // 초기 버튼 상태 설정
  submitButton.disabled = true;

  // 체크박스 상태 변경 시 버튼 활성화 여부 확인
  [agreePolicy, agreePrivacy].forEach(checkbox => {
    checkbox.addEventListener('change', updateSubmitButton);
  });

  // 제출 버튼 활성화 여부 업데이트 함수
  function updateSubmitButton() {
    submitButton.disabled = !(agreePolicy.checked && agreePrivacy.checked);
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!agreePolicy.checked || !agreePrivacy.checked) {
      let uncheckedItems = [];
      if (!agreePolicy.checked) uncheckedItems.push('이용약관');
      if (!agreePrivacy.checked) uncheckedItems.push('개인정보 수집 및 이용');
      
      alert(`다음 항목에 동의해주세요: ${uncheckedItems.join(', ')}`);
      return;
    }
    
    const formData = {
      name: document.getElementById('name').value,
      category: document.getElementById('category').value,
      suggestion: document.getElementById('suggestion').value
    };

    fetch('/submit_suggestion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        alert('의견이 성공적으로 제출되었습니다. 감사합니다!');
        form.reset();
        updateSubmitButton(); // 폼 초기화 후 버튼 상태 업데이트
      } else {
        alert('의견 제출 중 오류가 발생했습니다. 다시 시도해 주세요.');
      }
    })
    .catch((error) => {
      console.error('Error:', error);
      alert('의견 제출 중 오류가 발생했습니다. 다시 시도해 주세요.');
    });
  });
});
