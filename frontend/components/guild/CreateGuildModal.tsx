"use client";

import { useState } from "react";

type CreateGuildModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, type: "HOUSE" | "CRIB") => Promise<void>;
};

export function CreateGuildModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateGuildModalProps) {
  const [name, setName] = useState("");
  const [guildType, setGuildType] = useState<"HOUSE" | "CRIB">("HOUSE");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Guild name is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await onSubmit(name, guildType);
      setName("");
      setGuildType("HOUSE");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create guild");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-bg-floating rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="p-8">
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            Create a New Server
          </h2>
          <p className="text-text-muted text-sm mb-8">
            Start a new House (private) or Crib (public) community
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">
                Server Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. My Awesome Server"
                className="
                  w-full px-4 py-3 bg-bg-primary border border-border
                  rounded-lg text-text-primary placeholder-text-muted text-base
                  focus:outline-none focus:border-accent
                "
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-4 uppercase tracking-wide">
                Server Type
              </label>
              <div className="space-y-3">
                <label className="flex items-start gap-4 cursor-pointer p-4 rounded-lg hover:bg-bg-primary/50 transition-colors">
                  <input
                    type="radio"
                    name="guildType"
                    value="HOUSE"
                    checked={guildType === "HOUSE"}
                    onChange={(e) => setGuildType(e.target.value as "HOUSE" | "CRIB")}
                    className="w-5 h-5 mt-0.5"
                  />
                  <div>
                    <p className="text-base font-semibold text-text-primary">
                      🔒 House (Private)
                    </p>
                    <p className="text-sm text-text-muted mt-1">
                      Invite-only community for close friends
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-4 cursor-pointer p-4 rounded-lg hover:bg-bg-primary/50 transition-colors">
                  <input
                    type="radio"
                    name="guildType"
                    value="CRIB"
                    checked={guildType === "CRIB"}
                    onChange={(e) => setGuildType(e.target.value as "HOUSE" | "CRIB")}
                    className="w-5 h-5 mt-0.5"
                  />
                  <div>
                    <p className="text-base font-semibold text-text-primary">
                      🌍 Crib (Public)
                    </p>
                    <p className="text-sm text-text-muted mt-1">
                      Community anyone can join and discover
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {error && (
              <div className="bg-danger/20 border border-danger rounded-lg text-danger text-sm p-4">
                {error}
              </div>
            )}

            <div className="flex gap-3 justify-end pt-6 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="
                  px-6 py-3 rounded-lg font-semibold text-base
                  bg-bg-secondary hover:bg-bg-primary text-text-primary
                  transition-colors
                "
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="
                  px-6 py-3 rounded-lg font-semibold text-base
                  bg-accent hover:bg-accent-hover text-white
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors
                "
              >
                {isLoading ? "Creating..." : "Create Server"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
