import create from 'zustand';

const userStore = create((set) => ({
    username:'',
  changeUsername: (newUsername) => set({username:newUsername }),
}));

export default userStore;