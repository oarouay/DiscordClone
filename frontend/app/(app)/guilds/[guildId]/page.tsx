import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ guildId: string }>;
};

export default async function GuildPage({ params }: Props) {
  const { guildId } = await params;
  redirect(`/guilds/${guildId}/channels/general`);
}