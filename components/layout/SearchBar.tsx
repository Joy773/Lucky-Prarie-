"use client";

import { FiSearch } from "react-icons/fi";

type SearchBarProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export default function SearchBar({
  id = "products-search",
  value,
  onChange,
  placeholder = "Search products...",
  className = "",
}: SearchBarProps) {
  return (
    <div
      className={`mx-auto h-[50px] w-full max-w-[667px] rounded-xl border border-fuchsia-200 bg-white px-3 shadow-[0_8px_24px_rgba(217,70,239,0.12)] ${className}`.trim()}
    >
      <label htmlFor={id} className="flex h-full items-center gap-3">
        <FiSearch className="shrink-0 text-base text-fuchsia-400" aria-hidden />
        <input
          id={id}
          type="text"
          inputMode="search"
          enterKeyHint="search"
          placeholder={placeholder}
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
          }}
          className="w-full min-w-0 bg-transparent text-base text-slate-700 placeholder:text-slate-400 focus:outline-none"
          autoComplete="off"
          spellCheck={false}
          aria-label={placeholder}
        />
      </label>
    </div>
  );
}
