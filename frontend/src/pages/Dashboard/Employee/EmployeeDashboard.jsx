import { Link } from 'react-router-dom'
import { CreditCard, PiggyBank, Wallet, CalendarClock, ArrowRight, Sparkles } from 'lucide-react'
import PageHeader from '@/components/common/PageHeader'
import StatCard from '@/components/common/StatCard'
import { StatCardSkeleton, ChartSkeleton, TableSkeleton } from '@/components/common/Skeletons'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import DataTable from '@/components/tables/DataTable'
import StatusBadge from '@/components/common/StatusBadge'
import TrendAreaChart from '@/components/charts/TrendAreaChart'
import TrendLineChart from '@/components/charts/TrendLineChart'
import CareerScoreGauge from './widgets/CareerScoreGauge'
import { useEmployeeSummary, useEmployeeTrends, useCareerScore } from '@/hooks/useEmployeeData'
import { useLoans } from '@/hooks/useLoans'
import { formatCurrency, formatDate } from '@/utils/format'
import { ROUTES } from '@/constants'

const loanColumns = [
  { key: 'id', label: 'Loan ID' },
  { key: 'type', label: 'Type' },
  { key: 'amount', label: 'Amount', render: (row) => formatCurrency(row.amount) },
  { key: 'date', label: 'Date', render: (row) => formatDate(row.date) },
  { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
]

export default function EmployeeDashboard() {
  const { data: summary, isLoading } = useEmployeeSummary()
  const { data: trends, isLoading: trendsLoading } = useEmployeeTrends()
  const { data: careerScore } = useCareerScore()
  const { data: loans, isLoading: loansLoading } = useLoans()

  const displayedLoans = loans || trends?.loanHistory || []

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${summary?.name?.split(' ')[0] || ''}`}
        description="Here's where your earned wages and credit health stand today."
        actions={
          <Button asChild variant="aurora">
            <Link to={ROUTES.LOAN_APPLICATION}>
              <CreditCard className="h-4 w-4" /> Quick apply
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Current salary" value={formatCurrency(summary.currentSalary)} icon={Wallet} accent="primary" />
            <StatCard label="Available loan" value={formatCurrency(summary.availableLoan)} icon={CreditCard} accent="accent" />
            <StatCard label="Loan balance" value={formatCurrency(summary.loanBalance)} icon={PiggyBank} accent="warning" trend={-8} trendLabel="vs last month" />
            <StatCard
              label="Next EMI"
              value={formatDate(summary.nextEmiDate)}
              icon={CalendarClock}
              accent="success"
            />
          </>
        )}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          {trendsLoading ? (
            <ChartSkeleton />
          ) : (
            <TrendAreaChart
              title="Salary trend"
              description="Last 6 pay cycles"
              data={trends.salaryTrend}
              dataKey="salary"
              valueFormatter={formatCurrency}
            />
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <TrendLineChart title="EMI trend" data={trends?.emiTrend || []} dataKey="paid" color="hsl(283 70% 62%)" valueFormatter={formatCurrency} height={220} />
            <TrendLineChart title="Repayment trend" data={trends?.repaymentTrend || []} dataKey="onTime" color="hsl(152 55% 48%)" valueFormatter={(v) => `${v}%`} height={220} />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Loan history</CardTitle>
              <CardDescription>Your recent and active loans</CardDescription>
            </CardHeader>
            <CardContent>
              {trendsLoading || loansLoading ? <TableSkeleton /> : <DataTable columns={loanColumns} data={displayedLoans} />}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <CareerScoreGauge score={careerScore?.current || summary?.careerCreditScore} riskLevel={careerScore?.riskLevel} />


          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> Financial wellness
              </CardTitle>
              <CardDescription>Your overall wellness score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-2 flex items-end justify-between">
                <span className="font-display text-2xl font-semibold">{summary?.financialWellnessScore || 78}</span>
                <span className="text-xs text-muted-foreground">out of 100</span>
              </div>
              <Progress value={summary?.financialWellnessScore || 78} />
              <Button asChild variant="ghost" size="sm" className="mt-4 w-full justify-between">
                <Link to="/financial-wellness">
                  View breakdown <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Remaining EMIs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-display text-3xl font-semibold">{summary?.remainingEmi ?? 4}</p>
              <p className="mt-1 text-sm text-muted-foreground">payments left on active loans</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
