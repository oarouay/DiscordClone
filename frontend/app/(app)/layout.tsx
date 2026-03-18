import { GuildSidebar } from "@/components/guild/GuildSidebar";
import { ChannelSidebar } from "@/components/channel/ChannelSidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-shell">
      <GuildSidebar />
      <ChannelSidebar />
      <main className="app-main">{children}</main>
    </div>
  );
}