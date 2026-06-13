export function FieldErrors({ errors }: { errors?: string[] }) {
  if (!errors || errors.length === 0) return null;
  return (
    <p className="mt-1.5 text-sm font-medium text-coral-500" role="alert">
      {errors.join(" ")}
    </p>
  );
}

export const inputClassName =
  "w-full rounded-xl border-2 border-stone-200 bg-white px-4 py-2.5 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100";

export const labelClassName = "mb-1.5 block text-sm font-semibold text-stone-700";

export const primaryButtonClassName =
  "cursor-pointer rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-4 py-3 font-semibold text-white shadow-md shadow-brand-200 transition hover:from-brand-600 hover:to-brand-700 disabled:cursor-not-allowed disabled:opacity-50";

export const formCardClassName =
  "rounded-3xl bg-white p-8 shadow-xl shadow-stone-200/60 ring-1 ring-stone-100";
