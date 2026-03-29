import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { VoiceCallLayout } from "@/components/voice/VoiceCallLayout";

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
            <VoiceCallLayout>
              {children}
            </VoiceCallLayout>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}