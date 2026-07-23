import api from "./api";
import { LandlordProfile, SeekerProfile } from "../types";

export interface DiscoverResponse {
  profiles: (LandlordProfile | SeekerProfile)[];
  hasMore: boolean;
}

export const discoverService = {
  getProfiles: async (page = 0): Promise<DiscoverResponse> => {
    const { data } = await api.get<DiscoverResponse>("/discover", {
      params: { page, limit: 10 },
    });
    return data;
  },
};
