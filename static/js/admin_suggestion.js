$(document).ready(function() {
  function loadSuggestions() {
    $.getJSON('/get_suggestions', function(data) {
      const suggestionsList = $('#suggestions-list');
      suggestionsList.empty();
      
      data.forEach(function(suggestion, index) {
        const suggestionHtml = `
          <div class="suggestion-item" data-id="${index}">
            <div class="suggestion-content">
              <h5>${suggestion.name} - ${suggestion.category}</h5>
              <p>${suggestion.suggestion}</p>
              <small>${suggestion.timestamp} | IP: ${suggestion.ip_address}</small>
            </div>
            <div class="action-buttons">
              <button class="check-btn" title="확인"><i class="fas fa-check"></i></button>
              <button class="star-btn" title="중요 표시"><i class="far fa-star"></i></button>
              <button class="delete-btn" title="삭제"><i class="fas fa-trash"></i></button>
              <button class="block-btn" title="IP 차단"><i class="fas fa-ban"></i></button>
            </div>
          </div>
        `;
        suggestionsList.append(suggestionHtml);
      });
    });
  }

  loadSuggestions();

  // 체크 버튼 클릭 시 모달 띄우기 및 답장 처리
  $('.check-btn').on('click', function() {
    // 모달 띄우기
    $('#replyModal').modal('show');
  });

  // 답장 모달에서 답장 내용 저장
  $('#confirmReplyBtn').on('click', function() {
    const replyContent = $('#replyContent').val();
    if (replyContent) {
      // suggestion 수정 로직
      suggestion.replied = true;
      suggestion.reply = replyContent;
      $.ajax({
        url: '/update_suggestion',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ id: suggestion.id, reply: replyContent }),
        success: function(response) {
          alert('답장이 성공적으로 저장되었습니다.');
          loadSuggestions(); // 수정된 제안 목록을 다시 로드
        },
        error: function() {
          alert('답장 저장에 실패했습니다.');
        }
      });
    }
  });

  // 별 버튼 클릭 시 pinned 토글 처리
  $('.star-btn').on('click', function() {
    const isPinned = $(this).hasClass('starred');
    $(this).toggleClass('starred', !isPinned);
    // pinned 상태 업데이트
    suggestion.pinned = !isPinned;
  });

  $(document).on('click', '.delete-btn', function() {
    const suggestionItem = $(this).closest('.suggestion-item');
    const suggestionId = suggestionItem.data('id');
    
    $.ajax({
      url: '/delete_suggestion',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ id: suggestionId }),
      success: function(response) {
        suggestionItem.remove();
        alert('제안이 성공적으로 삭제되었습니다.');
      },
      error: function() {
        alert('제안 삭제에 실패했습니다.');
      }
    });
  });

  let currentIpToBlock = '';

  $(document).on('click', '.block-btn', function() {
    const suggestionItem = $(this).closest('.suggestion-item');
    currentIpToBlock = suggestionItem.find('small').text().split('IP: ')[1];
    $('#blockReasonModal').modal('show');
  });

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
        $('#blockReason').val('');
      },
      error: function() {
        alert('IP 차단에 실패했습니다.');
      }
    });
  });
});
