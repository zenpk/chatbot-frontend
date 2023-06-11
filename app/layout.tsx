import "@/app/styles/globals.css";
import "@/app/styles/vars.css";
import "@/app/styles/utils.css";
import "@/app/styles/animations.css";
import React from "react";

export const metadata = {
  title: "basic",
  description: "basic next.js scaffold",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
