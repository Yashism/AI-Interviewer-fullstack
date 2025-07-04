import { create } from "zustand";

const useStore = create((set) => ({
  bears: 0,
  

  increasePopulation: () => set((state: any) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
  updateBears: (newBears: any) => set({ bears: newBears }),
}));
