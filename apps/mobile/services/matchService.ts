import api from "./api";
import { Match, Message } from "../types";

interface MessagesResponse {
  messages: Message[];
  hasMore: boolean;
}

export const matchService = {
  getMatches: async (): Promise<Match[]> => {
    const { data } = await api.get<Match[]>("/matches");
    return data;
  },

  getMatch: async (matchId: string): Promise<Match> => {
    const { data } = await api.get<Match>(`/matches/${matchId}`);
    return data;
  },

  getMessages: async (
    matchId: string,
    cursor?: string
  ): Promise<MessagesResponse> => {
    const { data } = await api.get<MessagesResponse>(
      `/matches/${matchId}/messages`,
      { params: { cursor, limit: 30 } }
    );
    return data;
  },

  sendMessage: async (matchId: string, content: string): Promise<Message> => {
    const { data } = await api.post<Message>(`/matches/${matchId}/messages`, {
      content,
    });
    return data;
  },

  markRead: async (matchId: string): Promise<void> => {
    await api.post(`/matches/${matchId}/read`);
  },
};
