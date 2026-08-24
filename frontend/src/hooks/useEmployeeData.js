import { useQuery } from '@tanstack/react-query'
import { employeeService } from '@/services/api/employeeService'
import { QUERY_KEYS } from '@/constants'
import { mockEmployeeSummary, salaryTrend, emiTrend, repaymentTrend, loanHistory, careerScoreHistory, financialWellness } from '@/utils/mockData'

export function useEmployeeSummary() {
  return useQuery({
    queryKey: [QUERY_KEYS.EMPLOYEE_SUMMARY],
    queryFn: () => employeeService.getSummary().catch(() => mockEmployeeSummary),
  })
}

function getMergedLoanHistory() {
  try {
    const raw = localStorage.getItem('salaryfund_user_loans')
    const userLoans = raw ? JSON.parse(raw) : []
    const existingIds = new Set(userLoans.map((l) => l.id))
    return [...userLoans, ...loanHistory.filter((l) => !existingIds.has(l.id))]
  } catch {
    return loanHistory
  }
}

export function useEmployeeTrends() {
  return useQuery({
    queryKey: [QUERY_KEYS.EMPLOYEE_SUMMARY, 'trends'],
    queryFn: () => {
      const mergedLoans = getMergedLoanHistory()
      return Promise.resolve({ salaryTrend, emiTrend, repaymentTrend, loanHistory: mergedLoans })
    },
  })
}

export function useCareerScore() {
  return useQuery({
    queryKey: [QUERY_KEYS.CAREER_SCORE],
    queryFn: () =>
      employeeService
        .getCareerScore()
        .catch(() => ({ current: mockEmployeeSummary.careerCreditScore, history: careerScoreHistory, riskLevel: 'Low' })),
  })
}

export function useFinancialWellness() {
  return useQuery({
    queryKey: [QUERY_KEYS.FINANCIAL_WELLNESS],
    queryFn: () => employeeService.getFinancialWellness().catch(() => financialWellness),
  })
}
