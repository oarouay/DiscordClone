import { redirect } from "next/navigation";
import { fetchChannels } from "@/lib/guilds";

type Props = {
  params: Promise<{ guildId: string }>;
};

export default async function GuildPage({ params }: Props) {
  const { guildId } = await params;

  const channels = await fetchChannels(guildId).catch(() => []);
  const firstChannel = channels.find((c) => c.type === "TEXT") ?? channels[0];

  if (!firstChannel) {
    return <div className="text-text-primary">No channels found in this guild</div>;
  }

  redirect(`/guilds/${guildId}/${firstChannel.id}`);
}