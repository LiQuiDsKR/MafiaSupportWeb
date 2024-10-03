$(document).ready(function() {
  function loadSuggestions() {
    $.getJSON('/get_suggestions', function(data) {
      const suggestionsList = $('#suggestions-list');
      suggestionsList.empty();

      data.forEach(function(suggestion) {
        const suggestionHtml = `
          <div class="suggestion-item" data-suggestion='${JSON.stringify(suggestion)}'>
            <div class="suggestion-content">
              <h5>${suggestion.name || '익명'} - ${suggestion.category}</h5>
              <p>${suggestion.suggestion}</p>
              <small>${suggestion.timestamp} | IP: ${suggestion.ip_address}</small>
              ${suggestion.replied ? `<div class="admin-reply"><strong>관리자 답변:</strong> ${suggestion.replyContent}</div>` : ''}
            </div>
            <div class="action-buttons">
              <button class="check-btn" title="답장"><i class="fas fa-check"></i></button>
              <button class="star-btn" title="중요 표시"><i class="far fa-star"></i></button>
              <button class="delete-btn" title="삭제"><i class="fas fa-trash"></i></button>
              <button class="block-btn" title="IP 차단"><i class="fas fa-ban"></i></button>
            </div>
          </div>
        `;
        suggestionsList.append(suggestionHtml);

        // IP가 밴 당했는지 확인하고, 밴 당했으면 메시지 표시
        checkBanStatus(suggestion.ip_address);
      });
    });
  }

  // IP 밴 상태 확인 함수
  function checkBanStatus(ip) {
    // 이미 밴 메시지가 추가된 IP는 다시 추가하지 않도록 함
    const existingBanMessage = $(`small:contains('${ip}')`).siblings('.ban-message');
    if (existingBanMessage.length > 0) {
      return;  // 이미 밴 메시지가 있으면 추가하지 않음
    }

    $.ajax({
      url: '/check_ban_status',
      method: 'GET',
      data: { ip: ip },
      success: function(response) {
        if (response.banned) {
          // 밴 메시지를 해당 IP 항목 밑에 빨간색으로 추가
          const banMessage = `
            <div class="ban-message" style="color: red; font-weight: bold; margin-top: 10px;">
              IP 밴: ${response.reason}
            </div>
          `;
          // IP 주소가 포함된 작은 텍스트(작은 태그 뒤에 삽입)
          $(`small:contains('${ip}')`).after(banMessage);
        }
      },
      error: function() {
        console.error('밴 상태 확인 중 오류가 발생했습니다.');
      }
    });
  }

  loadSuggestions();


  // 체크 버튼 클릭 시 답장 모달 띄우기
  $(document).on('click', '.check-btn', function() {
    const suggestionItem = $(this).closest('.suggestion-item').data('suggestion');  // suggestion 데이터 가져오기
    $('#sendReplyBtn').data('suggestion', suggestionItem);  // 답장 버튼에 데이터 저장
    $('#replySuggestionModal').modal('show');
  });

  $('#sendReplyBtn').on('click', function() {
    const suggestionItem = $(this).data('suggestion');  // 저장된 데이터 가져오기
    const replyContent = $('#replyMessage').val();

    if (replyContent.trim() === '') {
      alert('답장 내용을 입력하세요.');
      return;
    }

    // 답장 전송 로직
    $.ajax({
      url: '/update_suggestion',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        timestamp: suggestionItem.timestamp,  // 타임스탬프 전송
        ip_address: suggestionItem.ip_address,  // IP 주소 전송
        reply: replyContent  // 답장 내용 전송
      }),
      success: function(response) {
        alert('답장이 성공적으로 저장되었습니다.');
        $('#replySuggestionModal').modal('hide');
        $('#replyMessage').val('');  // 입력 필드 초기화
        loadSuggestions();  // 수정된 제안 목록을 다시 로드
      },
      error: function() {
          alert('답장 저장에 실패했습니다.');
      }
    });
  });

  // 별 버튼 클릭 시 pinned 토글 처리
  $(document).on('click', '.star-btn', function() {
    const suggestionItem = $(this).closest('.suggestion-item').data('suggestion');
    
    if (!suggestionItem) {
      alert('건의사항 데이터를 찾을 수 없습니다.');
      return;
    }

    // 현재 pinned 상태를 반대로 토글
    const isPinned = suggestionItem.pinned;

    // pinned 상태를 서버로 전송
    $.ajax({
      url: '/pin_suggestion',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        timestamp: suggestionItem.timestamp,  // 타임스탬프 전송
        ip_address: suggestionItem.ip_address,  // IP 주소 전송
        pinned: !isPinned  // 현재 상태를 토글하여 보냄
      }),
      success: function(response) {
        alert('건의사항의 pinned 상태가 업데이트되었습니다.');
        loadSuggestions();  // 제안 목록 새로고침
      },
      error: function(xhr, status, error) {
        alert('건의사항 pinned 상태 업데이트에 실패했습니다: ' + xhr.responseText);
      }
    });
  });


  // 삭제 버튼 클릭 시 삭제 처리
  $(document).on('click', '.delete-btn', function() {
    // 해당 건의사항의 데이터를 가져옵니다.
    const suggestionItem = $(this).closest('.suggestion-item').data('suggestion');  
    
    if (!suggestionItem) {
      alert('건의사항 데이터를 찾을 수 없습니다.');
      return;
    }

    // timestamp와 ip_address를 서버로 전송
    $.ajax({
      url: '/delete_suggestion',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        timestamp: suggestionItem.timestamp,  // timestamp 전송
        ip_address: suggestionItem.ip_address  // ip_address 전송
      }),
      success: function(response) {
        alert('건의사항이 성공적으로 삭제되었습니다.');
        loadSuggestions();  // 제안 목록 새로고침
      },
      error: function(xhr, status, error) {
        alert('건의사항 삭제에 실패했습니다: ' + xhr.responseText);
      }
    });
  });


  let currentIpToBlock = '';

  // IP 차단 모달 띄우기
  $(document).on('click', '.block-btn', function() {
    const suggestionItem = $(this).closest('.suggestion-item');
    currentIpToBlock = suggestionItem.find('small').text().split('IP: ')[1];
    $('#blockReasonModal').modal('show');
  });

  // IP 차단 처리
  $('#confirmBlockBtn').on('click', function() {
    const blockReason = $('#blockReason').val();
    $.ajax({
      url: '/block_ip',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ ip: currentIpToBlock, reason: blockReason }),
      success: function(response) {
        alert('IP가 차단되었습니다: ' + currentIpToBlock);
        $('#blockReasonModal').modal('hide');
        $('#blockReason').val(''); // 입력 필드 초기화
      },
      error: function() {
        alert('IP 차단에 실패했습니다.');
      }
    });
  });
});
