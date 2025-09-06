import React from "react";

type Props = { message?: string };

const Loading: React.FC<Props> = ({ message = "Please wait" }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.85)]"
    >
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <span className="sr-only">{message}</span>

        <div className="flex items-end gap-2 p-2 rounded-md">
          {/* Three animated bars using Tailwind only */}
          <span className="block w-2.5 h-9 bg-gradient-to-b from-[#ff6b6b] to-[#e50914] rounded-sm shadow-[0_0_12px_rgba(229,9,20,0.45)] origin-bottom animate-bar-1" />
          <span className="block w-2.5 h-9 bg-gradient-to-b from-[#ff6b6b] to-[#e50914] rounded-sm shadow-[0_0_12px_rgba(229,9,20,0.45)] origin-bottom animate-bar-2" />
          <span className="block w-2.5 h-9 bg-gradient-to-b from-[#ff6b6b] to-[#e50914] rounded-sm shadow-[0_0_12px_rgba(229,9,20,0.45)] origin-bottom animate-bar-3" />
        </div>

        <p className="text-white text-sm">{message}…</p>
      </div>
    </div>
  );
};

export default Loading;
