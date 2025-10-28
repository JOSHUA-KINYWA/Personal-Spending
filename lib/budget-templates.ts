export interface BudgetTemplateCategory {
  name: string;
  icon: string;
  percentage: number;
  description: string;
}

export interface BudgetTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  popular: boolean;
  categories: BudgetTemplateCategory[];
}

export const BUDGET_TEMPLATES: BudgetTemplate[] = [
  {
    id: '50-30-20',
    name: '50/30/20 Rule',
    description: 'The most popular budgeting method: 50% Needs, 30% Wants, 20% Savings & Debt',
    icon: '🎯',
    popular: true,
    categories: [
      {
        name: 'Housing & Utilities',
        icon: '🏠',
        percentage: 30,
        description: 'Rent, mortgage, electricity, water, internet'
      },
      {
        name: 'Food & Groceries',
        icon: '🍔',
        percentage: 12,
        description: 'Groceries, dining out'
      },
      {
        name: 'Transportation',
        icon: '🚗',
        percentage: 8,
        description: 'Gas, car payments, public transport, maintenance'
      },
      {
        name: 'Shopping & Entertainment',
        icon: '🛍️',
        percentage: 15,
        description: 'Clothes, hobbies, movies, subscriptions'
      },
      {
        name: 'Dining Out',
        icon: '🍕',
        percentage: 10,
        description: 'Restaurants, cafes, fast food'
      },
      {
        name: 'Personal Care',
        icon: '💅',
        percentage: 5,
        description: 'Haircuts, gym, beauty products'
      },
      {
        name: 'Savings',
        icon: '💰',
        percentage: 15,
        description: 'Emergency fund, investments'
      },
      {
        name: 'Debt Payment',
        icon: '💳',
        percentage: 5,
        description: 'Credit cards, loans, debt payoff'
      }
    ]
  },
  {
    id: 'zero-based',
    name: 'Zero-Based Budget',
    description: 'Assign every dollar a job. Income minus expenses equals zero.',
    icon: '📊',
    popular: true,
    categories: [
      {
        name: 'Housing',
        icon: '🏠',
        percentage: 25,
        description: 'Rent or mortgage'
      },
      {
        name: 'Utilities',
        icon: '💡',
        percentage: 8,
        description: 'Electric, water, gas, internet'
      },
      {
        name: 'Food',
        icon: '🍔',
        percentage: 15,
        description: 'Groceries and meal planning'
      },
      {
        name: 'Transportation',
        icon: '🚗',
        percentage: 10,
        description: 'Car payment, gas, maintenance'
      },
      {
        name: 'Insurance',
        icon: '🛡️',
        percentage: 10,
        description: 'Health, life, car insurance'
      },
      {
        name: 'Debt Repayment',
        icon: '💳',
        percentage: 10,
        description: 'Credit cards and loans'
      },
      {
        name: 'Savings',
        icon: '💰',
        percentage: 10,
        description: 'Emergency fund and investments'
      },
      {
        name: 'Entertainment',
        icon: '🎬',
        percentage: 7,
        description: 'Fun money and hobbies'
      },
      {
        name: 'Miscellaneous',
        icon: '📌',
        percentage: 5,
        description: 'Everything else'
      }
    ]
  },
  {
    id: 'envelope',
    name: 'Envelope System',
    description: 'Cash-based budgeting. Each category gets a specific amount.',
    icon: '✉️',
    popular: false,
    categories: [
      {
        name: 'Groceries',
        icon: '🛒',
        percentage: 15,
        description: 'Weekly grocery shopping'
      },
      {
        name: 'Dining Out',
        icon: '🍽️',
        percentage: 8,
        description: 'Restaurants and takeout'
      },
      {
        name: 'Entertainment',
        icon: '🎉',
        percentage: 10,
        description: 'Movies, events, hobbies'
      },
      {
        name: 'Clothing',
        icon: '👕',
        percentage: 7,
        description: 'Wardrobe purchases'
      },
      {
        name: 'Personal Care',
        icon: '💇',
        percentage: 5,
        description: 'Haircuts, beauty, gym'
      },
      {
        name: 'Gas/Transportation',
        icon: '⛽',
        percentage: 10,
        description: 'Fuel and transport'
      },
      {
        name: 'Household Items',
        icon: '🧼',
        percentage: 5,
        description: 'Cleaning supplies, toiletries'
      },
      {
        name: 'Fixed Expenses',
        icon: '🏠',
        percentage: 30,
        description: 'Rent, utilities, insurance'
      },
      {
        name: 'Savings',
        icon: '💰',
        percentage: 10,
        description: 'Emergency and goals'
      }
    ]
  },
  {
    id: 'pay-yourself-first',
    name: 'Pay Yourself First',
    description: 'Prioritize savings before expenses. Save 20% minimum.',
    icon: '💎',
    popular: true,
    categories: [
      {
        name: 'Emergency Fund',
        icon: '🚨',
        percentage: 10,
        description: '3-6 months of expenses'
      },
      {
        name: 'Retirement',
        icon: '🏖️',
        percentage: 10,
        description: '401k, IRA contributions'
      },
      {
        name: 'Investments',
        icon: '📈',
        percentage: 5,
        description: 'Stocks, bonds, real estate'
      },
      {
        name: 'Goal Savings',
        icon: '🎯',
        percentage: 5,
        description: 'Vacation, down payment, etc.'
      },
      {
        name: 'Housing',
        icon: '🏠',
        percentage: 25,
        description: 'Rent or mortgage'
      },
      {
        name: 'Food',
        icon: '🍔',
        percentage: 12,
        description: 'Groceries and dining'
      },
      {
        name: 'Transportation',
        icon: '🚗',
        percentage: 10,
        description: 'Car and commute'
      },
      {
        name: 'Utilities',
        icon: '💡',
        percentage: 8,
        description: 'Bills and services'
      },
      {
        name: 'Everything Else',
        icon: '📦',
        percentage: 15,
        description: 'Flexible spending'
      }
    ]
  },
  {
    id: 'balanced',
    name: 'Balanced Budget',
    description: 'A balanced approach covering all life areas equally.',
    icon: '⚖️',
    popular: false,
    categories: [
      {
        name: 'Housing',
        icon: '🏠',
        percentage: 20,
        description: 'Rent, mortgage, property tax'
      },
      {
        name: 'Food',
        icon: '🍔',
        percentage: 15,
        description: 'Groceries and dining'
      },
      {
        name: 'Transportation',
        icon: '🚗',
        percentage: 12,
        description: 'Vehicle costs'
      },
      {
        name: 'Utilities & Bills',
        icon: '💡',
        percentage: 10,
        description: 'Essential services'
      },
      {
        name: 'Health & Fitness',
        icon: '💪',
        percentage: 8,
        description: 'Medical, gym, wellness'
      },
      {
        name: 'Entertainment',
        icon: '🎬',
        percentage: 10,
        description: 'Fun and leisure'
      },
      {
        name: 'Shopping',
        icon: '🛍️',
        percentage: 8,
        description: 'Clothes and goods'
      },
      {
        name: 'Savings & Investments',
        icon: '💰',
        percentage: 12,
        description: 'Future planning'
      },
      {
        name: 'Miscellaneous',
        icon: '📌',
        percentage: 5,
        description: 'Buffer and extras'
      }
    ]
  }
];

export function calculateBudgetFromTemplate(
  template: BudgetTemplate,
  monthlyIncome: number
): Array<{ category: BudgetTemplateCategory; amount: number }> {
  return template.categories.map(category => ({
    category,
    amount: (monthlyIncome * category.percentage) / 100
  }));
}

export function getTemplateById(id: string): BudgetTemplate | undefined {
  return BUDGET_TEMPLATES.find(t => t.id === id);
}

export function getPopularTemplates(): BudgetTemplate[] {
  return BUDGET_TEMPLATES.filter(t => t.popular);
}

