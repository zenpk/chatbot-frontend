"use client";
import React, { useContext } from "react";
import styles from "./page.module.css";
import { MessageContext } from "@/app/contexts/MessageContext";
import { Bubble } from "@/app/components/Bubble/Bubble";

export default function Home() {
  const messages = useContext(MessageContext);
  console.log(messages);
  return (
    <div className={styles.background}>
      <h1 className={styles.title}>四川方言翻译机器人</h1>
      <div className={styles.card}>
        {messages?.map((msg, i) => {
          return <Bubble key={i} {...msg} />;
        })}
      </div>
    </div>
  );
}
