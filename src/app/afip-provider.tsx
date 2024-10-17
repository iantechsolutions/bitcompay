"use client"
import Afip from '@afipsdk/afip.js';
import React, { createContext, useState, useEffect } from 'react';
import { ingresarAfip } from '~/lib/utils';

interface AFIPContextProps {
  afipObject: Afip | null;
  setAfipObject: (afipLogin: Afip) => void;
  refreshAfipLogin: () => void;
}

const AFIPContext = createContext<AFIPContextProps | undefined>(undefined);

export function AFIPProvider(props: {children: React.ReactNode;})
{
  const [afipObject, setAfipObject] = useState<Afip | null>(null);

  // Function to refresh AFIP login
  const refreshAfipLogin = async () => {
    // Fetch new AFIP login details
    const afip = await ingresarAfip();
    setAfipObject(afip);
  };

  useEffect(() => {
    // On initial load, fetch AFIP login
    refreshAfipLogin();
  }, []);

  return (
    <AFIPContext.Provider value={{ afipObject, setAfipObject, refreshAfipLogin }}>
      {props.children}
    </AFIPContext.Provider>
  );
};

export const useAFIP = () => {
  const context = React.useContext(AFIPContext);
  if (!context) {
    throw new Error('useAFIP must be used within an AFIPProvider');
  }
  return context;
};