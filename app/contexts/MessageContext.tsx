"use client";
import React from "react";

export type Message = {
  msg: string;
  isUser: boolean;
};

export type MessageActions = { type: string; msg: string };

export const MessageContext = React.createContext<
  [Message[], React.Dispatch<MessageActions>] | null
>(null);

export function MessageContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const defaultValue: Message[] = [
    {
      msg: "您好，我是四川方言翻译机器人，请输入四川话文字或语音，我将回答翻译结果",
      isUser: false,
    },
  ];

  function reducer(state: Message[], action: MessageActions) {
    if (action.type === "addUser") {
      const message: Message = {
        msg: action.msg,
        isUser: true,
      };
      return [...state, message];
    }
    if (action.type === "addBot") {
      const message: Message = {
        msg: action.msg,
        isUser: false,
      };
      return [...state, message];
    }
    if (action.type === "edit") {
      const last = state[state.length - 1];
      last.msg = action.msg;
      state.pop();
      return [...state, last];
    }
    return state;
  }

  const stateAndReducer = React.useReducer(reducer, defaultValue);

  return (
    <MessageContext.Provider value={stateAndReducer}>
      {children}
    </MessageContext.Provider>
  );
}
