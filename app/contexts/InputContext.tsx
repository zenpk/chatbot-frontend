"use client";
import React, { useReducer } from "react";

export type InputActions = {
  type: string;
  text: string;
};

export const InputContext = React.createContext<
  [string, React.Dispatch<InputActions>] | null
>(null);

export function InputContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const defaultValue = "";

  function reducer(state: string, action: InputActions) {
    if (action.type === "edit") {
      return action.text;
    }
    return state;
  }

  const stateAndReducer = useReducer(reducer, defaultValue);

  return (
    <InputContext.Provider value={stateAndReducer}>
      {children}
    </InputContext.Provider>
  );
}
