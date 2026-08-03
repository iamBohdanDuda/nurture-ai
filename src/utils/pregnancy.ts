import { type PregnancyWeekInfo } from '@/types/common';

/**
 * Week-to-fruit size comparison mapping.
 * Covers weeks 4–40 with emoji, size, and description.
 */
const WEEK_DATA: Record<number, Omit<PregnancyWeekInfo, 'week'>> = {
  4:  { fruitName: 'Poppy Seed',      fruitEmoji: '🌱', babyLength: '0.1 cm', babyWeight: '<1 g',    description: 'Cells are rapidly dividing into layers.' },
  5:  { fruitName: 'Sesame Seed',     fruitEmoji: '🫘', babyLength: '0.2 cm', babyWeight: '<1 g',    description: 'Heart begins to beat!' },
  6:  { fruitName: 'Lentil',          fruitEmoji: '🟤', babyLength: '0.6 cm', babyWeight: '<1 g',    description: 'Tiny nose, mouth, and ears forming.' },
  7:  { fruitName: 'Blueberry',       fruitEmoji: '🫐', babyLength: '1.3 cm', babyWeight: '<1 g',    description: 'Brain is growing rapidly.' },
  8:  { fruitName: 'Raspberry',       fruitEmoji: '🍇', babyLength: '1.6 cm', babyWeight: '1 g',     description: 'Fingers and toes are forming.' },
  9:  { fruitName: 'Cherry',          fruitEmoji: '🍒', babyLength: '2.3 cm', babyWeight: '2 g',     description: 'All essential organs have begun.' },
  10: { fruitName: 'Strawberry',      fruitEmoji: '🍓', babyLength: '3.1 cm', babyWeight: '4 g',     description: 'Bones and cartilage forming.' },
  11: { fruitName: 'Lime',            fruitEmoji: '🍋', babyLength: '4.1 cm', babyWeight: '7 g',     description: 'Tooth buds appearing.' },
  12: { fruitName: 'Plum',            fruitEmoji: '🟣', babyLength: '5.4 cm', babyWeight: '14 g',    description: 'Reflexes starting!' },
  13: { fruitName: 'Peach',           fruitEmoji: '🍑', babyLength: '7.4 cm', babyWeight: '23 g',    description: 'Vocal cords developing.' },
  14: { fruitName: 'Lemon',           fruitEmoji: '🍋', babyLength: '8.7 cm', babyWeight: '43 g',    description: 'Can make facial expressions.' },
  15: { fruitName: 'Apple',           fruitEmoji: '🍎', babyLength: '10 cm',  babyWeight: '70 g',    description: 'Legs are longer than arms.' },
  16: { fruitName: 'Avocado',         fruitEmoji: '🥑', babyLength: '12 cm',  babyWeight: '100 g',   description: 'Can hear sounds outside the womb.' },
  17: { fruitName: 'Pear',            fruitEmoji: '🍐', babyLength: '13 cm',  babyWeight: '140 g',   description: 'Skeleton hardening from cartilage to bone.' },
  18: { fruitName: 'Bell Pepper',     fruitEmoji: '🫑', babyLength: '14 cm',  babyWeight: '190 g',   description: 'You may feel kicks!' },
  19: { fruitName: 'Mango',           fruitEmoji: '🥭', babyLength: '15 cm',  babyWeight: '240 g',   description: 'Senses developing rapidly.' },
  20: { fruitName: 'Banana',          fruitEmoji: '🍌', babyLength: '16 cm',  babyWeight: '300 g',   description: 'Halfway there! Swallowing more.' },
  21: { fruitName: 'Carrot',          fruitEmoji: '🥕', babyLength: '27 cm',  babyWeight: '360 g',   description: 'Eyebrows and lids present.' },
  22: { fruitName: 'Papaya',          fruitEmoji: '🧡', babyLength: '28 cm',  babyWeight: '430 g',   description: 'Eyes formed, irises still lack color.' },
  23: { fruitName: 'Grapefruit',      fruitEmoji: '🍊', babyLength: '29 cm',  babyWeight: '500 g',   description: 'Baby is listening to your voice.' },
  24: { fruitName: 'Corn',            fruitEmoji: '🌽', babyLength: '30 cm',  babyWeight: '600 g',   description: 'Lungs developing branches.' },
  25: { fruitName: 'Cauliflower',     fruitEmoji: '🥦', babyLength: '35 cm',  babyWeight: '660 g',   description: 'Baby starts gaining baby fat.' },
  26: { fruitName: 'Lettuce',         fruitEmoji: '🥬', babyLength: '36 cm',  babyWeight: '760 g',   description: 'Eyes opening for the first time.' },
  27: { fruitName: 'Cabbage',         fruitEmoji: '🥬', babyLength: '37 cm',  babyWeight: '875 g',   description: 'Brain is very active now.' },
  28: { fruitName: 'Eggplant',        fruitEmoji: '🍆', babyLength: '38 cm',  babyWeight: '1 kg',    description: 'Can blink and dream!' },
  29: { fruitName: 'Butternut Squash',fruitEmoji: '🎃', babyLength: '39 cm',  babyWeight: '1.15 kg', description: 'Muscles and lungs maturing.' },
  30: { fruitName: 'Coconut',         fruitEmoji: '🥥', babyLength: '40 cm',  babyWeight: '1.3 kg',  description: 'Growing stronger each day.' },
  31: { fruitName: 'Pineapple',       fruitEmoji: '🍍', babyLength: '41 cm',  babyWeight: '1.5 kg',  description: 'All five senses working.' },
  32: { fruitName: 'Squash',          fruitEmoji: '🎃', babyLength: '42 cm',  babyWeight: '1.7 kg',  description: 'Toenails and fingernails formed.' },
  33: { fruitName: 'Celery',          fruitEmoji: '🥬', babyLength: '44 cm',  babyWeight: '1.9 kg',  description: 'Bones hardening.' },
  34: { fruitName: 'Cantaloupe',      fruitEmoji: '🍈', babyLength: '45 cm',  babyWeight: '2.1 kg',  description: 'Central nervous system maturing.' },
  35: { fruitName: 'Honeydew',        fruitEmoji: '🍈', babyLength: '46 cm',  babyWeight: '2.4 kg',  description: 'Kidneys fully developed.' },
  36: { fruitName: 'Romaine Lettuce', fruitEmoji: '🥬', babyLength: '47 cm',  babyWeight: '2.6 kg',  description: 'Gaining about 30g per day.' },
  37: { fruitName: 'Swiss Chard',     fruitEmoji: '🥬', babyLength: '48 cm',  babyWeight: '2.9 kg',  description: 'Considered early term!' },
  38: { fruitName: 'Leek',            fruitEmoji: '🥬', babyLength: '50 cm',  babyWeight: '3.1 kg',  description: 'Organs are fully mature.' },
  39: { fruitName: 'Watermelon',      fruitEmoji: '🍉', babyLength: '51 cm',  babyWeight: '3.3 kg',  description: 'Full term! Ready any day.' },
  40: { fruitName: 'Pumpkin',         fruitEmoji: '🎃', babyLength: '51 cm',  babyWeight: '3.5 kg',  description: 'Due date week! Welcome, baby!' },
};

