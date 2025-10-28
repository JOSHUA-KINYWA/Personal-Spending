// Available icons and colors for categories

export const CATEGORY_ICONS = [
  // Food & Dining
  '🍔', '🍕', '🍜', '🍱', '🍣', '🍰', '☕', '🍷',
  
  // Shopping & Retail
  '🛍️', '👕', '👗', '👠', '💄', '🎁', '📱', '💻',
  
  // Transportation
  '🚗', '🚕', '🚌', '🚇', '✈️', '🚲', '⛽', '🚦',
  
  // Home & Utilities
  '🏠', '💡', '🔌', '🚰', '📡', '🔧', '🛠️', '🪑',
  
  // Entertainment
  '🎬', '🎮', '🎵', '🎸', '📚', '🎨', '🏀', '⚽',
  
  // Health & Fitness
  '💊', '🏥', '💪', '🏃', '🧘', '🏋️', '🩺', '❤️',
  
  // Finance
  '💰', '💳', '💵', '💸', '📈', '📊', '🏦', '💎',
  
  // Work & Business
  '💼', '📁', '📝', '✉️', '📞', '🖥️', '⌨️', '🖨️',
  
  // Education
  '📚', '✏️', '📓', '🎓', '🏫', '📖', '🧮', '🔬',
  
  // Travel & Vacation
  '🌍', '🗺️', '🏖️', '⛱️', '🎒', '📸', '🏨', '🗼',
  
  // Personal Care
  '💇', '💅', '🧴', '🪒', '🧼', '🧻', '🪥', '👓',
  
  // Pets
  '🐶', '🐱', '🐠', '🐦', '🐹', '🐾', '🦴', '🎾',
  
  // Family & Kids
  '👨‍👩‍👧‍👦', '👶', '🧸', '🍼', '🎈', '🎪', '🎡', '🎢',
  
  // Insurance & Protection
  '🛡️', '🔒', '🔐', '⚖️', '📋', '📄', '📜', '🏛️',
  
  // Miscellaneous
  '⭐', '🎯', '🔔', '⏰', '📌', '🔍', '💭', '❓',
];

export const CATEGORY_COLORS = [
  { name: 'Red', value: '#EF4444', bg: 'bg-red-500', text: 'text-red-500', light: 'bg-red-100' },
  { name: 'Orange', value: '#F97316', bg: 'bg-orange-500', text: 'text-orange-500', light: 'bg-orange-100' },
  { name: 'Amber', value: '#F59E0B', bg: 'bg-amber-500', text: 'text-amber-500', light: 'bg-amber-100' },
  { name: 'Yellow', value: '#EAB308', bg: 'bg-yellow-500', text: 'text-yellow-500', light: 'bg-yellow-100' },
  { name: 'Lime', value: '#84CC16', bg: 'bg-lime-500', text: 'text-lime-500', light: 'bg-lime-100' },
  { name: 'Green', value: '#22C55E', bg: 'bg-green-500', text: 'text-green-500', light: 'bg-green-100' },
  { name: 'Emerald', value: '#10B981', bg: 'bg-emerald-500', text: 'text-emerald-500', light: 'bg-emerald-100' },
  { name: 'Teal', value: '#14B8A6', bg: 'bg-teal-500', text: 'text-teal-500', light: 'bg-teal-100' },
  { name: 'Cyan', value: '#06B6D4', bg: 'bg-cyan-500', text: 'text-cyan-500', light: 'bg-cyan-100' },
  { name: 'Sky', value: '#0EA5E9', bg: 'bg-sky-500', text: 'text-sky-500', light: 'bg-sky-100' },
  { name: 'Blue', value: '#3B82F6', bg: 'bg-blue-500', text: 'text-blue-500', light: 'bg-blue-100' },
  { name: 'Indigo', value: '#6366F1', bg: 'bg-indigo-500', text: 'text-indigo-500', light: 'bg-indigo-100' },
  { name: 'Violet', value: '#8B5CF6', bg: 'bg-violet-500', text: 'text-violet-500', light: 'bg-violet-100' },
  { name: 'Purple', value: '#A855F7', bg: 'bg-purple-500', text: 'text-purple-500', light: 'bg-purple-100' },
  { name: 'Fuchsia', value: '#D946EF', bg: 'bg-fuchsia-500', text: 'text-fuchsia-500', light: 'bg-fuchsia-100' },
  { name: 'Pink', value: '#EC4899', bg: 'bg-pink-500', text: 'text-pink-500', light: 'bg-pink-100' },
  { name: 'Rose', value: '#F43F5E', bg: 'bg-rose-500', text: 'text-rose-500', light: 'bg-rose-100' },
  { name: 'Gray', value: '#6B7280', bg: 'bg-gray-500', text: 'text-gray-500', light: 'bg-gray-100' },
];

export function getColorClasses(colorValue: string) {
  const color = CATEGORY_COLORS.find(c => c.value === colorValue);
  return color || CATEGORY_COLORS[0];
}

