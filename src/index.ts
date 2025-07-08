type CompareFn<T> = (a: T, b: T) => boolean
type CloneFn<T> = (x: T) => T
type ChangeCallback<T> = (from: T | undefined, to: T | undefined) => void

export interface Options<T> {
  capacity?: number
  compare?: CompareFn<T>
  clone?: CloneFn<T>
  onChange?: ChangeCallback<T>
}

export class Undora<T> {
  private states: T[] = []
  private index = -1
  private capacity = 0
  private compare: CompareFn<T>
  private clone: CloneFn<T>
  private onChange?: ChangeCallback<T>
  private isRecording = true
  private isExecuting = false
  private transactionDepth = 0
  private transactionCache: T | null = null

  constructor(options?: Options<T>) {
    this.capacity = options?.capacity ?? 0
    this.compare = options?.compare ?? ((a, b) => JSON.stringify(a) === JSON.stringify(b))
    this.clone = options?.clone ?? (x => JSON.parse(JSON.stringify(x)))
    this.onChange = options?.onChange
  }

  /**
   * Executes a batch of state changes as a single atomic transaction.
   */
  transaction(callback: () => void) {
    this.transactionDepth++
    try {
      callback()
    }
    finally {
      this.transactionDepth--
      if (this.transactionDepth === 0 && this.transactionCache !== null) {
        this.pushState(this.transactionCache)
        this.transactionCache = null
      }
    }
  }

  /**
   * Push a new state if different from current.
   */
  pushState(newState: T, options?: { silent?: boolean }): void {
    if (!this.isRecording || this.isExecuting)
      return

    if (this.transactionDepth > 0) {
      this.transactionCache = this.clone(newState)
      return
    }

    const current = this.states[this.index]
    if (this.index >= 0 && this.compare(current, newState))
      return

    const from = current
    const to = this.clone(newState)

    // Drop redo stack
    this.states.splice(this.index + 1)
    this.states.push(to)
    this.index++

    this.trim()

    if (!options?.silent)
      this.callback(from, to)
  }

  /**
   * Undo to the previous state.
   */
  undo(): void {
    if (!this.canUndo())
      return

    const from = this.states[this.index]
    const to = this.states[this.index - 1]

    this.index--

    this.callback(from, to)
  }

  /**
   * Redo to the next state.
   */
  redo(): void {
    if (!this.canRedo())
      return

    const from = this.states[this.index]
    const to = this.states[this.index + 1]

    this.index++

    this.callback(from, to)
  }

  /**
   * Get the current state.
   */
  getCurrent(): T | undefined {
    return this.states[this.index]
  }

  /**
   * Get the index of the current state.
   */
  getIndex(): number {
    return this.index
  }

  /**
   * Get all states.
   */
  getStates(): T[] {
    return this.states
  }

  /**
   * Whether undo is possible.
   */
  canUndo(): boolean {
    return this.index > 0
  }

  /**
   * Whether redo is possible.
   */
  canRedo(): boolean {
    return this.index < this.states.length - 1
  }

  /**
   * Set a new undo stack capacity.
   * Trim the stack immediately if needed.
   */
  setCapacity(newCapacity: number): void {
    this.capacity = newCapacity
    this.trim()
  }

  /**
   * Pause state recording (will skip future pushState calls).
   */
  pause(): void {
    this.isRecording = false
  }

  /**
   * Resume state recording.
   */
  resume(): void {
    this.isRecording = true
  }

  /**
   * Clear all undo/redo history.
   */
  clear(): void {
    const from = this.states[this.index]
    this.states = []
    this.index = -1
    this.callback(from, undefined)
  }

  private callback(from: T | undefined, to: T | undefined): void {
    this.isExecuting = true
    this.onChange?.(from, to)
    this.isExecuting = false
  }

  private trim(): void {
    if (this.capacity === 0)
      return

    const overflow = this.states.length - this.capacity
    if (overflow > 0) {
      this.states.splice(0, overflow)
      this.index -= overflow
      if (this.index < -1)
        this.index = -1
    }
  }
}
