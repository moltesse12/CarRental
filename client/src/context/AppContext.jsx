import React from "react";
import { AppContext } from "./AppContextCreate";
import { useAppContextValue } from "./useAppContextValue";

export { AppContext };

export const AppContextProvider = ({ children }) => {
  const value = useAppContextValue();
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
