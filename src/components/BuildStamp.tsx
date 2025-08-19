export default function BuildStamp() {
    const env = process.env.VERCEL_ENV || process.env.NODE_ENV || "development";
    const sha = (process.env.VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_LOCAL_SHA || "").slice(0, 7);
    const tag = process.env.NEXT_PUBLIC_RELEASE;

    const label =
        env === "production" && tag ? tag :
            env === "preview"   && sha ? `preview-${sha}` :
                sha ? `dev-${sha}` : "dev";

    return <span className="text-xs text-neutral-500 dark:text-neutral-400">Build: {label}</span>;
}
