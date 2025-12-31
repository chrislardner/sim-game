import {useEffect, useState} from "react";

export function useData<T, K>(key: K, loader: (key: K) => Promise<T>) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [version, setVersion] = useState(0);

    const reload = () => setVersion(v => v + 1);

    useEffect(() => {
        let cancelled = false;

        loader(key)
            .then(d => {
                if (!cancelled) setData(d);
            })
            .catch(e => {
                if (!cancelled) setError(e);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [key, loader, version]);

    return {data, loading, error, reload};
}
