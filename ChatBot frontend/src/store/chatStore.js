import { create } from "zustand";

const useChatStore = create((set) => ({
  chats: [],
  activeSessionId: null,

  setChats: (chats) => set({ chats }),

  setActiveSession: (id) => set({ activeSessionId: id }),

  addMessage: (sessionId, message) =>
    set((state) => ({
      chats: state.chats.map((c) =>
        c._id === sessionId
          ? { ...c, messages: [...c.messages, message] }
          : c
      ),
    })),
}));

export default useChatStore;
