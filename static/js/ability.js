const abilities = {
  tier1: { 
    mafia: "악행", 
    support: "악행", 
    police: "정의", 
    doctor: "정의", 
    special: "정의", 
    cult: "악행", 
    civilian: "정의",
    villain: "악행"
  },
  
  tier2: {
    mafia: { 마피아: "처형" },
    support: { 스파이: "첩보", 짐승인간: "갈망", 마담: "유혹", 도둑: "도벽", 마녀: "저주", 과학자: "재생", 사기꾼: "사기", 청부업자: "청부", 악인: null },
    police: { 경찰: "수색", 자경단원: "숙청", 요원: "공작" },
    doctor: { 의사: "치료" },
    special: { 군인: "방탄", 정치인: "처세", 영매: "성불", 연인: "희생", 기자: "특종", 건달: "공갈", 사립탐정: "추리", 도굴꾼: "도굴", 테러리스트: "자폭", 성직자: "소생", 예언자: "계시", 간호사: "처방", 판사: "선고", 마술사: "트릭", 해커: "해킹", 심리학자: "관찰", 용병: "의뢰", 공무원: "조회", 비밀결사: "밀사", 파파라치: "이슈", 최면술사: "최면", 시민: null },
    cult: { 교주: "포교" }
  },
  tier3: ["열정", "냉정", "달변", "숙련", "탐욕", "고무", "쇼맨십", "보험"],
  tier3_mafia: ["열정", "냉정", "달변", "숙련", "탐욕", "고무", "쇼맨십", "광기"]
};

function getRandomItem(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function getRoleType(role) {
  if (jobs.mafia.includes(role)) return 'mafia';
  if (jobs.support.includes(role)) return 'support';
  if (jobs.police.includes(role)) return 'police';
  if (jobs.doctor.includes(role)) return 'doctor';
  if (jobs.special.includes(role)) return 'special';
  if (jobs.cult.includes(role)) return 'cult';
  if (role === '시민') return 'civilian';
  if (role === '악인') return 'villain';
  return null;
}


function getAbilities(tier, role) {
  const roleAbilities = new Set();
  const roleType = getRoleType(role);

  roleAbilities.add(abilities.tier1[roleType]);
  
  if (tier >= 2) {
    roleAbilities.add(abilities.tier2[roleType][role] || "없음");
  }
  if (tier >= 3) {
    if (role === "마피아" || role === "짐승인간") {
      while (roleAbilities.size < 3) {
        roleAbilities.add(getRandomItem(abilities.tier3_mafia));
      }
    } else {
      while (roleAbilities.size < 3) {
        roleAbilities.add(getRandomItem(abilities.tier3));
      }
    }
  }
  if (tier >= 4) {
    while (roleAbilities.size < 4) {
      roleAbilities.add(getRandomItem(tier4_6Abilities[role]));
    }
  }
  if (tier >= 5) {
    while (roleAbilities.size < 5) {
      roleAbilities.add(getRandomItem(tier4_6Abilities[role]));
    }
  }
  if (tier >= 6) {
    while (roleAbilities.size < 6) {
      roleAbilities.add(getRandomItem(tier4_6Abilities[role]));
    }
  }

  return Array.from(roleAbilities);
}

function canAssignAbility(role, ability) {
  return tier4_6Abilities[ability].includes(role);
}

function getTier4_6Ability(role) {
  const availableAbilities = Object.keys(tier4_6Abilities).filter(ability => canAssignAbility(role, ability));
  return getRandomItem(availableAbilities);
}
