type Props = {
  params: Promise<{ guildId: string; channelId: string }>;
};

export default async function ChannelPage({ params }: Props) {
  const { guildId, channelId } = await params;

  return (
    <div className="empty-state">
      <p>
        #{channelId} in guild {guildId}
      </p>
    </div>
  );
}