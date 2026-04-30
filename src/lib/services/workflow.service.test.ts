import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ErrorCodes } from '@/types/error-codes.enum'
import { AppError } from '@/lib/errors/app-error.class'

const {
  mockFindStepById,
  mockUpdateStepStatus,
  mockFindWorkflowById,
  mockFindWorkflowSteps,
  mockAssertStepCanComplete,
  mockCreateActionLog,
  mockProfileMaybeSingle,
} = vi.hoisted(() => ({
  mockFindStepById: vi.fn(),
  mockUpdateStepStatus: vi.fn(),
  mockFindWorkflowById: vi.fn(),
  mockFindWorkflowSteps: vi.fn(),
  mockAssertStepCanComplete: vi.fn(),
  mockCreateActionLog: vi.fn(),
  mockProfileMaybeSingle: vi.fn(),
}))

vi.mock('@/lib/database/repositories/workflow-step.repository', () => ({
  workflowStepRepository: {
    findById: mockFindStepById,
    updateStatus: mockUpdateStepStatus,
    findByWorkflowId: mockFindWorkflowSteps,
  },
}))

vi.mock('@/lib/database/repositories/workflow.repository', () => ({
  workflowRepository: {
    findById: mockFindWorkflowById,
    findByClientId: vi.fn(),
    getWithSteps: vi.fn(),
    create: vi.fn(),
    updateStatus: vi.fn(),
  },
}))

vi.mock('@/lib/database/repositories/client.repository', () => ({
  clientRepository: {
    findById: vi.fn(),
  },
}))

vi.mock('@/lib/services/document.service', () => ({
  documentService: {
    assertStepCanComplete: mockAssertStepCanComplete,
  },
}))

vi.mock('@/lib/database/repositories/workflow-action-log.repository', () => ({
  workflowActionLogRepository: {
    create: mockCreateActionLog,
  },
}))

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: mockProfileMaybeSingle,
        })),
      })),
    })),
  },
}))

import { workflowService } from './workflow.service'

