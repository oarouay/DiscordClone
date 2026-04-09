"use client";

export function ChannelListSkeleton() {
  return (
    <div className="channel-list-skeleton">
      {Array(8)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="skeleton skeleton-channel" />
        ))}
    </div>
  );
}

export function MessageListSkeleton({ count = 5 }) {
  return (
    <div className="message-list-skeleton">
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="skeleton-message-group">
            <div className="skeleton-avatar" />
            <div className="skeleton-message-content">
              <div className="skeleton skeleton-text-header" />
              <div className="skeleton skeleton-text-line" />
              <div className="skeleton skeleton-text-line skeleton-short" />
            </div>
          </div>
        ))}
    </div>
  );
}

export function UserListSkeleton({ count = 6 }) {
  return (
    <div className="user-list-skeleton">
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="skeleton-user-row">
            <div className="skeleton-avatar-sm" />
            <div className="skeleton-user-info">
              <div className="skeleton skeleton-text-name" />
              <div className="skeleton skeleton-text-status" />
            </div>
          </div>
        ))}
    </div>
  );
}

export function VoiceParticipantsSkeleton({ count = 3 }) {
  return (
    <div className="voice-participants-skeleton">
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="skeleton-participant-box" />
        ))}
    </div>
  );
}

export function ThreadListSkeleton({ count = 4 }) {
  return (
    <div className="thread-list-skeleton">
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="skeleton-thread-item">
            <div className="skeleton-avatar-sm" />
            <div className="skeleton-thread-info">
              <div className="skeleton skeleton-text-header" />
              <div className="skeleton skeleton-text-line" />
            </div>
          </div>
        ))}
    </div>
  );
}

export function ServerListSkeleton({ count = 5 }) {
  return (
    <div className="server-list-skeleton">
      {Array(count)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="skeleton skeleton-server-icon" />
        ))}
    </div>
  );
}
