
import pkg from "../../package.json";

export default function BuildStamp() {
    const env = process.env.VERCEL_ENV || process.env.NODE_ENV || "development"; // "production" | "preview" | "development"
    const sha = (process.env.VERCEL_GIT_COMMIT_SHA || "").slice(0, 7);

    const label =
        env === "production" ? `v${pkg.version}` :
            env === "preview"   && sha ? `preview-${sha}` :
                sha ? `dev-${sha}` : "dev-local";

    return (
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
      Build: {label}
    </span>
    );
}
