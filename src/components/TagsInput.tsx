import { useCallback, useMemo, useRef, useState } from "react";
import clsx from "classnames";

type TagsInputProps = {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  /** Tillåt mellanslag att skapa tagg (default: true) */
  spaceAsSeparator?: boolean;
};

export default function TagsInput({
  value,
  onChange,
  placeholder = "Skriv tagg…",
  label,
  className,
  spaceAsSeparator = true,
}: TagsInputProps) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const normalized = useMemo(
    () => value.map((t) => t.trim()).filter(Boolean),
    [value]
  );

  const add = useCallback(
    (raw?: string) => {
      const text = (raw ?? draft).trim();
      if (!text) return;
      const parts = text
        .split(/[,;]+/g)          // dela på komma/semikolon om det finns
        .map((s) => s.trim())
        .filter(Boolean);
      const next = Array.from(new Set([...normalized, ...parts]));
      onChange(next);
      setDraft("");
      inputRef.current?.focus();
    },
    [draft, normalized, onChange]
  );

  const remove = (tag: string) => {
    onChange(normalized.filter((t) => t !== tag));
    inputRef.current?.focus();
  };

  return (
    <div className={clsx("w-full", className)}>
      {label && <label className="block text-sm mb-1">{label}</label>}
      <div className="min-h-[42px] flex flex-wrap gap-2 items-center rounded-xl border border-ink-700/40 bg-ink-800 px-2 py-2">
        {normalized.map((tag) => (
          <button
            key={tag}
            type="button"
            className="chip bg-ink-700/60 hover:bg-ink-700"
            onClick={() => remove(tag)}
            title="Ta bort"
          >
            {tag} ×
          </button>
        ))}

        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            const sepKeys = new Set(["Enter", ","]);
            if (spaceAsSeparator) sepKeys.add(" ");
            if (sepKeys.has(e.key)) {
              e.preventDefault();
              add();
            }
          }}
          onPaste={(e) => {
            const text = e.clipboardData.getData("text");
            if (text && /[,;]/.test(text)) {
              e.preventDefault();
              add(text);
            }
          }}
          className="flex-1 bg-transparent outline-none text-sand-100 placeholder:text-sand-400/60 py-1"
          placeholder={placeholder}
          inputMode="text"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
        <button type="button" className="btn-sm" onClick={() => add()}>
          Lägg till
        </button>
      </div>
      <p className="mt-1 text-xs text-sand-400">
        Tips: Enter, mellanslag eller komma skapar en tagg.
      </p>
    </div>
  );
}