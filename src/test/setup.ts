
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock localstorage
const localStorageMock = (function () {
    let store: Record<string, string> = {}
    return {
        getItem: function (key: string) {
            return store[key] || null
        },
        setItem: function (key: string, value: string) {
            store[key] = value.toString()
        },
        clear: function () {
            store = {}
        },
        removeItem: function (key: string) {
            delete store[key]
        }
    }
})()

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
})

// Mock crypto
Object.defineProperty(global, 'crypto', {
    value: {
        randomUUID: () => 'test-uuid',
        subtle: {
            digest: () => Promise.resolve(new ArrayBuffer(32)),
        }
    }
})

// Mock fetch
global.fetch = vi.fn()
