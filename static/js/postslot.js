$(document).ready(function() {
  // 기존 기능 코드
  $('#postSlotForm').on('submit', function(e) {
    e.preventDefault();
    
    let currentSlots = parseInt($('#currentSlots').val());
    
    if (isNaN(currentSlots) || currentSlots < 42 || currentSlots % 10 !== 2) {
      alert('우체통 슬롯 수는 42 이상이어야 하며, 2로 끝나야 합니다 (예: 42, 52, 62 등).');
      $('#result').text('');
      return;
    }
    
    let cost = (currentSlots - 32) * 1000;
    $('#result').text(`다음 확장 비용: ${cost.toLocaleString()} 루블`);
  });

  $('#currentSlots').on('input', function() {
    $(this).val($(this).val().replace(/[^0-9]/g, ''));
  });

  // 새로운 기능 코드
  $('#totalCostForm').on('submit', function(e) {
    e.preventDefault();
    
    let currentSlots = parseInt($('#currentSlots').val());
    let targetSlots = parseInt($('#targetSlots').val());
    let hermesBags = $('#hermesBags').val().trim() === '' ? 0 : parseInt($('#hermesBags').val());
    
    // 헤르메스의 엽서가방 입력란이 비어있으면 0으로 설정
    if ($('#hermesBags').val().trim() === '') {
      $('#hermesBags').val(0);
      hermesBags = 0;
    }
    
    if (isNaN(currentSlots) || isNaN(targetSlots) ||
        currentSlots < 42 || targetSlots < 42 || 
        currentSlots % 10 !== 2 || targetSlots % 10 !== 2 ||
        currentSlots >= targetSlots) {
      alert('입력값을 확인해주세요. 우체통 슬롯 수는 42 이상이어야 하며, 2로 끝나야 합니다. 목표 슬롯 수는 현재보다 커야 합니다.');
      $('#result').text('');
      return;
    }
    
    let nextExpansionCost = (currentSlots - 32) * 1000;
    let totalCost = 0;
    let expansions = (targetSlots - currentSlots) / 10;
    let paidExpansions = Math.max(0, expansions - hermesBags);
    
    for (let i = 0; i < paidExpansions; i++) {
      totalCost += (currentSlots - 32 + i * 10) * 1000;
    }
    
    $('#result').html(`
      다음 확장 비용: ${nextExpansionCost.toLocaleString()} 루블<br>
      총 확장 비용: ${totalCost.toLocaleString()} 루블<br>
      총 확장 횟수: ${expansions}<br>
      루블 확장 횟수: ${paidExpansions}<br>
      헤르메스의 엽서가방 사용 횟수: ${Math.min(hermesBags, expansions)}
    `);
  });

  $('#currentSlots, #targetSlots, #hermesBags').on('input', function() {
    $(this).val($(this).val().replace(/[^0-9]/g, ''));
  });
});
