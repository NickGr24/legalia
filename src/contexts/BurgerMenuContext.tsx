import React, { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { BackHandler, Platform, Animated } from 'react-native';

interface BurgerMenuContextValue {
  isOpen: boolean;
  progress: Animated.Value;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

const BurgerMenuContext = createContext<BurgerMenuContextValue | undefined>(undefined);

interface BurgerMenuProviderProps {
  children: ReactNode;
}

export const BurgerMenuProvider: React.FC<BurgerMenuProviderProps> = ({ children }) => {
  const progress = useRef(new Animated.Value(0)).current;
  const [isOpen, setIsOpen] = useState(false);
  
  // Update open state when functions are called instead of reading shared value
  const open = () => {
    Animated.spring(progress, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
    setIsOpen(true);
  };

  const close = () => {
    Animated.spring(progress, {
      toValue: 0,
      useNativeDriver: true,
    }).start();
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