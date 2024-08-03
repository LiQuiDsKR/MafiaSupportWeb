// 확률 계산을 위한 슬롯 설정
const totalSlots = 12;
const jobSlots = {
  mafia: 3,
  support: 1,
  police: 1,
  doctor: 1,
  special: 5,
  cult: 1
};

// 각 그룹에 속하는 직업들
const jobs = {
  mafia: ["마피아"],
  support: ["스파이", "짐승인간", "도둑", "마담", "마녀", "과학자", "사기꾼", "청부업자"],
  police: ["경찰", "자경단원"],
  doctor: ["의사"],
  special: ["군인", "정치인", "영매", "연인", "기자", "건달", "사립탐정", "도굴꾼", "테러리스트", "성직자", "예언자", "간호사", "판사", "마술사", "해커", "심리학자", "용병", "공무원", "비밀결사", "파파라치"],
  cult: ["교주"]
};

// 각 직업군의 확률 계산
const jobProbabilities = {
  mafia: jobSlots.mafia / totalSlots,
  support: jobSlots.support / totalSlots / jobs.support.length,
  police: jobSlots.police / totalSlots / jobs.police.length,
  doctor: jobSlots.doctor / totalSlots,
  special: jobSlots.special / totalSlots / jobs.special.length,
  cult: jobSlots.cult / totalSlots
};

// 확률에 따른 직업 선택 함수
function getRandomJob() {
  const rand = Math.random();
  let cumulativeProbability = 0;

  // 마피아 선택
  cumulativeProbability += jobProbabilities.mafia;
  if (rand < cumulativeProbability) {
    return "마피아";
  }

  // 보조직업 선택
  cumulativeProbability += jobProbabilities.support * jobs.support.length;
  if (rand < cumulativeProbability) {
    return getRandomItem(jobs.support);
  }

  // 경찰류 직업 선택
  cumulativeProbability += jobProbabilities.police * jobs.police.length;
  if (rand < cumulativeProbability) {
    return getRandomItem(jobs.police);
  }

  // 의사 선택
  cumulativeProbability += jobProbabilities.doctor;
  if (rand < cumulativeProbability) {
    return "의사";
  }

  // 특수 직업 선택
  cumulativeProbability += jobProbabilities.special * jobs.special.length;
  if (rand < cumulativeProbability) {
    return getRandomItem(jobs.special);
  }

  // 교주 선택
  return "교주";
}

function getRandomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}
