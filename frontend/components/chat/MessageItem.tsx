import type { Message } from "@/types";
import { Avatar } from "@/components/shared/Avatar";

interface MessageItemProps {
  message: Message;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString();
}

export default function MessageItem({ message }: MessageItemProps) {
  const timestamp = new Date(message.createdAt);
  const timeAgo = formatTimeAgo(timestamp);

  return (
    <div className="group flex gap-4 px-6 py-4 hover:bg-bg-hover transition-colors">
      <Avatar user={message.author} size="lg" />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-3 mb-2">
          <h3 className="font-semibold text-text-primary text-base">{message.author.displayName}</h3>
          <span className="text-text-muted text-sm group-hover:text-text-secondary">{timeAgo}</span>
        </div>
        <p className="text-text-secondary break-words text-base leading-relaxed">{message.content}</p>
      </div>
    </div>
  );
}
