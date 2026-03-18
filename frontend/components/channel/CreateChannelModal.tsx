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
        <div className="p-8">
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            Create a New Channel
          </h2>
          <p className="text-text-muted text-sm mb-8">
            Add a new text or voice channel to your server
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-4 uppercase tracking-wide">
                Channel Type
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-4 cursor-pointer p-3 rounded-lg hover:bg-bg-primary/50 transition-colors">
                  <input
                    type="radio"
                    name="channelType"
                    value="TEXT"
                    checked={channelType === "TEXT"}
                    onChange={(e) => setChannelType(e.target.value as "TEXT" | "VOICE")}
                    className="w-5 h-5"
                  />
                  <p className="text-base font-medium text-text-primary">💬 Text Channel</p>
                </label>

                <label className="flex items-center gap-4 cursor-pointer p-3 rounded-lg hover:bg-bg-primary/50 transition-colors">
                  <input
                    type="radio"
                    name="channelType"
                    value="VOICE"
                    checked={channelType === "VOICE"}
                    onChange={(e) => setChannelType(e.target.value as "TEXT" | "VOICE")}
                    className="w-5 h-5"
                  />
                  <p className="text-base font-medium text-text-primary">🎤 Voice Channel</p>
                </label>
              </div>
            </div>

            {/* Text Channel Subtypes */}
            {channelType === "TEXT" && (
              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-4 uppercase tracking-wide">
                  Channel Subtype
                </label>
                <div className="space-y-3">
                  <label className="flex items-center gap-4 cursor-pointer p-3 rounded-lg hover:bg-bg-primary/50 transition-colors">
                    <input
                      type="radio"
                      name="subType"
                      value="DEFAULT"
                      checked={subType === "DEFAULT"}
                      onChange={(e) => setSubType(e.target.value as "DEFAULT" | "ANNOUNCEMENTS" | "FORUMS")}
                      className="w-5 h-5"
                    />
                    <p className="text-base font-medium text-text-primary">💬 Chat</p>
                  </label>

                  <label className="flex items-center gap-4 cursor-pointer p-3 rounded-lg hover:bg-bg-primary/50 transition-colors">
                    <input
                      type="radio"
                      name="subType"
                      value="ANNOUNCEMENTS"
                      checked={subType === "ANNOUNCEMENTS"}
                      onChange={(e) => setSubType(e.target.value as "DEFAULT" | "ANNOUNCEMENTS" | "FORUMS")}
                      className="w-5 h-5"
                    />
                    <p className="text-base font-medium text-text-primary">📢 Announcements</p>
                  </label>

                  <label className="flex items-center gap-4 cursor-pointer p-3 rounded-lg hover:bg-bg-primary/50 transition-colors">
                    <input
                      type="radio"
                      name="subType"
                      value="FORUMS"
                      checked={subType === "FORUMS"}
                      onChange={(e) => setSubType(e.target.value as "DEFAULT" | "ANNOUNCEMENTS" | "FORUMS")}
                      className="w-5 h-5"
                    />
                    <p className="text-base font-medium text-text-primary">💭 Forums</p>
                  </label>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">
                Channel Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={channelType === "TEXT" ? "e.g. general" : "e.g. gaming"}
                className="
                  w-full px-4 py-3 bg-bg-primary border border-border
                  rounded-lg text-text-primary placeholder-text-muted text-base
                  focus:outline-none focus:border-accent
                "
              />
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
                {isLoading ? "Creating..." : "Create Channel"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
