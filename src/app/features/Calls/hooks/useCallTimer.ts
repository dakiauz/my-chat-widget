import { useEffect, useState } from 'react';

export default function useCallTimer(isActive: boolean) {
    const [seconds, setSeconds] = useState(0);
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isActive) {
            interval = setInterval(() => setSeconds((s) => s + 1), 1000);
        } else {
            setSeconds(0);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive]);
    const pad = (n: number) => n.toString().padStart(2, '0');
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}
