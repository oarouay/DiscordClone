import { redirect } from "next/navigation";
import { mockGuilds } from "@/lib/mock";

type Props = {
  params: Promise<{ guildId: string }>;
};

export default async function GuildPage({ params }: Props) {
  const { guildId } = await params;
  
  // Find the guild and get the first channel
  const guild = mockGuilds.find((g) => g.id === guildId);
  const firstChannel = guild?.channels[0];
  
  if (!firstChannel) {
    return <div className="text-text-primary">Guild not found</div>;
  }
  
  redirect(`/guilds/${guildId}/${firstChannel.id}`);
}