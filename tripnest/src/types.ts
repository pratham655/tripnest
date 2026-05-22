export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  bio?: string;
  homeLocation?: string;
  createdAt: string;
}

export interface CompactWeather {
  temp: number;
  condition: string;
  rainProb: number;
}

export interface SavedDestination {
  id: string;
  destinationName: string;
  country: string;
  imageUrl: string;
  estimatedBudget: number;
  weatherSummary: CompactWeather;
  isVisited: boolean;
  notes?: string;
  createdAt: string;
}

export interface ActivityItem {
  time: string;
  activity: string;
  cost?: number;
  location?: string;
  description?: string;
}

export interface DayItinerary {
  dayNumber: number;
  theme: string;
  activities: ActivityItem[];
  suggestedRestaurants: Array<{ name: string; cuisine: string; priceRange: string }>;
}

export interface Itinerary {
  id: string;
  title: string;
  startingLocation: string;
  destination: string;
  numberOfDays: number;
  numberOfTravelers: number;
  budgetCategory: 'budget' | 'moderate' | 'luxury';
  interests: string[];
  dayWiseItinerary: DayItinerary[];
  estimatedExpenses: {
    transportation: number;
    accommodation: number;
    food: number;
    attractions: number;
    miscellaneous: number;
    total: number;
  };
  travelTips: string[];
  createdAt: string;
}

export interface DestinationDetail {
  id: string;
  name: string;
  country: string;
  imageUrl: string;
  description: string;
  bestTimeToVisit: string;
  topAttractions: string[];
  averageTripCost: {
    budget: number;
    moderate: number;
    luxury: number;
  };
  localFood: string[];
  popularActivities: string[];
  tags: string[]; // beaches, mountains, adventure, nature, historical, budget-friendly, luxury, family-friendly
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface WeatherForecastDay {
  day: string;
  temp: number;
  condition: string;
  rainProb: number;
  description: string;
}

export interface WeatherDetails {
  currentTemp: number;
  condition: string; // Sunny, Rainy, Snowing, Cloudy, etc.
  rainProbability: number;
  weeklyForecast: WeatherForecastDay[];
  travelRecommendation: string;
}

export interface SearchStats {
  totalTripsPlanned: number;
  totalSavedDestinations: number;
  visitedCount: number;
  totalEstimatedBudget: number;
}
