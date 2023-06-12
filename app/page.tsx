"use client";
import React, { useContext, useEffect, useRef } from "react";
import styles from "./page.module.css";
import { MessageContext } from "@/app/contexts/MessageContext";
import { Bubble } from "@/app/components/Bubble/Bubble";
import { InputBar } from "@/app/components/InputBar/InputBar";
import { InputContextProvider } from "@/app/contexts/InputContext";

export default function Home() {
  const [messages] = useContext(MessageContext)!;

  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    divRef.current!.scrollTop = divRef.current!.scrollHeight;
  }, [messages]);

  return (
    <div className={styles.background}>
      <h1 className={styles.title}>四川方言翻译机器人</h1>
      <div className={styles.card}>
        <div className={styles.textArea} ref={divRef}>
          {messages.map((msg, i) => {
            return <Bubble key={i} {...msg} />;
          })}
        </div>
        <div className={styles.inputBar}>
          <InputContextProvider>
            <InputBar />
          </InputContextProvider>
        </div>
      </div>
    </div>
  );
}
