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

  $(document).on('click', '.check-btn', function() {
    $(this).toggleClass('btn-success btn-secondary');
  });

  $(document).on('click', '.star-btn', function() {
    $(this).find('i').toggleClass('far fas starred');
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
