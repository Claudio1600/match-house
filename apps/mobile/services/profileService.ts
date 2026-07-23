import api from "./api";
import { LandlordProfile, SeekerProfile } from "../types";

// ---- Landlord ----

export interface CreateLandlordProfilePayload {
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
}

// ---- Seeker ----

export interface CreateSeekerProfilePayload {
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
}

export const profileService = {
  // ---- Landlord ----
  getLandlordProfile: async (): Promise<LandlordProfile> => {
    const { data } = await api.get<LandlordProfile>("/profiles/landlord/me");
    return data;
  },

  createLandlordProfile: async (
    payload: CreateLandlordProfilePayload
  ): Promise<LandlordProfile> => {
    const { data } = await api.post<LandlordProfile>(
      "/profiles/landlord",
      payload
    );
    return data;
  },

  updateLandlordProfile: async (
    payload: Partial<CreateLandlordProfilePayload>
  ): Promise<LandlordProfile> => {
    const { data } = await api.patch<LandlordProfile>(
      "/profiles/landlord/me",
      payload
    );
    return data;
  },

  uploadLandlordPhoto: async (formData: FormData): Promise<LandlordProfile> => {
    const { data } = await api.post<LandlordProfile>(
      "/profiles/landlord/photos",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  },

  deleteLandlordPhoto: async (photoId: string): Promise<void> => {
    await api.delete(`/profiles/landlord/photos/${photoId}`);
  },

  // ---- Seeker ----
  getSeekerProfile: async (): Promise<SeekerProfile> => {
    const { data } = await api.get<SeekerProfile>("/profiles/seeker/me");
    return data;
  },

  createSeekerProfile: async (
    payload: CreateSeekerProfilePayload
  ): Promise<SeekerProfile> => {
    const { data } = await api.post<SeekerProfile>("/profiles/seeker", payload);
    return data;
  },

  updateSeekerProfile: async (
    payload: Partial<CreateSeekerProfilePayload>
  ): Promise<SeekerProfile> => {
    const { data } = await api.patch<SeekerProfile>(
      "/profiles/seeker/me",
      payload
    );
    return data;
  },

  uploadSeekerPhoto: async (formData: FormData): Promise<SeekerProfile> => {
    const { data } = await api.post<SeekerProfile>(
      "/profiles/seeker/photos",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  },

  deleteSeekerPhoto: async (photoId: string): Promise<void> => {
    await api.delete(`/profiles/seeker/photos/${photoId}`);
  },

  // ---- Public ----
  getLandlordProfileById: async (id: string): Promise<LandlordProfile> => {
    const { data } = await api.get<LandlordProfile>(`/profiles/landlord/${id}`);
    return data;
  },

  getSeekerProfileById: async (id: string): Promise<SeekerProfile> => {
    const { data } = await api.get<SeekerProfile>(`/profiles/seeker/${id}`);
    return data;
  },
};
