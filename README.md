# undora

[![npm version][npm-version-src]][npm-version-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

Undora is a lightweight undo/redo state management library for TypeScript/JavaScript applications. It provides a simple API to track state changes, undo/redo operations, and manage state history with configurable capacity.

## Installation

```bash
pnpm add undora
```

## Features

- **Undo/Redo functionality**: Track and navigate through state history
- **Transaction support**: Batch multiple changes as a single undo/redo step
- **Configurable comparison**: Customize how state changes are detected
- **Capacity control**: Limit history size to prevent memory issues
- **Change callbacks**: Get notified when state changes occur
- **Type-safe**: Built with TypeScript for excellent type support

## Usage

```typescript
import { Undora } from 'undora'

// Initialize with optional configuration
const undora = new Undora<number>({
  capacity: 100, // Maximum number of states to keep
  compare: (a, b) => a === b, // Custom comparison function
  clone: x => x, // Custom clone function
  onChange: (from, to) => console.log(`State changed from ${from} to ${to}`)
})

// Push initial state
undora.pushState(1)

// Update state
undora.pushState(2)

// Undo the last change
undora.undo()

// Redo the undone change
undora.redo()

// Get current state
const current = undora.getCurrent()
```

### Constructor

```typescript
new Undora<T>(options?: Options<T>)
```

Options:
- `capacity`: Maximum number of states to keep (0 = unlimited)
- `compare`: Function to compare states (default: deep equality via JSON.stringify)
- `clone`: Function to clone states (default: deep clone via JSON.parse/stringify)
- `onChange`: Callback when state changes

### Core Methods

- **`pushState(newState: T, options?: { silent?: boolean })`**
  Add a new state to history (skipped if identical to current state)

- **`undo()`**
  Revert to previous state

- **`redo()`**
  Reapply next state

- **`transaction(callback: () => void)`**
  Batch multiple state changes as a single undo/redo step

### State Access

- **`getCurrent(): T | undefined`**
  Get current state

- **`getIndex(): number`**
  Get current state index

- **`getStates(): T[]`**
  Get all stored states

### Control Methods

- **`canUndo(): boolean`**
  Check if undo is possible

- **`canRedo(): boolean`**
  Check if redo is possible

- **`setCapacity(newCapacity: number)`**
  Change maximum history size

- **`pause()`**
  Temporarily stop recording state changes

- **`resume()`**
  Resume recording state changes

- **`clear()`**
  Reset all history

## Advanced Usage

### Transactions

```typescript
undora.transaction(() => {
  undora.pushState(1)
  undora.pushState(2)
  undora.pushState(3)
  // All pushes are recorded as a single undo step
})
```

### Custom Comparison

```typescript
const undora = new Undora<{ id: number }>({
  compare: (a, b) => a.id === b.id // Only compare by ID
})
```

### Custom Clone Function

```typescript
const undora = new Undora<MyState>({
  clone: x => structuredClone(x) // For example, using structuredClone
})
```

## License

[MIT](./LICENSE) License © [jinghaihan](https://github.com/jinghaihan)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/undora?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/undora
[npm-downloads-src]: https://img.shields.io/npm/dm/undora?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/undora
[bundle-src]: https://img.shields.io/bundlephobia/minzip/undora?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=undora
[license-src]: https://img.shields.io/badge/license-MIT-blue.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/jinghaihan/undora/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/undora
