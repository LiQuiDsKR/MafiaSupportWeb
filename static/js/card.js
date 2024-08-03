// static/js/card.js
class Card {
  constructor(role, tier, abilities, exp, maxExp) {
    this.role = role;
    this.tier = tier;
    this.abilities = abilities;
    this.exp = exp;
    this.maxExp = maxExp;
  }

  gainExp(amount) {
    this.exp += amount;
    if (this.exp > this.maxExp) {
      this.exp = this.maxExp;
    }
  }

  upgrade(additionalAbility) {
    if (this.exp === this.maxExp) {
      this.tier += 1;
      this.exp = 0;
      const maxExpValues = {1: 1000, 2: 2000, 3: 4000, 4: 8000, 5: 16000, 6: 32000};
      this.maxExp = maxExpValues[this.tier];
      this.abilities.push(additionalAbility);
    }
  }
}
