global.rpg = {
  role(level) {
    level = parseInt(level)
    if (isNaN(level)) return { name: '', level: '' }

    const role = [
      { name: 'وليـد الأعماق', level: 0 },
      { name: 'أسير الشعاب', level: 5 },
      { name: 'متمرّس البحار', level: 10 },
      { name: 'مرشد الحوريات', level: 15 },
      { name: '🐬 دبلوماسي المحيط', level: 20 },
      { name: '🥷 مروض التنين البحري', level: 25 },
      { name: '⚔ قاهر الكراكن', level: 30 },
      { name: '👑 سلطان البحار', level: 35 },
      { name: '🪼 وريث نبتون', level: 40 },
      { name: '🐍 سفير الجحيم البحري', level: 45 },
      { name: '👹 حارس القاع المظلم', level: 50 },
      { name: '🧙‍♂️ حكيم الأعماق الغامضة', level: 60 },
      { name: '🧝‍♂️ سيد مملكة أتلانتس', level: 70 },
      { name: '🐲 التنين البحري الأسطوري', level: 80 },
      { name: '🔮 سلطان المحيطات العظمى 🔮', level: 90 },
      { name: '🔱 إمبراطور البحار السبعة الأعظم 🔱', level: 100 },
    ]

    return role.reverse().find(role => level >= role.level)
  },
}