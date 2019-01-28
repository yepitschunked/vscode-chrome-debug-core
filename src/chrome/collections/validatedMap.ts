/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import { printMap } from './printing';
import { breakWhileDebugging } from '../../validation';

export interface IValidatedMap<K, V> extends Map<K, V> {
    tryGetting(key: K): V | undefined;
    getOrAdd(key: K, obtainValueToAdd: () => V): V;
    setAndReplaceIfExist(key: K, value: V): this;
}

/** A map that throws exceptions instead of returning error codes. */
export class ValidatedMap<K, V> implements IValidatedMap<K, V> {
    private readonly _wrappedMap: Map<K, V>;

    public get size(): number {
        return this._wrappedMap.size;
    }

    public get [Symbol.toStringTag](): 'Map' {
        return 'ValidatedMap' as 'Map';
    }

    constructor(initialContents?: Map<K, V> | Iterable<[K, V]> | ReadonlyArray<[K, V]>) {
        this._wrappedMap = initialContents instanceof Map
            ? new Map<K, V>(initialContents.entries())
            : new Map<K, V>(initialContents);
    }

    public clear(): void {
        this._wrappedMap.clear();
    }

    public delete(key: K): boolean {
        if (!this._wrappedMap.delete(key)) {
            breakWhileDebugging();
            throw new Error(`Couldn't delete element with key ${key} because it wasn't present in the map`);
        }

        return true;
    }

    public forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
        this._wrappedMap.forEach(callbackfn, thisArg);
    }

    public get(key: K): V {
        const value = this._wrappedMap.get(key);
        if (value === undefined) {
            breakWhileDebugging();
            throw new Error(`Couldn't get the element with key '${key}' because it wasn't present in this map <${this}>`);
        }
        return value;
    }

    public getOrAdd(key: K, obtainValueToAdd: () => V): V {
        const existingValue = this.tryGetting(key);
        if (existingValue !== undefined) {
            return existingValue;
        } else {
            const newValue = obtainValueToAdd();
            this.set(key, newValue);
            return newValue;
        }
    }

    public has(key: K): boolean {
        return this._wrappedMap.has(key);
    }

    public set(key: K, value: V): this {
        if (this.has(key)) {
            breakWhileDebugging();
            throw new Error(`Cannot set key ${key} because it already exists`);
        }

        return this.setAndReplaceIfExist(key, value);
    }

    public setAndReplaceIfExist(key: K, value: V): this {
        this._wrappedMap.set(key, value);
        return this;
    }

    [Symbol.iterator](): IterableIterator<[K, V]> {
        return this._wrappedMap.entries();
    }

    public entries(): IterableIterator<[K, V]> {
        return this._wrappedMap.entries();
    }

    public keys(): IterableIterator<K> {
        return this._wrappedMap.keys();
    }

    public values(): IterableIterator<V> {
        return this._wrappedMap.values();
    }

    // TODO: Remove the use of undefined
    public tryGetting(key: K): V | undefined {
        return this._wrappedMap.get(key) || undefined;
    }

    public toString(): string {
        return printMap('ValidatedMap', this);
    }
}