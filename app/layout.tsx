import "@/app/styles/globals.css";
import "@/app/styles/vars.css";
import "@/app/styles/animations.css";
import React from "react";
import { MessageContextProvider } from "@/app/contexts/MessageContext";

export const metadata = {
  title: "chatbot-fontend",
  description: "chatbot-frontend",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <MessageContextProvider>
        <body>{children}</body>
      </MessageContextProvider>
    </html>
  );
}
