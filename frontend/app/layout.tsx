import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { StompProvider } from "@/context/StompContext";

export const metadata: Metadata = {
  title: "App",
  description: "Chat app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AuthProvider>
            <StompProvider>{children}</StompProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}