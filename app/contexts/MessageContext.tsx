"use client";
import React from "react";

export type Message = {
  msg: string;
  isUser: boolean;
};

export type MessageActions = { type: string; message: Message };

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
    { msg: "fuck you", isUser: true },
    {
      msg: "您好，我是四川方言翻译机器人，请输入四川话文字或语音，我将回答翻译结果",
      isUser: false,
    },
    { msg: "fuck you", isUser: true },
    {
      msg: "您好，我是四川方言翻译机器人，请输入四川话文字或语音，我将回答翻译结果",
      isUser: false,
    },
    { msg: "fuck you", isUser: true },
    {
      msg: "您好，我是四川方言翻译机器人，请输入四川话文字或语音，我将回答翻译结果",
      isUser: false,
    },
    { msg: "fuck you", isUser: true },
  ];

  function reducer(state: Message[], action: MessageActions) {
    if (action.type === "add") {
      return [...state, action.message];
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