/**
 * Get pregnancy week info with fruit comparison.
 */
export function getWeekInfo(week: number): PregnancyWeekInfo {
  const clamped = Math.max(4, Math.min(week, 40));
  const data = WEEK_DATA[clamped] ?? WEEK_DATA[4];
  return { week: clamped, ...data };
}

/**
 * Common pregnancy symptoms for the logger.
 */
export const COMMON_SYMPTOMS = [
  'Nausea',
  'Fatigue',
  'Headache',
  'Back pain',
  'Cramping',
  'Bloating',
  'Mood swings',
  'Heartburn',
  'Insomnia',
  'Swelling',
  'Dizziness',
  'Breast tenderness',
] as const;

/**
 * Common prenatal vitamins for the checklist.
 */
export const PRENATAL_VITAMINS = [
  'Folic Acid',
  'Iron',
  'Calcium',
  'Vitamin D',
  'DHA/Omega-3',
  'Prenatal Multi',
] as const;

/**
 * Dietary preference options for onboarding.
 */
export const DIETARY_PREFERENCES = [
  'Omnivore',
  'Vegetarian',
  'Vegan',
  'Pescatarian',
  'Keto',
  'Gluten-free',
  'Dairy-free',
  'Halal',
  'Kosher',
] as const;

/**
 * Health condition options for onboarding.
 */
export const HEALTH_CONDITIONS = [
  'Gestational diabetes',
  'Preeclampsia',
  'Anemia',
  'Thyroid disorder',
  'High blood pressure',
  'Morning sickness (severe)',
  'None of the above',
] as const;
