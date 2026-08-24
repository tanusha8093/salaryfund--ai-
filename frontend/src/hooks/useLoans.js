import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { loanService } from '@/services/api/loanService'
import { QUERY_KEYS, LOAN_TYPES } from '@/constants'
import { loanHistory } from '@/utils/mockData'

function getStoredLoans() {
  try {
    const raw = localStorage.getItem('salaryfund_user_loans')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveStoredLoan(loan) {
  try {
    const current = getStoredLoans()
    const updated = [loan, ...current.filter((l) => l.id !== loan.id)]
    localStorage.setItem('salaryfund_user_loans', JSON.stringify(updated))
  } catch (e) {
    console.error('Failed to persist loan to localStorage', e)
  }
}

export function useLoans(params) {
  return useQuery({
    queryKey: [QUERY_KEYS.LOANS, params],
    queryFn: async () => {
      const stored = getStoredLoans()
      try {
        const remote = await loanService.getLoans(params)
        return [...stored, ...(Array.isArray(remote) ? remote : [])]
      } catch {
        // Fallback: merge stored user applications with default mock history
        const existingIds = new Set(stored.map((l) => l.id))
        return [...stored, ...loanHistory.filter((l) => !existingIds.has(l.id))]
      }
    },
  })
}

export function useLoanEligibility() {
  return useMutation({
    mutationFn: (payload) =>
      loanService.checkEligibility(payload).catch(() => ({
        eligible: true,
        eligibleAmount: Math.round(payload.monthlySalary * 0.5),
        approvalProbability: 87,
        riskLevel: 'Low',
        confidence: 0.91,
      })),
  })
}

export function useApplyLoan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload) => {
      let createdLoan
      try {
        createdLoan = await loanService.applyLoan(payload)
      } catch {
        const typeLabel = LOAN_TYPES.find((t) => t.value === payload.loanType)?.label || 'Salary Advance'
        createdLoan = {
          id: `LN-${Math.floor(2450 + Math.random() * 500)}`,
          type: typeLabel,
          amount: Number(payload.amount) || 30000,
          tenure: Number(payload.tenureMonths) || 12,
          status: 'pending',
          date: new Date().toISOString().slice(0, 10),
          purpose: payload.purpose || 'Emergency expenses',
        }
      }

      // Persist in localStorage so it appears in tracking immediately
      saveStoredLoan(createdLoan)
      return createdLoan
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.LOANS] })
    },
  })
}

