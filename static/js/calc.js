$(document).ready(function() {
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
    let exchangeRate = parseInt($('#exchangeRate').val());
    
    // 헤르메스의 엽서가방 입력란이 비어있으면 0으로 설정
    if ($('#hermesBags').val().trim() === '') {
        $('#hermesBags').val(0);
        hermesBags = 0;
    }
    
    if (isNaN(currentSlots) || isNaN(targetSlots) ||
        currentSlots < 42 || targetSlots < 42 || 
        currentSlots % 10 !== 2 || targetSlots % 10 !== 2 ||
        currentSlots >= targetSlots || isNaN(exchangeRate) || exchangeRate <= 0) {
        alert('입력값을 확인해주세요. 우체통 슬롯 수는 42 이상이어야 하며, 2로 끝나야 합니다. 목표 슬롯 수는 현재보다 커야 하고, 환율은 양수여야 합니다.');
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

    // 루나로 계산
    let rubleToLuna = totalCost / 1000000 * exchangeRate;
    let lunaWithFee = rubleToLuna * 1.35; // 구매 시 35% 수수료 적용

    $('#result').html(`
        다음 확장 비용: ${nextExpansionCost.toLocaleString()} 루블<br>
        총 확장 비용: ${totalCost.toLocaleString()} 루블<br>
        총 확장 횟수: ${expansions}<br>
        루블 확장 횟수: ${paidExpansions}<br>
        헤르메스의 엽서가방 사용 횟수: ${Math.min(hermesBags, expansions)}<br>
        <br>
        환율 ${exchangeRate} 기준<br>
        총 확장 비용: ${rubleToLuna.toLocaleString()} 루나<br>
        수수료 포함 총 비용: ${lunaWithFee.toLocaleString()} 루나
    `);
  });

  $('#currentSlots, #targetSlots, #hermesBags, #exchangeRate').on('input', function() {
      $(this).val($(this).val().replace(/[^0-9]/g, ''));
  });

  // 6티어 카드 계산기
  $(document).ready(function() {
    $('#tierCardForm').on('submit', function(e) {
        e.preventDefault();

        // 입력된 티어 카드 수량 가져오기
        let tier3Cards = parseInt($('#tier3Cards').val());
        let tier4Cards = parseInt($('#tier4Cards').val());
        let tier5Cards = parseInt($('#tier5Cards').val());

        // 6티어 카드 한장을 만들기 위해 필요한 총 3티어 카드 수
        let totalRequiredTier3 = 120;

        // 현재 가지고 있는 카드를 3티어 카드로 환산
        let currentTier3Equivalent = tier3Cards + (tier4Cards * 4) + (tier5Cards * 20);

        // 부족한 3티어 카드 수
        let remainingTier3Needed = totalRequiredTier3 - currentTier3Equivalent;
        if (remainingTier3Needed <= 0) {
            $('#cardResult').html('이미 충분한 카드를 가지고 있습니다.');
            return;
        }

        // 부족한 3티어 카드를 5티어와 4티어 카드로 분배
        let neededTier5Cards = Math.floor(remainingTier3Needed / 20);  // 5티어로 필요한 카드 수
        let remainingAfterTier5 = remainingTier3Needed % 20;            // 5티어로 분배 후 남은 3티어 카드 수

        let neededTier4Cards = Math.floor(remainingAfterTier5 / 4);     // 4티어로 필요한 카드 수
        let remainingAfterTier4 = remainingAfterTier5 % 4;              // 4티어로 분배 후 남은 3티어 카드 수

        let neededTier3Cards = remainingAfterTier4;                     // 최종적으로 필요한 3티어 카드 수

        // 결과 출력
        $('#cardResult').html(`
            필요한 3티어 카드 : ${remainingTier3Needed}장<br>
            <br>
            3, 4, 5티어 카드로 환산 시
            <br>
            5티어 카드: ${neededTier5Cards}장<br>
            4티어 카드: ${neededTier4Cards}장<br>
            3티어 카드: ${neededTier3Cards}장
        `);
    });
  });
  // 출석 보상 계산기
  $('#attendanceForm').on('submit', function(e) {
    e.preventDefault();

    // 명성 가져오기
    let fame = parseInt($('#fame').val());
    
    // 길드 등급 및 건물 레벨 가져오기
    let guildRank = parseInt($('#guildRank').val());
    let buildingLevel = parseInt($('#buildingLevel').val());

    // 유명세 효과 체크 상태
    let fameEffect = $('#fameEffect').is(':checked');

    // 출석 일수 가져오기
    let days = parseInt($('#days').val());

    // 기본 보상량 100
    let baseReward = 100;

    // 길드 등급 보너스
    let guildBonus = guildRank;

    // 유명세 효과 보너스 (체크되었을 경우 +3)
    let fameBonus = fameEffect ? 3 : 0;

    // 길드 건물 레벨 보너스
    let buildingBonus = buildingLevel * 2.5;

    // 총 버프량 계산
    let totalBonus = baseReward + guildBonus + fameBonus + buildingBonus;

    // 출석 보상 계산 (명성 * 버프량)
    let dailyReward = fame * totalBonus;

    // 총 보상 계산 (출석 일수 * 일일 보상)
    let totalReward = dailyReward * days;

    // 결과 출력
    $('#attendanceResult').html(`
        총 버프량: ${totalBonus}%<br>
        일일 출석 보상: ${dailyReward.toLocaleString()} 루블<br>
        ${days}일 누적 보상: ${totalReward.toLocaleString()} 루블
    `);
  });
});