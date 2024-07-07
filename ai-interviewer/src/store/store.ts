import { create } from "zustand";

export interface UserData {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

const useStore = create((set) => ({
  userData: {
    id: "",
    username: "",
    email: "",
    first_name: "",
    last_name: "",
  },

  setUserData: (userData: any) => set({ userData }),
}));
