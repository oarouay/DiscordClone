"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { mockInvite } from "@/lib/mock";
import { Button } from "@/components/ui/button";
import type { Invite } from "@/types";

type Props = {
  guildId: string;
  guildName: string;
  onClose: () => void;
};

export function InviteModal({ guildId, guildName, onClose }: Props) {
  const [invite, setInvite] = useState<Invite | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    setIsLoading(true);
    setError("");

    try {
      // TODO: replace with API call to POST /guilds/:guildId/invites
      const data = { ...mockInvite, guildId };
      setInvite(data);
    } catch {
      setError("Failed to generate invite link.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCopy() {
    if (!invite) return;
    const url = `${window.location.origin}/invite/${invite.code}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function formatExpiry(isoString: string): string {
    const diff = new Date(isoString).getTime() - Date.now();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `Expires in ${hours}h ${minutes}m`;
    if (minutes > 0) return `Expires in ${minutes}m`;
    return "Expired";
  }

  const inviteUrl = invite ? `${typeof window !== "undefined" ? window.location.origin : ""}/invite/${invite.code}` : "";

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="invite-modal-title">
        <div className="modal-header">
          <h2 className="modal-title" id="invite-modal-title">Invite people to {guildName}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close invite modal">✕</button>
        </div>

        <div className="modal-body">
          {!invite ? (
            <>
              <p className="invite-description">
                Generate a link to share with friends. The link expires after 24 hours.
              </p>
              <Button
                onClick={handleGenerate}
                disabled={isLoading}
                className="invite-generate-btn"
                aria-label={isLoading ? "Generating invite link..." : "Generate invite link"}
              >
                {isLoading ? "Generating…" : "Generate Invite Link"}
              </Button>
              {error && <p className="auth-error" role="alert">{error}</p>}
            </>
          ) : (
            <>
              <p className="invite-description">
                Share this link with anyone you want to invite.
              </p>
              <div className="invite-link-row">
                <div className="invite-link-box" role="textbox" aria-readonly="true">
                  {inviteUrl}
                </div>
                <Button
                  onClick={handleCopy}
                  className={`invite-copy-btn ${copied ? "invite-copy-btn-success" : ""}`}
                  aria-label={copied ? "Invite link copied to clipboard" : "Copy invite link"}
                >
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
              <p className="invite-expiry" aria-live="polite">{formatExpiry(invite.expiresAt)}</p>
              <button className="invite-regenerate" onClick={() => setInvite(null)} aria-label="Generate a new invite link">
                Generate a new link
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}