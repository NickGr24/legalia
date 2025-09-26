import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { BackHandler, Platform } from 'react-native';
import { useSharedValue, withSpring, SharedValue } from 'react-native-reanimated';

interface BurgerMenuContextValue {
  isOpen: boolean;
  progress: SharedValue<number>;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const BurgerMenuContext = createContext<BurgerMenuContextValue | undefined>(undefined);

interface BurgerMenuProviderProps {
  children: ReactNode;
}

const springConfig = {
  damping: 18,
  stiffness: 180,
};

export const BurgerMenuProvider: React.FC<BurgerMenuProviderProps> = ({ children }) => {
  const progress = useSharedValue(0);
  const [isOpen, setIsOpen] = useState(false);
  
  // Update open state when functions are called instead of reading shared value
  const open = () => {
    progress.value = withSpring(1, springConfig);
    setIsOpen(true);
  };

  const close = () => {
    progress.value = withSpring(0, springConfig);
    setIsOpen(false);
  };

  const toggle = () => {
    if (isOpen) {
      close();
    } else {
      open();
    }
  };

  // Handle Android back button
  useEffect(() => {
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        if (isOpen) {
          close();
          return true; // Prevent default behavior
        }
        return false; // Let default behavior handle it
      });

      return () => backHandler.remove();
    }
  }, [isOpen, close]);

  const value: BurgerMenuContextValue = {
    isOpen,
    progress,
    open,
    close,
    toggle,
  };

  return (
    <BurgerMenuContext.Provider value={value}>
      {children}
    </BurgerMenuContext.Provider>
  );
};

export const useBurgerMenu = (): BurgerMenuContextValue => {
  const context = useContext(BurgerMenuContext);
  if (!context) {
    throw new Error('useBurgerMenu must be used within a BurgerMenuProvider');
  }
  return context;
};