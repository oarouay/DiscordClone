"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchChannels } from "@/lib/guilds";

export default function GuildPage() {
  const params = useParams();
  const router = useRouter();
  const guildId = params?.guildId as string;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!guildId) return;
    fetchChannels(guildId)
      .then((channels) => {
        const firstChannel = channels.find((c) => c.type === "TEXT") ?? channels[0];
        if (firstChannel) {
          router.replace(`/guilds/${guildId}/${firstChannel.id}`);
        } else {
          router.replace(`/guilds/${guildId}/settings`);
        }
      })
      .catch(() => router.replace(`/guilds/${guildId}/settings`))
      .finally(() => setLoading(false));
  }, [guildId, router]);

  if (loading) {
    return (
      <div className="empty-state">
        <span style={{ color: "var(--text-muted)" }}>Loading...</span>
      </div>
    );
  }

  return null;
}