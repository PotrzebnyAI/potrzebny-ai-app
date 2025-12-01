"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Upload, FileAudio, X, Loader2, Cloud, CheckCircle } from "lucide-react";

export default function MaterialsPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && isAudioFile(droppedFile)) {
      setFile(droppedFile);
      if (!title) {
        setTitle(droppedFile.name.replace(/\.[^/.]+$/, ""));
      }
    } else {
      setError("Proszę wgrać plik audio (MP3, WAV, M4A, OGG)");
    }
  }, [title]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && isAudioFile(selectedFile)) {
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
      }
      setError(null);
    } else {
      setError("Proszę wgrać plik audio (MP3, WAV, M4A, OGG)");
    }
  };

  const isAudioFile = (file: File) => {
    const audioTypes = ["audio/mpeg", "audio/wav", "audio/mp4", "audio/ogg", "audio/x-m4a"];
    return audioTypes.includes(file.type) || /\.(mp3|wav|m4a|ogg)$/i.test(file.name);
  };

  const handleUpload = async () => {
    if (!file || !title) {
      setError("Proszę wybrać plik i podać tytuł");
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nie jesteś zalogowany");

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      setUploadProgress(20);

      const { error: uploadError } = await supabase.storage
        .from("audio")
        .upload(fileName, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      setUploadProgress(60);

      const { data: { publicUrl } } = supabase.storage.from("audio").getPublicUrl(fileName);

      const { data: material, error: materialError } = await supabase
        .from("materials")
        .insert({
          teacher_id: user.id,
          title,
          description: description || null,
          audio_url: publicUrl,
          status: "pending",
        })
        .select()
        .single();

      if (materialError) throw materialError;

      setUploadProgress(80);

      fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialId: material.id }),
      });

      setUploadProgress(100);
      setSuccess(true);

      setTimeout(() => {
        router.push(`/dashboard/materials/${material.id}`);
      }, 1500);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Wystąpił błąd podczas wgrywania");
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-[var(--background)] rounded-xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">Materiał został wgrany!</h2>
          <p className="text-[var(--muted-foreground)]">
            AI rozpoczyna przetwarzanie. Za chwilę zostaniesz przekierowany...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Dodaj materiał</h1>
        <p className="text-[var(--muted-foreground)]">
          Wgraj nagranie wykładu, a AI automatycznie je przetworzy
        </p>
      </div>

      <div className="bg-[var(--background)] rounded-xl p-6 shadow-sm space-y-6">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            isDragging
              ? "border-[var(--primary)] bg-[var(--primary)]/5"
              : "border-[var(--border)] hover:border-[var(--primary)]/50"
          }`}
        >
          {file ? (
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
                <FileAudio size={24} />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-sm text-[var(--muted-foreground)]">{formatFileSize(file.size)}</p>
              </div>
              <button onClick={() => setFile(null)} className="p-2 hover:bg-[var(--secondary)] rounded-lg">
                <X size={20} />
              </button>
            </div>
          ) : (
            <>
              <Upload size={48} className="mx-auto text-[var(--muted-foreground)] mb-4" />
              <p className="font-medium mb-2">Przeciągnij plik audio tutaj</p>
              <p className="text-sm text-[var(--muted-foreground)] mb-4">lub</p>
              <label>
                <input type="file" accept="audio/*,.mp3,.wav,.m4a,.ogg" onChange={handleFileSelect} className="hidden" />
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--secondary)] hover:bg-[var(--secondary)]/80 cursor-pointer">
                  Wybierz plik
                </span>
              </label>
              <p className="text-xs text-[var(--muted-foreground)] mt-4">MP3, WAV, M4A, OGG (max 500MB)</p>
            </>
          )}
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border)]"></div></div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[var(--background)] text-[var(--muted-foreground)]">lub</span>
          </div>
        </div>

        <button disabled className="w-full flex items-center justify-center gap-3 p-4 rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] opacity-50 cursor-not-allowed">
          <Cloud size={24} />
          <span>Połącz z Google Drive</span>
          <span className="text-xs bg-[var(--secondary)] px-2 py-1 rounded">Wkrótce</span>
        </button>

        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">Tytuł materiału *</label>
            <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="np. Wykład 1 - Wprowadzenie"
              className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">Opis (opcjonalnie)</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Krótki opis materiału..." rows={3}
              className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-none" />
          </div>
        </div>

        {error && <div className="p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">{error}</div>}

        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm"><span>Wgrywanie...</span><span>{uploadProgress}%</span></div>
            <div className="h-2 bg-[var(--secondary)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--primary)] transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        )}

        <Button onClick={handleUpload} disabled={!file || !title || uploading} className="w-full" size="lg">
          {uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Wgrywanie...</> : <><Upload className="mr-2 h-4 w-4" />Wgraj i przetwórz</>}
        </Button>
      </div>
    </div>
  );
}
