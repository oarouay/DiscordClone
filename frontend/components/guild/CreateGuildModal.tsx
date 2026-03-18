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
        <div className="p-6">
          <h2 className="text-xl font-bold text-text-primary mb-4">
            Create a New Server
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Server Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. My Awesome Server"
                className="
                  w-full px-3 py-2 bg-bg-primary border border-border
                  rounded text-text-primary placeholder-text-muted
                  focus:outline-none focus:border-accent
                "
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-3">
                Server Type
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="guildType"
                    value="HOUSE"
                    checked={guildType === "HOUSE"}
                    onChange={(e) => setGuildType(e.target.value as "HOUSE" | "CRIB")}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      🔒 House (Private)
                    </p>
                    <p className="text-xs text-text-muted">
                      Invite-only community
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="guildType"
                    value="CRIB"
                    checked={guildType === "CRIB"}
                    onChange={(e) => setGuildType(e.target.value as "HOUSE" | "CRIB")}
                    className="w-4 h-4"
                  />
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      🌍 Crib (Public)
                    </p>
                    <p className="text-xs text-text-muted">
                      Community anyone can join
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {error && (
              <div className="bg-danger/20 border border-danger rounded text-danger text-sm p-2">
                {error}
              </div>
            )}

            <div className="flex gap-2 justify-end pt-4">
              <button
                type="button"
                onClick={onClose}
                className="
                  px-4 py-2 rounded font-medium
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
                  px-4 py-2 rounded font-medium
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
