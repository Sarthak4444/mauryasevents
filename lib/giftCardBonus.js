export const getGiftCardBonus = (amount) => {
  const value = Number(amount);

  if (value >= 100) return 20;
  if (value >= 50) return 10;
  return 0;
};

export const calculateGiftCardBonus = (cards) =>
  cards.reduce((total, card) => total + getGiftCardBonus(card.amount), 0);