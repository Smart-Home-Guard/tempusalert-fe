import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useLocalStorage as _useLocalStorage } from "usehooks-ts";

// Unlike useLocalStorage from usehooks-ts, this version does not cause hydration mismatch
export function useLocalStorage<T>(key: string, defaultValue: T): [T, Dispatch<SetStateAction<T>>, () => void] {
    const [keyState, setKeyState] = useState(defaultValue);
    const [keyLocalStorage, setKeyLocalStorage, removeKeyLocalStorage] = _useLocalStorage(key, defaultValue);
    useEffect(() => {
        setKeyState(keyLocalStorage)
    }, [keyLocalStorage]);
    return [keyState, setKeyLocalStorage, removeKeyLocalStorage];
}