describe('WorkflowService emergency override', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockProfileMaybeSingle.mockResolvedValue({ data: { role: 'admin' }, error: null })

    mockFindStepById.mockResolvedValue({
      id: 'step-1',
      workflow_id: 'workflow-1',
      step_order: 1,
      name: 'File Submission',
      status: 'in_progress',
      assigned_to: null,
      completed_at: null,
      fees: 0,
      profit: 0,
      created_at: '',
      updated_at: '',
    })

    mockUpdateStepStatus.mockResolvedValue({
      id: 'step-1',
      workflow_id: 'workflow-1',
      step_order: 1,
      name: 'File Submission',
      status: 'completed',
      assigned_to: null,
      completed_at: '2026-04-29T00:00:00.000Z',
      fees: 0,
      profit: 0,
      created_at: '',
      updated_at: '',
    })

    mockFindWorkflowById.mockResolvedValue({
      id: 'workflow-1',
      client_id: 'client-1',
      type: 'DEVICE_LICENSE',
      status: 'in_progress',
      assigned_to: null,
      created_at: '',
      updated_at: '',
    })

    mockFindWorkflowSteps.mockResolvedValue([
      {
        id: 'step-1',
        workflow_id: 'workflow-1',
        step_order: 1,
        name: 'File Submission',
        status: 'completed',
        assigned_to: null,
        completed_at: '2026-04-29T00:00:00.000Z',
        fees: 0,
        profit: 0,
        created_at: '',
        updated_at: '',
      },
    ])

    mockCreateActionLog.mockResolvedValue({
      id: 'log-1',
      workflow_id: 'workflow-1',
      workflow_step_id: 'step-1',
      action: 'emergency_complete',
      reason: 'Urgent municipal deadline',
      actor_id: 'employee-1',
      created_at: '2026-04-29T00:00:00.000Z',
    })
  })

  it('completes a step with emergency override when documents are missing and a reason is provided', async () => {
    mockAssertStepCanComplete.mockRejectedValue(
      new AppError({
        code: ErrorCodes.WORKFLOW_DOCUMENTS_MISSING,
        message: 'Missing required documents',
        statusCode: 400,
      })
    )

    await expect(
      workflowService.emergencyCompleteStep('step-1', {
        reason: 'Urgent municipal deadline',
        actorId: 'employee-1',
      })
    ).resolves.toMatchObject({
      id: 'step-1',
      status: 'completed',
    })

    expect(mockCreateActionLog).toHaveBeenCalledWith({
      workflow_id: 'workflow-1',
      workflow_step_id: 'step-1',
      action: 'emergency_complete',
      reason: 'Urgent municipal deadline',
      actor_id: 'employee-1',
    })
  })

  it('rejects emergency override when reason is empty', async () => {
    await expect(
      workflowService.emergencyCompleteStep('step-1', {
        reason: '   ',
        actorId: 'employee-1',
      })
    ).rejects.toMatchObject({
      code: ErrorCodes.VALIDATION_FAILED,
    })
  })

  it('rejects emergency override for employees', async () => {
    mockProfileMaybeSingle.mockResolvedValue({ data: { role: 'employee' }, error: null })

    await expect(
      workflowService.emergencyCompleteStep('step-1', {
        reason: 'Urgent municipal deadline',
        actorId: 'employee-1',
      })
    ).rejects.toMatchObject({
      code: ErrorCodes.OPERATION_NOT_ALLOWED,
    })
  })

  it('still completes emergency override when the audit log migration is not deployed yet', async () => {
    mockAssertStepCanComplete.mockRejectedValue(
      new AppError({
        code: ErrorCodes.WORKFLOW_DOCUMENTS_MISSING,
        message: 'Missing required documents',
        statusCode: 400,
      })
    )
    mockCreateActionLog.mockRejectedValue({
      code: 'PGRST205',
      message: 'Could not find the table public.workflow_action_logs in the schema cache',
    })

    await expect(
      workflowService.emergencyCompleteStep('step-1', {
        reason: 'Urgent municipal deadline',
        actorId: 'employee-1',
      })
    ).resolves.toMatchObject({
      id: 'step-1',
      status: 'completed',
    })
  })

  it('moves a completed step back when a reason is provided', async () => {
    mockFindStepById.mockResolvedValueOnce({
      id: 'step-1',
      workflow_id: 'workflow-1',
      step_order: 1,
      name: 'File Submission',
      status: 'completed',
      assigned_to: null,
      completed_at: '2026-04-29T00:00:00.000Z',
      fees: 0,
      profit: 0,
      created_at: '',
      updated_at: '',
    })

    mockUpdateStepStatus.mockResolvedValueOnce({
      id: 'step-1',
      workflow_id: 'workflow-1',
      step_order: 1,
      name: 'File Submission',
      status: 'in_progress',
      assigned_to: null,
      completed_at: null,
      fees: 0,
      profit: 0,
      created_at: '',
      updated_at: '',
    })

    mockFindWorkflowSteps.mockResolvedValue([
      {
        id: 'step-1',
        workflow_id: 'workflow-1',
        step_order: 1,
        name: 'File Submission',
        status: 'in_progress',
        assigned_to: null,
        completed_at: null,
        fees: 0,
        profit: 0,
        created_at: '',
        updated_at: '',
      },
    ])

    await expect(
      workflowService.moveStepBack('step-1', {
        reason: 'Previous file delayed because employee was on leave',
        actorId: 'employee-1',
      })
    ).resolves.toMatchObject({
      id: 'step-1',
      status: 'in_progress',
      completed_at: null,
    })

    expect(mockCreateActionLog).toHaveBeenCalledWith({
      workflow_id: 'workflow-1',
      workflow_step_id: 'step-1',
      action: 'move_back',
      reason: 'Previous file delayed because employee was on leave',
      actor_id: 'employee-1',
    })
  })
})
