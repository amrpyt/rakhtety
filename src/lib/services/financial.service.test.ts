import { describe, expect, it } from 'vitest'
import { calculateRealizedProfit, calculateTotalsFromSteps, getSignedEventAmount } from './financial-calculations'

describe('financial calculations', () => {
  const steps = [
    { fees: 300, profit: 100 },
    { fees: 700, profit: 300 },
  ]

  it('calculates totals from workflow step snapshots', () => {
    expect(calculateTotalsFromSteps(steps)).toEqual({
      total_cost: 1400,
      total_fees: 1000,
      planned_profit: 400,
    })
  })

  it('full payment realizes all planned profit', () => {
    expect(calculateRealizedProfit([{ type: 'payment', amount: 1400 }], 400, 1400)).toBe(400)
  })

  it('partial payment realizes profit proportionally', () => {
    expect(calculateRealizedProfit([{ type: 'payment', amount: 700 }], 400, 1400)).toBe(200)
  })

  it('refund reduces signed paid amount', () => {
    expect(getSignedEventAmount({ type: 'refund', amount: 200 })).toBe(-200)
  })

  it('adjustment counts as a positive event amount', () => {
    expect(getSignedEventAmount({ type: 'adjustment', amount: 150 })).toBe(150)
  })

  it('realized profit never exceeds planned profit', () => {
    expect(calculateRealizedProfit([{ type: 'payment', amount: 3000 }], 400, 1400)).toBe(400)
  })
})
