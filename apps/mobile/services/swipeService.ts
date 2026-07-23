import api from "./api";
import { SwipeAction, Match } from "../types";

interface SwipePayload {
  targetUserId: string;
  action: SwipeAction;
}

interface SwipeResponse {
  match: Match | null;
  isMatch: boolean;
}

export const swipeService = {
  swipe: async (payload: SwipePayload): Promise<SwipeResponse> => {
    const { data } = await api.post<SwipeResponse>("/swipes", payload);
    return data;
  },
};
