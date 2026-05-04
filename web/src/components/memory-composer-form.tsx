"use client";

import type { FormEvent } from "react";
import { useRef, useState } from "react";

import { addMemory } from "@/app/actions";
import type { Dictionary } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { MemoryStylePicker } from "@/components/memory-style-options";

type MemoryComposerFormProps = {
  copy: Dictionary["memoryComposer"];
  userID: string;
};

function isFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File && value.size > 0;
}

function isRedirectError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest?: unknown }).digest).startsWith("NEXT_REDIRECT")
  );
}

async function uploadOwnerFile(
  copy: Dictionary["memoryComposer"],
  userID: string,
  scope: string,
  entityID: string,
  file: FormDataEntryValue | null,
) {
  if (!isFile(file)) {
    return null;
  }

  const extension = file.name.split(".").pop() || "bin";
  const path = `${userID}/${scope}/${entityID}/${crypto.randomUUID()}.${extension}`;
  const supabase = createClient();
  const { error } = await supabase.storage.from("petlife-media").upload(path, file, {
    contentType: file.type || undefined,
    upsert: false,
  });

  if (error) {
    throw new Error(`${copy.uploadErrorPrefix}${error.message}`);
  }

  return path;
}

const fieldClass =
  "h-12 w-full min-w-0 rounded-2xl border border-black/10 bg-white px-4 text-base text-black outline-none transition focus:border-[#f06f4f]/60 focus:ring-4 focus:ring-[#f06f4f]/10";

const fileClass =
  "min-h-12 w-full min-w-0 rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm text-black outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-[#201a16] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white focus:border-[#f06f4f]/60 focus:ring-4 focus:ring-[#f06f4f]/10";

export function MemoryComposerForm({ copy, userID }: MemoryComposerFormProps) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (userID === "demo") {
      setError(copy.demoError);
      return;
    }

    const form = formRef.current;

    if (!form) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData(form);
      const memoryID = crypto.randomUUID();
      const photoFile = formData.get("photo");
      const audioFile = formData.get("audio");

      formData.set("memory_id", memoryID);

      const [photoPath, audioPath] = await Promise.all([
        uploadOwnerFile(copy, userID, "memories", memoryID, photoFile),
        uploadOwnerFile(copy, userID, "memories", memoryID, audioFile),
      ]);

      formData.delete("photo");
      formData.delete("audio");

      if (photoPath) {
        formData.set("photo_path", photoPath);
      }

      if (audioPath) {
        formData.set("audio_path", audioPath);
      }

      if (isFile(audioFile)) {
        formData.set("audio_display_name", audioFile.name);
      }

      await addMemory(formData);
    } catch (submitError) {
      if (isRedirectError(submitError)) {
        throw submitError;
      }

      setError(submitError instanceof Error ? submitError.message : copy.saveError);
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <h2 className="text-2xl font-semibold">{copy.title}</h2>
      <form ref={formRef} onSubmit={handleSubmit} className="mt-6 grid gap-4">
        <label className="grid gap-2 text-sm font-medium text-black/70">
          {copy.titleLabel}
          <input className={fieldClass} name="title" required />
        </label>
        <label className="grid gap-2 text-sm font-medium text-black/70">
          {copy.subtitleLabel}
          <input className={fieldClass} name="subtitle" required />
        </label>
        <label className="grid gap-2 text-sm font-medium text-black/70">
          {copy.dateLabel}
          <input className={fieldClass} defaultValue="2026.04.23" name="date_text" required />
        </label>
        <label className="grid gap-2 text-sm font-medium text-black/70">
          {copy.storyLabel}
          <textarea
            className="min-h-28 w-full min-w-0 rounded-2xl border border-black/10 bg-white px-4 py-3 text-base text-black outline-none transition focus:border-[#f06f4f]/60 focus:ring-4 focus:ring-[#f06f4f]/10"
            name="story"
            required
          />
        </label>
        <MemoryStylePicker copy={copy} />
        <label className="grid gap-2 text-sm font-medium text-black/70">
          {copy.photoLabel}
          <input className={fileClass} name="photo" type="file" accept="image/*" />
        </label>
        <label className="grid gap-2 text-sm font-medium text-black/70">
          {copy.audioLabel}
          <input className={fileClass} name="audio" type="file" accept="audio/*" />
        </label>

        {error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-600">
            {error}
          </p>
        ) : null}

        <button
          className="inline-flex h-12 items-center justify-center rounded-full bg-[#f06f4f] px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#df5e3e] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? copy.uploading : copy.submit}
        </button>
      </form>
    </>
  );
}
