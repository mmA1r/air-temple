import { useState } from "react";

function useLocalStorageState<TValue extends string>(key: string, defaultValue: TValue) {
    const [value, setValue] = useState<TValue>(() => {
        if (typeof window === "undefined") {
            return defaultValue;
        }

        const storedValue = window.localStorage.getItem(key);

        return storedValue ? (storedValue as TValue) : defaultValue;
    });

    function updateValue(nextValue: TValue) {
        setValue(nextValue);

        if (typeof window !== "undefined") {
            window.localStorage.setItem(key, nextValue);
        }
    }

    return [value, updateValue] as const;
}

export default useLocalStorageState;
