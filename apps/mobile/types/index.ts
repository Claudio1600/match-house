export type UserType = "LANDLORD" | "SEEKER";
export type SwipeAction = "SMASH" | "PASS";

export interface User {
  id: string;
  email: string;
  userType: UserType;
  isVerified: boolean;
}

export interface LandlordProfile {
  id: string;
  userId: string;
  title: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  rent: number;
  totalRooms: number;
  availableRooms: number;
  currentTenants: number;
  squareMeters?: number;
  floor?: number;
  furnished: boolean;
  billsIncluded: boolean;
  petsAllowed: boolean;
  smokingAllowed: boolean;
  wifiIncluded: boolean;
  parkingAvailable: boolean;
  availableFrom: string;
  description: string;
  houseRules?: string;
  neighborhoodInfo?: string;
  photos: PropertyPhoto[];
}

export interface PropertyPhoto {
  id: string;
  url: string;
  order: number;
  isMain: boolean;
}

export interface SeekerProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  age: number;
  bio: string;
  occupation: string;
  university?: string;
  company?: string;
  smoker: boolean;
  hasPets: boolean;
  schedule?: string;
  cleanliness: number;
  noiseLevel: number;
  budgetMin?: number;
  budgetMax?: number;
  preferredCity?: string;
  moveInDate?: string;
  hobbies: string[];
  sports: string[];
  languages: string[];
  photos: SeekerPhoto[];
}

export interface SeekerPhoto {
  id: string;
  url: string;
  order: number;
  isMain: boolean;
}

export interface Match {
  id: string;
  userAId: string;
  userBId: string;
  createdAt: string;
  otherUser?: User;
  otherProfile?: LandlordProfile | SeekerProfile;
  lastMessage?: Message;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
