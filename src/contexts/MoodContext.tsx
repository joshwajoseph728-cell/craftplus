import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type CraftMood = 'work' | 'normal';

interface MoodContextType {
  mood: CraftMood;
  setMood: (mood: CraftMood) => void;
  toggleMood: () => void;
}

const MoodContext = createContext<MoodContextType | undefined>(undefined);

const LOCAL_STORAGE_MOOD_KEY = 'craftplus_active_mood';

export const MoodProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mood, setMoodState] = useState<CraftMood>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_MOOD_KEY);
    return saved === 'normal' ? 'normal' : 'work'; // Default to work mode
  });

  const setMood = (newMood: CraftMood) => {
    setMoodState(newMood);
    localStorage.setItem(LOCAL_STORAGE_MOOD_KEY, newMood);
  };

  const toggleMood = () => {
    setMood(mood === 'work' ? 'normal' : 'work');
  };

  return (
    <MoodContext.Provider value={{ mood, setMood, toggleMood }}>
      {children}
    </MoodContext.Provider>
  );
};

export const useMood = (): MoodContextType => {
  const context = useContext(MoodContext);
  if (!context) {
    throw new Error('useMood must be used within a MoodProvider');
  }
  return context;
};
