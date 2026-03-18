"use client";

import { useState } from "react";

type CreateChannelModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, type: "TEXT" | "VOICE", category: string) => Promise<void>;
};

export function CreateChannelModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateChannelModalProps) {
  const [name, setName] = useState("");
  const [channelType, setChannelType] = useState<"TEXT" | "VOICE">("TEXT");
  const [subType, setSubType] = useState<"DEFAULT" | "ANNOUNCEMENTS" | "FORUMS">("DEFAULT");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Channel name is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const category = channelType === "TEXT" ? "Rooms" : "Calls";
      await onSubmit(name, channelType, category);
      setName("");
      setChannelType("TEXT");
      setSubType("DEFAULT");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create channel");
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
            Create a New Channel
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-3">
                Channel Type
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="channelType"
                    value="TEXT"
                    checked={channelType === "TEXT"}
                    onChange={(e) => setChannelType(e.target.value as "TEXT" | "VOICE")}
                    className="w-4 h-4"
                  />
                  <p className="text-sm font-medium text-text-primary">💬 Text Channel</p>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="channelType"
                    value="VOICE"
                    checked={channelType === "VOICE"}
                    onChange={(e) => setChannelType(e.target.value as "TEXT" | "VOICE")}
                    className="w-4 h-4"
                  />
                  <p className="text-sm font-medium text-text-primary">🎤 Voice Channel</p>
                </label>
              </div>
            </div>

            {/* Text Channel Subtypes */}
            {channelType === "TEXT" && (
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-3">
                  Channel Type
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="subType"
                      value="DEFAULT"
                      checked={subType === "DEFAULT"}
                      onChange={(e) => setSubType(e.target.value as "DEFAULT" | "ANNOUNCEMENTS" | "FORUMS")}
                      className="w-4 h-4"
                    />
                    <p className="text-sm text-text-primary">💬 Chat</p>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="subType"
                      value="ANNOUNCEMENTS"
                      checked={subType === "ANNOUNCEMENTS"}
                      onChange={(e) => setSubType(e.target.value as "DEFAULT" | "ANNOUNCEMENTS" | "FORUMS")}
                      className="w-4 h-4"
                    />
                    <p className="text-sm text-text-primary">📢 Announcements</p>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="subType"
                      value="FORUMS"
                      checked={subType === "FORUMS"}
                      onChange={(e) => setSubType(e.target.value as "DEFAULT" | "ANNOUNCEMENTS" | "FORUMS")}
                      className="w-4 h-4"
                    />
                    <p className="text-sm text-text-primary">💭 Forums</p>
                  </label>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Channel Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={channelType === "TEXT" ? "e.g. general" : "e.g. gaming"}
                className="
                  w-full px-3 py-2 bg-bg-primary border border-border
                  rounded text-text-primary placeholder-text-muted
                  focus:outline-none focus:border-accent
                "
              />
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
                {isLoading ? "Creating..." : "Create Channel"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
