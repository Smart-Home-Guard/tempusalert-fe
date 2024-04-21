import { useLocalStorage } from "@/lib/useLocalStorage";
import { Dispatch, SetStateAction, useEffect } from "react";
import { create } from "zustand";

export function createGlobalStore<T, K extends string>(key: K, initialValue: T): () => (Record<`${K}`, T> & Record<`set${Capitalize<typeof key>}`, ((newValue: T) => void)> & Record<`remove${Capitalize<typeof key>}`, () => void> & Record<"init", ([key, setKey, removeKey]: [T, Dispatch<SetStateAction<T>>, () => void]) => void>) {
    return create((set: any) => {
        const keyCapitalize = key.charAt(0).toUpperCase() + key.slice(1);
        return {
            [`${key}`]: initialValue,
            [`set${keyCapitalize}`]: (newValue: T) => set(() => ({ [`${key}`]: newValue })),
            [`remove${keyCapitalize}`]: () => set(() => ({ [`${key}`]: initialValue })),
            "init": ([keyValue, setKey, removeKey]: [T, Dispatch<SetStateAction<T>>, () => void]) => set(() => {
                return {
                    [`${key}`]: keyValue,
                    [`set${keyCapitalize}`]: (newValue: T) => { setKey(newValue); set(() => ({ [`${key}`]: newValue })); },
                    [`remove${keyCapitalize}`]: () => { removeKey(); set(() => ({ [`${key}`]: initialValue })); },
                }
            })
        };
    }) as any;
}

export function useInitStoreToLocalStorage<T, K extends string>(key: K, store: () => Record<`${K}`, T> & Record<"init", ([key, setKey, removeKey]: [T, Dispatch<SetStateAction<T>>, () => void]) => void>) {
    const initialValue = (store() as any)[key] as T;
    const [keyValue, setKey, removeKey] = useLocalStorage(key, initialValue);
    const { init } = store();
    useEffect(() => {
        init([keyValue, setKey, removeKey]);
    }, []);
}
