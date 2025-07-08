import type { Options } from '../src'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Undora } from '../src'

describe('undora', () => {
  let undora: Undora<number>
  let onChange: Options<number>['onChange']

  beforeEach(() => {
    onChange = vi.fn()
    undora = new Undora<number>({
      onChange,
      capacity: 5,
    })
  })

  it('should push new state', () => {
    undora.pushState(1)
    expect(undora.getCurrent()).toBe(1)
    expect(undora.getStates()).toEqual([1])
    expect(undora.getIndex()).toBe(0)
    expect(onChange).toHaveBeenCalledWith(undefined, 1)
  })

  it('should not push identical state', () => {
    undora.pushState(1)
    undora.pushState(1)
    expect(undora.getStates().length).toBe(1)
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('should undo and redo', () => {
    undora.pushState(1)
    undora.pushState(2)
    undora.undo()
    expect(undora.getCurrent()).toBe(1)
    expect(undora.canRedo()).toBe(true)
    undora.redo()
    expect(undora.getCurrent()).toBe(2)
    undora.redo()
    expect(undora.getCurrent()).toBe(2)
  })

  it('should not undo when there is only one state', () => {
    undora.pushState(1)
    undora.undo()
    expect(undora.getCurrent()).toBe(1)
  })

  it('should trim states based on capacity', () => {
    for (let i = 1; i <= 10; i++) {
      undora.pushState(i)
    }
    expect(undora.getStates().length).toBe(5)
    expect(undora.getCurrent()).toBe(10)
  })

  it('should not call callback when silent is true', () => {
    undora.pushState(1, { silent: true })
    expect(onChange).not.toHaveBeenCalled()
  })

  it('should pause and resume recording', () => {
    undora.pushState(1)
    undora.pause()
    undora.pushState(2)
    expect(undora.getCurrent()).toBe(1)
    undora.resume()
    undora.pushState(3)
    expect(undora.getCurrent()).toBe(3)
  })

  it('should clear history', () => {
    undora.pushState(1)
    undora.clear()
    expect(undora.getStates()).toEqual([])
    expect(undora.getCurrent()).toBe(undefined)
    expect(onChange).toHaveBeenCalledWith(1, undefined)
  })

  it('should merge multiple pushState calls in a transaction', () => {
    undora.pushState(1)
    undora.transaction(() => {
      undora.pushState(2)
      undora.pushState(3)
    })
    expect(undora.getStates()).toEqual([1, 3])
    expect(undora.getCurrent()).toBe(3)
    expect(onChange).toHaveBeenCalledTimes(2)
  })

  it('should support nested transactions', () => {
    undora.pushState(1)
    undora.transaction(() => {
      undora.pushState(2)
      undora.transaction(() => {
        undora.pushState(3)
      })
      undora.pushState(4)
    })
    expect(undora.getStates()).toEqual([1, 4])
  })

  it('should allow custom compare and clone functions', () => {
    const custom = new Undora<{ value: number }>({
      compare: (a, b) => a.value === b.value,
      clone: x => ({ ...x }),
    })

    custom.pushState({ value: 1 })
    custom.pushState({ value: 1 }) // equal by value
    custom.pushState({ value: 2 })

    expect(custom.getStates().length).toBe(2)
  })

  it('should set capacity and trim states immediately if needed', () => {
    const undora = new Undora<number>()

    for (let i = 1; i <= 5; i++) {
      undora.pushState(i)
    }

    expect(undora.getStates()).toEqual([1, 2, 3, 4, 5])
    expect(undora.getIndex()).toBe(4)

    undora.setCapacity(3)

    expect(undora.getStates()).toEqual([3, 4, 5])
    expect(undora.getIndex()).toBe(2)
  })
})
