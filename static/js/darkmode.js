// 페이지가 로드될 때 localStorage에 저장된 테마 적용
window.addEventListener('DOMContentLoaded', () => {
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
  
    const toggleButton = document.getElementById('theme-toggle');
    
    if (currentTheme === 'dark') {
      toggleButton.textContent = '라이트 모드';
    } else {
      toggleButton.textContent = '다크 모드';
    }
  
    toggleButton.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
  
      // 버튼 텍스트 변경
      if (newTheme === 'dark') {
        toggleButton.textContent = '라이트 모드';
      } else {
        toggleButton.textContent = '다크 모드';
      }
    });
  });
  