
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { StompProvider } from "@/context/StompContext";
import { DMProvider } from "@/context/DMContext";
import { MessagesCacheProvider } from "@/context/MessagesCache";

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
            <DMProvider>
              <MessagesCacheProvider>
                <StompProvider>{children}</StompProvider>
              </MessagesCacheProvider>
            </DMProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}