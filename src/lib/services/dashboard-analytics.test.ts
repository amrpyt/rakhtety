import { describe, expect, it } from 'vitest'
import {
  buildBottlenecks,
  buildEmployeeWorkloads,
  countActiveFiles,
  countCompletedThisMonth,
  isBottleneckStep,
} from './dashboard-analytics'
import type { WorkflowAnalyticsInput } from './dashboard-analytics'
import type { EmployeeWithProfile, WorkflowStepWithEmployee } from '@/types/database.types'

const now = new Date('2026-04-29T10:00:00.000Z')

function step(overrides: Partial<WorkflowStepWithEmployee>): WorkflowStepWithEmployee {
  return {
    id: overrides.id || 'step-1',
    workflow_id: overrides.workflow_id || 'workflow-1',
    step_order: overrides.step_order || 1,
    name: overrides.name || 'بيان الصلاحية',
    status: overrides.status || 'in_progress',
    assigned_to: overrides.assigned_to ?? 'user-1',
    assigned_employee: overrides.assigned_employee,
    completed_at: overrides.completed_at ?? null,
    fees: overrides.fees ?? 0,
    profit: overrides.profit ?? 0,
    created_at: overrides.created_at || '2026-04-01T10:00:00.000Z',
    updated_at: overrides.updated_at || '2026-04-20T10:00:00.000Z',
  }
}

function workflow(overrides: Partial<WorkflowAnalyticsInput>): WorkflowAnalyticsInput {
  return {
    id: overrides.id || 'workflow-1',
    client_id: overrides.client_id || 'client-1',
    type: overrides.type || 'DEVICE_LICENSE',
    status: overrides.status || 'in_progress',
    assigned_to: overrides.assigned_to ?? 'user-1',
    created_at: overrides.created_at || '2026-04-01T10:00:00.000Z',
    updated_at: overrides.updated_at || '2026-04-20T10:00:00.000Z',
    client: overrides.client || { id: 'client-1', name: 'أحمد محمد' },
    steps: overrides.steps || [],
  }
}

function employee(id: string, userId: string, fullName: string): EmployeeWithProfile {
  return {
    id,
    user_id: userId,
    position: null,
    is_active: true,
    created_at: '2026-04-01T10:00:00.000Z',
    updated_at: '2026-04-01T10:00:00.000Z',
    profile: {
      id: userId,
      email: null,
      role: 'employee',
      full_name: fullName,
      phone: null,
      created_at: '2026-04-01T10:00:00.000Z',
      updated_at: '2026-04-01T10:00:00.000Z',
    },
  }
}

describe('dashboard analytics', () => {
  it('counts active files and completions in the current month', () => {
    const workflows = [
      workflow({ id: 'active-1', status: 'in_progress' }),
      workflow({ id: 'active-2', status: 'pending' }),
      workflow({ id: 'done-this-month', status: 'completed', updated_at: '2026-04-02T10:00:00.000Z' }),
      workflow({ id: 'done-old', status: 'completed', updated_at: '2026-03-02T10:00:00.000Z' }),
    ]

    expect(countActiveFiles(workflows)).toBe(2)
    expect(countCompletedThisMonth(workflows, now)).toBe(1)
  })

  it('flags only old active steps as bottlenecks', () => {
    expect(isBottleneckStep(step({ status: 'in_progress', updated_at: '2026-04-20T10:00:00.000Z' }), now)).toBe(true)
    expect(isBottleneckStep(step({ status: 'blocked', updated_at: '2026-04-20T10:00:00.000Z' }), now)).toBe(true)
    expect(isBottleneckStep(step({ status: 'pending', updated_at: '2026-04-20T10:00:00.000Z' }), now)).toBe(false)
    expect(isBottleneckStep(step({ status: 'completed', updated_at: '2026-04-20T10:00:00.000Z' }), now)).toBe(false)
    expect(isBottleneckStep(step({ status: 'in_progress', updated_at: '2026-04-28T10:00:00.000Z' }), now)).toBe(false)
  })

  it('sorts bottlenecks oldest first', () => {
    const bottlenecks = buildBottlenecks(
      [
        workflow({
          id: 'workflow-1',
          steps: [
            step({ id: 'newer', updated_at: '2026-04-20T10:00:00.000Z' }),
            step({ id: 'older', updated_at: '2026-04-10T10:00:00.000Z' }),
          ],
        }),
      ],
      now
    )

    expect(bottlenecks.map((item) => item.workflow_step_id)).toEqual(['older', 'newer'])
  })

  it('counts employee workload from assigned active work', () => {
    const workflows = [
      workflow({
        id: 'workflow-1',
        assigned_to: 'user-1',
        steps: [
          step({ id: 'step-1', assigned_to: 'user-1', status: 'in_progress' }),
          step({ id: 'step-2', assigned_to: 'user-1', status: 'completed' }),
        ],
      }),
      workflow({
        id: 'workflow-2',
        assigned_to: 'user-2',
        steps: [step({ id: 'step-3', assigned_to: 'user-2', status: 'blocked' })],
      }),
    ]
    const bottlenecks = buildBottlenecks(workflows, now)

    expect(buildEmployeeWorkloads([employee('emp-1', 'user-1', 'Ali')], workflows, bottlenecks)).toEqual([
      {
        employee_id: 'emp-1',
        user_id: 'user-1',
        full_name: 'Ali',
        active_workflows: 1,
        active_steps: 1,
        bottlenecks: 1,
      },
    ])
  })
})
