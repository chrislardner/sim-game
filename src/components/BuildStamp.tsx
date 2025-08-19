// components/BuildStamp.tsx
const env = process.env.NEXT_PUBLIC_ENV;
const sha = (process.env.NEXT_PUBLIC_GIT_SHA || "").slice(0, 7);
const tag = process.env.NEXT_PUBLIC_RELEASE;

export default function BuildStamp() {
    const label =
        env === "production" && tag
            ? `${tag}`
            : env === "preview" && sha
                ? `preview-${sha}`
                : "dev";

    return (
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
      Build: {label}
    </span>
    );
}
