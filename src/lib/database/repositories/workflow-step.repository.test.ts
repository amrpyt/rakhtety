import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/supabase/client', () => ({
  supabase: {},
}))

import { WorkflowStepRepository } from './workflow-step.repository'

describe('WorkflowStepRepository.validateTransition', () => {
  const repository = new WorkflowStepRepository()

  it('allows pending to in_progress', () => {
    expect(repository.validateTransition('pending', 'in_progress')).toBe(true)
  })

  it('allows in_progress to completed', () => {
    expect(repository.validateTransition('in_progress', 'completed')).toBe(true)
  })

  it('allows in_progress to blocked', () => {
    expect(repository.validateTransition('in_progress', 'blocked')).toBe(true)
  })

  it('allows blocked to in_progress', () => {
    expect(repository.validateTransition('blocked', 'in_progress')).toBe(true)
  })

  it('allows in_progress to move back to pending', () => {
    expect(repository.validateTransition('in_progress', 'pending')).toBe(true)
  })

  it('allows no-op updates', () => {
    expect(repository.validateTransition('pending', 'pending')).toBe(true)
    expect(repository.validateTransition('completed', 'completed')).toBe(true)
  })

  it('blocks pending to completed', () => {
    expect(repository.validateTransition('pending', 'completed')).toBe(false)
  })

  it('allows completed to move back to in_progress', () => {
    expect(repository.validateTransition('completed', 'in_progress')).toBe(true)
  })

  it('blocks completed from moving directly to pending or blocked', () => {
    expect(repository.validateTransition('completed', 'pending')).toBe(false)
    expect(repository.validateTransition('completed', 'blocked')).toBe(false)
  })

  it('blocks blocked to completed', () => {
    expect(repository.validateTransition('blocked', 'completed')).toBe(false)
  })
})
