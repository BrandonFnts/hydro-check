import { useState, useEffect } from "react";

export const useMonitor = (actionNames) => {
    const [monitors, setMonitors] = useState(() =>
        actionNames.reduce((acc, name) => ({ ...acc, [name]: false }), {})
    );

    useEffect(() => {
        const handleOnStart = (event) => {
            setMonitors((prev) => ({ ...prev, [event.detail.action]: true }));
        };
        const handleOnEnd = (event) => {
            setMonitors((prev) => ({ ...prev, [event.detail.action]: false }));
        };

        actionNames.forEach((name) => {
            window.addEventListener(`lf:${name}:start`, handleOnStart);
            window.addEventListener(`lf:${name}:success`, handleOnEnd);
            window.addEventListener(`lf:${name}:error`, handleOnEnd);
        });

        return () => {
            actionNames.forEach((name) => {
                window.removeEventListener(`lf:${name}:start`, handleOnStart);
                window.removeEventListener(`lf:${name}:success`, handleOnEnd);
                window.removeEventListener(`lf:${name}:error`, handleOnEnd);
            });
        };
    }, []);

    return monitors;
};
