import * as ESTree from '@babel/types';

export {};

declare global {
    interface Array<T> {
        pushFront(value: T): void;
    }

    interface Map<K extends ESTree.Identifier, V> {
            add(key: K, to: string, value: V): void;
    }
}
