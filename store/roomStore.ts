import { create } from 'zustand';

interface RoomState {
  speaking: Record<string, boolean>;
  setSpeaking: (peerId: string, state: boolean) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  speaking: {},
  setSpeaking: (peerId, state) => set((s) => ({ speaking: { ...s.speaking, [peerId]: state } })),
}));


