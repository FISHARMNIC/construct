export {};

declare global {
    interface Array<T> {
        pushFront(value: T): void;
    }

    interface Map<K, V> {
        add(key: any, to: string, value: V): void;
    }
}
