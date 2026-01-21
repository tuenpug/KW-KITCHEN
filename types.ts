
export enum CuisineType {
  CHINESE = 'Chinese',
  WESTERN = 'Western',
  JAPANESE = 'Japanese',
  CAKE = 'Birthday Cake',
  SOUP = 'Soup'
}

export enum CookingMethod {
  PAN_FRY = 'Pan-fry',
  BAKE = 'Bake',
  ROAST = 'Roast',
  STEAM = 'Steam',
  BRAISE = 'Braise',
  STEW = 'Stew',
  BOIL = 'Boil'
}

export enum CookingTime {
  QUICK = 'Quick (< 30m)',
  MEDIUM = 'Standard (30-60m)',
  SLOW = 'Slow (> 60m)'
}

export type Language = 'en' | 'zh';

export interface Ingredient {
  item: string;
  amount: string;
}

export interface RecipeStep {
  text: string;
  imageUrl?: string;
  imagePrompt?: string;
}

export interface Recipe {
  id: string;
  title: string;
  cuisine: CuisineType;
  method?: CookingMethod;
  time?: CookingTime;
  servings: number;
  isFineDining: boolean;
  difficulty: number;
  description: string;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  imageUrl?: string;
  previewPrompt?: string;
  createdAt: number;
  completedAt?: number;
  userPhoto?: string;
  aiReview?: {
    score: number;
    comment: string;
    suggestions: string[];
  };
}

export interface GenerationResult {
  isValid: boolean;
  incompatibilityMessage?: string;
  recipe?: Partial<Recipe>;
}
