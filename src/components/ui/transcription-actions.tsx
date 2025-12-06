"use client";

import { useState } from "react";
import { Copy, Download, Check } from "lucide-react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-[var(--secondary)] transition-colors"
      title="Kopiuj do schowka"
    >
      {copied ? (
        <>
          <Check size={16} className="text-green-500" />
          <span className="hidden sm:inline text-green-500">Skopiowano!</span>
        </>
      ) : (
        <>
          <Copy size={16} />
          <span className="hidden sm:inline">Kopiuj</span>
        </>
      )}
    </button>
  );
}

export function DownloadButton({ text, filename }: { text: string; filename: string }) {
  const handleDownload = () => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-[var(--secondary)] transition-colors"
      title="Pobierz jako plik"
    >
      <Download size={16} />
      <span className="hidden sm:inline">Pobierz</span>
    </button>
  );
}
