import { expect, it } from 'vitest'
import { Undora } from '../src'

it('usage', () => {
  const undora = new Undora<number>()
  for (let i = 0; i < 10; i++) {
    undora.pushState(i)
  }

  expect(undora.canUndo()).toBe(true)
  expect(undora.canRedo()).toBe(false)

  undora.undo()
  expect(undora.canUndo()).toBe(true)
  expect(undora.canRedo()).toBe(true)
  expect(undora.getCurrent()).toBe(8)

  undora.redo()
  expect(undora.canUndo()).toBe(true)
  expect(undora.canRedo()).toBe(false)
  expect(undora.getCurrent()).toBe(9)

  undora.undo()
  undora.pushState(10)
  expect(undora.canUndo()).toBe(true)
  expect(undora.canRedo()).toBe(false)
  expect(undora.getCurrent()).toBe(10)
  expect(undora.getStates()).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 10])
})

it('capacity', () => {
  const undora = new Undora<number>({
    capacity: 5,
  })

  for (let i = 0; i < 10; i++) {
    undora.pushState(i)
  }
  expect(undora.getStates().length).toBe(5)

  undora.setCapacity(10)
  for (let i = 10; i < 20; i++) {
    undora.pushState(i)
  }
  expect(undora.getStates().length).toBe(10)

  undora.setCapacity(5)
  expect(undora.getStates().length).toBe(5)
})

it('compare', () => {
  const undora = new Undora<number>()
  undora.pushState(1)
  undora.pushState(1)
  expect(undora.getStates().length).toBe(1)
})

it('custom compare', () => {
  const undora = new Undora<number>({
    compare: (a, b) => a % 2 === b % 2,
  })
  undora.pushState(1)
  undora.pushState(3)
  expect(undora.getStates().length).toBe(1)
})

it('clone', () => {
  const undora = new Undora<string[]>()
  const arr: string[] = ['1']
  undora.pushState(arr)
  arr[0] = '2'
  expect(undora.getCurrent()).toEqual(['1'])
})

it('custom clone', () => {
  const undora = new Undora<string[]>({
    clone: arr => arr.slice(),
  })
  const arr: string[] = ['1']
  undora.pushState(arr)
  arr[0] = '2'
  expect(undora.getCurrent()).toEqual(['1'])
})

it('change', () => {
  const undora = new Undora<number>({
    onChange(from, to) {
      expect(from).toBe(2)
      expect(to).toBe(1)
    },
  })
  undora.pushState(1, { silent: true })
  undora.pushState(2, { silent: true })
  undora.undo()
})

it('pause and resume', () => {
  const undora = new Undora<number>()

  undora.pause()
  undora.pushState(1)
  expect(undora.getCurrent()).toBe(undefined)
  expect(undora.getStates().length).toBe(0)

  undora.resume()
  undora.pushState(1)
  expect(undora.getCurrent()).toBe(1)
  expect(undora.getStates().length).toBe(1)
})

it('clear', () => {
  const undora = new Undora<number>()
  for (let i = 0; i < 10; i++) {
    undora.pushState(i)
  }

  expect(undora.getStates().length).toBe(10)
  undora.clear()
  expect(undora.getIndex()).toBe(-1)
  expect(undora.getStates().length).toBe(0)
})

it('transaction', () => {
  const undora = new Undora<number>()
  undora.transaction(() => {
    for (let i = 0; i < 10; i++) {
      undora.pushState(i)
    }
  })
  expect(undora.getStates().length).toBe(1)
  expect(undora.getCurrent()).toBe(9)
})
