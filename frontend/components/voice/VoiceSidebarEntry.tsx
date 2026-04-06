"use client";

import { Avatar } from "@/components/shared/Avatar";
import type { Member } from "@/types";

interface VoiceSidebarEntryProps {
  members: Member[];
}

export function VoiceSidebarEntry({ members }: VoiceSidebarEntryProps) {
  if (members.length === 0) {
    return null;
  }

  return (
    <div className="voice-sidebar-entry">
      {members.slice(0, 5).map((member) => (
        <div key={member.userId} className="voice-sidebar-member">
          <Avatar user={member.user} size="sm" />
          <span className="voice-sidebar-member-name">
            {member.user.displayName}
          </span>
        </div>
      ))}
      {members.length > 5 && (
        <div className="voice-sidebar-more">
          +{members.length - 5} more
        </div>
      )}
    </div>
  );
}
