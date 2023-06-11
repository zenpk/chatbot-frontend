"use client";
import React from "react";

export type Message = {
  msg: string;
  isUser: boolean;
};

export const MessageContext = React.createContext<Message[] | null>(null);

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
  ];
  return (
    <MessageContext.Provider value={defaultValue}>
      {children}
    </MessageContext.Provider>
  );
}
