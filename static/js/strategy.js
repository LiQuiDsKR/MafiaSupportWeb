const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const boxSize = 150; // 박스 크기
const rows = 2;
const cols = 4;
const boxes = [];
const boxImages = {};
const arrows = [];
let images = [];
let selectedBox = null;
let isDrawing = false;
let startBox = null;
let currentEnd = null;

// 박스 초기화
for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {
    boxes.push({
      x: col * boxSize + boxSize / 2,
      y: row * boxSize + boxSize / 2,
    });
  }
}

// 박스와 화살표를 모두 그리는 함수
function drawBoxes() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 박스 그리기
  boxes.forEach((box) => {
    ctx.fillStyle = "#888";
    ctx.fillRect(box.x - boxSize / 2, box.y - boxSize / 2, boxSize, boxSize);
    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.strokeRect(box.x - boxSize / 2, box.y - boxSize / 2, boxSize, boxSize);
  });

  // 이미지 표시
  boxes.forEach((box, index) => {
    const imgSrc = boxImages[index];
    if (imgSrc) {
      const img = new Image();
      img.src = imgSrc;
      img.onload = () => {
        ctx.drawImage(img, box.x - boxSize / 4, box.y - boxSize / 4, boxSize / 2, boxSize / 2);
      };
    }
  });

  // 화살표 그리기
  arrows.forEach(({ start, end, color }) => {
    drawArrow(start.x, start.y, end.x, end.y, color); // 색상 적용
  });
}

// 화살표 그리기 함수
function drawArrow(fromX, fromY, toX, toY, color, alpha = 1, lineWidth = 5) {
  const headLength = 20; // 화살표 머리 길이
  const headWidth = 15; // 화살표 머리 폭
  const dx = toX - fromX;
  const dy = toY - fromY;
  const angle = Math.atan2(dy, dx);

  // 본체 선의 끝 지점 계산 (머리 중간 지점)
  const bodyEndX = toX - (headLength / 2) * Math.cos(angle);
  const bodyEndY = toY - (headLength / 2) * Math.sin(angle);

  // 선 본체
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(bodyEndX, bodyEndY);
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.stroke();

  // 화살표 머리 (삼각형)
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headLength * Math.cos(angle - Math.atan(headWidth / headLength)),
    toY - headLength * Math.sin(angle - Math.atan(headWidth / headLength))
  );
  ctx.lineTo(
    toX - headLength * Math.cos(angle + Math.atan(headWidth / headLength)),
    toY - headLength * Math.sin(angle + Math.atan(headWidth / headLength))
  );
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  ctx.fill();
  ctx.globalAlpha = 1; // 투명도 초기화
}

// 캔버스 클릭 이벤트 처리 (드래그 시작)
canvas.addEventListener("mousedown", (e) => {
  const closest = findClosestBox(e.offsetX, e.offsetY);
  if (closest) {
    isDrawing = true;
    startBox = closest;
  }
});

// 캔버스 드래그 중 처리 (임시 화살표 표시)
canvas.addEventListener("mousemove", (e) => {
  if (isDrawing) {
    const endBox = findClosestBox(e.offsetX, e.offsetY);
    if (endBox && startBox !== endBox) {
      currentEnd = endBox;
      drawBoxes();
      drawArrow(
        startBox.x,
        startBox.y,
        endBox.x,
        endBox.y,
        "rgba(0, 0, 255, 0.5)", // 임시 화살표 색상
        0.7,
        5
      );
    }
  }
});

// 캔버스 클릭/드래그 종료 처리
canvas.addEventListener("mouseup", (e) => {
  const endBox = findClosestBox(e.offsetX, e.offsetY);

  if (isDrawing && startBox && endBox) {
    if (startBox === endBox) {
      // 시작과 끝이 같은 경우: 클릭 작업
      const boxIndex = boxes.indexOf(startBox);

      if (e.button === 0) {
        // 좌클릭
        if (boxImages[boxIndex]) {
          // 이미지가 있는 경우 삭제
          delete boxImages[boxIndex];
          drawBoxes();
        } else {
          // 이미지가 없는 경우 모달 열기
          selectedBox = boxIndex;
          loadImages();
          $("#imageModal").modal("show");
        }
      }
    } else {
      // 시작과 끝이 다른 경우: 화살표 작업
      const color = e.button === 0 ? "blue" : "red"; // 좌클릭: 파란색, 우클릭: 빨간색

      // 중복 화살표 검사
      const existingArrowIndex = arrows.findIndex(
        (arrow) =>
          arrow.start.x === startBox.x &&
          arrow.start.y === startBox.y &&
          arrow.end.x === endBox.x &&
          arrow.end.y === endBox.y &&
          arrow.color === color
      );

      if (existingArrowIndex !== -1) {
        // 중복된 화살표가 있으면 삭제
        arrows.splice(existingArrowIndex, 1);
      } else {
        // 중복되지 않은 경우 새 화살표 추가
        arrows.push({ start: startBox, end: endBox, color });
      }

      drawBoxes(); // 화살표 갱신
    }
  }

  // 상태 초기화
  isDrawing = false;
  startBox = null;
  currentEnd = null;

  // 기본 동작 차단
  e.preventDefault();
  e.stopPropagation();
});

canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault(); // 기본 브라우저 메뉴 차단
  e.stopPropagation(); // 이벤트 전파 차단
});

// 가장 가까운 박스 찾기
function findClosestBox(x, y) {
  let closest = null;
  let minDistance = Infinity;
  boxes.forEach((box) => {
    const distance = Math.sqrt((box.x - x) ** 2 + (box.y - y) ** 2);
    if (distance < minDistance) {
      minDistance = distance;
      closest = box;
    }
  });
  return closest;
}

// 이미지 로드
function loadImages() {
  fetch("/strategy/job_thumbnails")
    .then((response) => response.json())
    .then((data) => {
      const imageContainer = document.getElementById("imageContainer");
      imageContainer.innerHTML = ""; // 기존 내용 초기화
      data.sort((a, b) => a.localeCompare(b)); // 파일 이름순 정렬
      data.forEach((imageName) => {
        const img = document.createElement("img");
        img.src = `/static/images/StrategyThumbnail/${imageName}`;
        img.style.width = "100px";
        img.style.cursor = "pointer";
        img.onclick = () => {
          boxImages[selectedBox] = img.src; // 이미지 저장
          drawBoxes();
          $("#imageModal").modal("hide"); // 모달 닫기
        };
        imageContainer.appendChild(img);
      });
    })
    .catch((error) => console.error("Error loading images:", error));
}

// 초기화
drawBoxes();

// 모든 화살표를 지우는 버튼 이벤트
const clearArrowsButton = document.getElementById("clearArrowsButton");

clearArrowsButton.addEventListener("click", () => {
  arrows.length = 0; // 화살표 배열 초기화
  drawBoxes(); // 캔버스 다시 그리기
});
