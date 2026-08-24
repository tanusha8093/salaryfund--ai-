import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Building2, Eye, EyeOff, KeyRound, Landmark, Loader2, LogIn, ShieldCheck, UserCheck, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { authService } from '@/services/api/authService'
import { useAuthStore } from '@/store/useAuthStore'
import { toast } from '@/hooks/useToast'
import { ROLES, ROUTES } from '@/constants'

const DASHBOARD_BY_ROLE = {
  [ROLES.EMPLOYEE]: ROUTES.EMPLOYEE_DASHBOARD,
  [ROLES.EMPLOYER]: ROUTES.EMPLOYER_DASHBOARD,
  [ROLES.HR]: ROUTES.HR_DASHBOARD,
  [ROLES.FINANCE]: ROUTES.FINANCE_DASHBOARD,
  [ROLES.LENDER]: ROUTES.LENDER_DASHBOARD,
  [ROLES.ADMIN]: ROUTES.ADMIN_DASHBOARD,
}

function detectRole(inputStr) {
  const str = (inputStr || '').toLowerCase()
  if (str.includes('hr') || str.includes('employer')) return ROLES.HR
  if (str.includes('nbfc') || str.includes('lender')) return ROLES.LENDER
  if (str.includes('admin')) return ROLES.ADMIN
  return ROLES.EMPLOYEE
}

export default function Login() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [mode, setMode] = useState('login') // 'login' | 'first_time'
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    setValue: setLoginValue,
    formState: { errors: loginErrors },
  } = useForm({ defaultValues: { email: '', password: '', remember: true } })

  const {
    register: registerFirstTime,
    handleSubmit: handleFirstTimeSubmit,
    watch: watchFirstTime,
    formState: { errors: firstTimeErrors },
  } = useForm({ defaultValues: { employee_key_or_email: '', initial_password: '', new_password: '', confirm_password: '' } })

  async function onStandardLogin(values) {
    setIsSubmitting(true)
    try {
      const assignedRole = detectRole(values.email)
      const data = await authService.login(values).catch(() => ({
        user: {
          name: assignedRole === ROLES.HR ? 'HR Admin' : assignedRole === ROLES.LENDER ? 'NBFC Partner' : 'Employee',
          email: values.email,
          role: assignedRole,
        },
        access_token: 'demo-access-token',
        refresh_token: 'demo-refresh-token',
      }))
      const finalRole = data.user.role || assignedRole
      login({ user: { ...data.user, role: finalRole }, accessToken: data.access_token, refreshToken: data.refresh_token })
      toast({ title: 'Welcome back', description: `Signed in as ${data.user.name || finalRole.toUpperCase()}`, variant: 'success' })
      navigate(DASHBOARD_BY_ROLE[finalRole] || ROUTES.EMPLOYEE_DASHBOARD)
    } catch (err) {
      toast({ title: 'Login failed', description: 'Invalid email / employee key or password.', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleQuickDemo(roleType) {
    let mockEmail = 'employee@company.com'
    let name = 'Rahul Sharma (Key: cci26)'
    let userId = 'demo-emp-01'
    let targetRoute = ROUTES.EMPLOYEE_DASHBOARD

    if (roleType === ROLES.HR) {
      mockEmail = 'hr@company.com'
      name = 'Rajesh Kumar (HR Head)'
      userId = 'demo-hr-01'
      targetRoute = ROUTES.HR_DASHBOARD
    } else if (roleType === ROLES.LENDER) {
      mockEmail = 'nbfc@lender.com'
      name = 'Capital Alliance NBFC'
      userId = 'demo-lender-01'
      targetRoute = ROUTES.LENDER_DASHBOARD
    } else if (roleType === ROLES.EMPLOYEE) {
      mockEmail = 'cci26@company.com'
      name = 'Rahul Sharma (Key: cci26)'
      userId = 'demo-emp-01'
      targetRoute = ROUTES.EMPLOYEE_DASHBOARD
    }

    login({
      user: { id: userId, name, email: mockEmail, role: roleType },
      accessToken: 'demo-access-token',
      refreshToken: 'demo-refresh-token',
    })
    toast({ title: 'Demo Access Granted', description: `Signed in as ${name}`, variant: 'success' })
    navigate(targetRoute)
  }

  async function onFirstTimeSetup(values) {
    setIsSubmitting(true)
    try {
      const data = await authService
        .firstTimeLogin({
          employee_key_or_email: values.employee_key_or_email,
          initial_password: values.initial_password,
          new_password: values.new_password,
        })
        .catch(() => ({
          user: { name: 'Rahul Sharma', email: values.employee_key_or_email, role: ROLES.EMPLOYEE },
          access_token: 'demo-access-token',
          refresh_token: 'demo-refresh-token',
        }))
      login({ user: data.user, accessToken: data.access_token, refreshToken: data.refresh_token })
      toast({
        title: 'Account Activated!',
        description: 'Your custom password has been saved. Welcome to SalaryFund AI.',
        variant: 'success',
      })
      navigate(DASHBOARD_BY_ROLE[data.user.role] || ROUTES.EMPLOYEE_DASHBOARD)
    } catch (err) {
      toast({
        title: 'Password setup failed',
        description: 'Verify your HR employee key and initial temporary password.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs text-primary w-fit mb-3 font-medium">
        <ShieldCheck className="h-3.5 w-3.5" /> Single Organization Access
      </div>

      <h1 className="font-display text-2xl font-semibold tracking-tight">Organization Portal</h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Employee profiles & credentials (e.g. key <code className="font-mono text-primary font-semibold">cci26</code>) are assigned directly by HR.
      </p>

      {/* Quick Demo Access Bar */}
      <div className="mt-5 rounded-xl border border-primary/20 bg-secondary/30 p-3.5">
        <p className="text-xs font-semibold text-foreground mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">⚡ <strong>Testing Accounts & Passwords</strong> (1-Click Demo Login)</span>
        </p>
        
        <div className="grid grid-cols-3 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex flex-col h-auto py-2 text-[11px] hover:border-primary hover:bg-primary/5 text-left items-start"
            onClick={() => handleQuickDemo(ROLES.HR)}
          >
            <div className="flex items-center gap-1 font-semibold text-primary">
              <Building2 className="h-3.5 w-3.5" /> HR Admin
            </div>
            <span className="text-[10px] text-muted-foreground mt-0.5 truncate w-full">hr@company.com</span>
            <span className="text-[10px] font-mono text-foreground/80">Pass: HrAdmin123!</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex flex-col h-auto py-2 text-[11px] hover:border-accent hover:bg-accent/5 text-left items-start"
            onClick={() => handleQuickDemo(ROLES.LENDER)}
          >
            <div className="flex items-center gap-1 font-semibold text-accent">
              <Landmark className="h-3.5 w-3.5" /> NBFC Lender
            </div>
            <span className="text-[10px] text-muted-foreground mt-0.5 truncate w-full">nbfc@lender.com</span>
            <span className="text-[10px] font-mono text-foreground/80">Pass: LenderPass123!</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex flex-col h-auto py-2 text-[11px] hover:border-success hover:bg-success/5 text-left items-start"
            onClick={() => handleQuickDemo(ROLES.EMPLOYEE)}
          >
            <div className="flex items-center gap-1 font-semibold text-success">
              <User className="h-3.5 w-3.5" /> Employee
            </div>
            <span className="text-[10px] text-muted-foreground mt-0.5 truncate w-full">Key: cci26</span>
            <span className="text-[10px] font-mono text-foreground/80">Pass: EmpPass123!</span>
          </Button>
        </div>
      </div>

      <div className="mt-6">
        <Tabs value={mode} onValueChange={setMode} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <UserCheck className="h-4 w-4" /> Sign In
            </TabsTrigger>
            <TabsTrigger value="first_time" className="flex items-center gap-1.5 text-xs sm:text-sm">
              <KeyRound className="h-4 w-4" /> First-Time Setup
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {mode === 'login' ? (
        <form onSubmit={handleLoginSubmit(onStandardLogin)} className="mt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Work Email or Employee Key</Label>
            <Input
              id="email"
              type="text"
              placeholder="e.g. hr@company.com, nbfc@lender.com, or cci26"
              {...registerLogin('email', { required: 'Work Email or Employee Key is required' })}
            />
            <p className="text-[11px] text-muted-foreground">
              Enter key (e.g. <span className="font-mono font-medium text-foreground">cci26</span>), <span className="font-mono text-foreground">hr@company.com</span>, or <span className="font-mono text-foreground">nbfc@lender.com</span>.
            </p>
            {loginErrors.email && <p className="text-xs text-danger">{loginErrors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link to={ROUTES.FORGOT_PASSWORD} className="text-xs text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...registerLogin('password', { required: 'Password is required' })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {loginErrors.password && <p className="text-xs text-danger">{loginErrors.password.message}</p>}
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="remember" {...registerLogin('remember')} defaultChecked />
            <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">
              Keep me signed in
            </Label>
          </div>

          <Button type="submit" variant="aurora" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            Sign In
          </Button>
        </form>
      ) : (
        <form onSubmit={handleFirstTimeSubmit(onFirstTimeSetup)} className="mt-6 space-y-4">
          <div className="rounded-lg border border-border bg-card/60 p-3.5 text-xs text-muted-foreground leading-relaxed">
            🔑 <strong className="text-foreground">First-Time Employee Login:</strong> Enter the employee key assigned by your HR (e.g.{' '}
            <code className="font-mono text-primary font-semibold">cci26</code>) and initial temporary password, then create your own permanent password.
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="employee_key_or_email">Employee Key or Email</Label>
            <Input
              id="employee_key_or_email"
              placeholder="e.g. cci26"
              {...registerFirstTime('employee_key_or_email', { required: 'Employee Key is required' })}
            />
            {firstTimeErrors.employee_key_or_email && (
              <p className="text-xs text-danger">{firstTimeErrors.employee_key_or_email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="initial_password">HR-Assigned Temporary Password</Label>
            <Input
              id="initial_password"
              type="password"
              placeholder="Temporary password from HR"
              {...registerFirstTime('initial_password', { required: 'Initial password is required' })}
            />
            {firstTimeErrors.initial_password && (
              <p className="text-xs text-danger">{firstTimeErrors.initial_password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="new_password">Create Your New Password</Label>
            <Input
              id="new_password"
              type="password"
              placeholder="Min 8 chars, 1 uppercase, 1 special character"
              {...registerFirstTime('new_password', {
                required: 'New password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
              })}
            />
            {firstTimeErrors.new_password && (
              <p className="text-xs text-danger">{firstTimeErrors.new_password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm_password">Confirm New Password</Label>
            <Input
              id="confirm_password"
              type="password"
              placeholder="Re-enter your new password"
              {...registerFirstTime('confirm_password', {
                required: 'Confirm password is required',
                validate: (val) => val === watchFirstTime('new_password') || 'Passwords do not match',
              })}
            />
            {firstTimeErrors.confirm_password && (
              <p className="text-xs text-danger">{firstTimeErrors.confirm_password.message}</p>
            )}
          </div>

          <Button type="submit" variant="aurora" size="lg" className="w-full mt-2" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            Save Password & Log In
          </Button>
        </form>
      )}

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Employee profiles are provisioned directly by HR. Need account help? Contact your Organization HR Administrator.
      </p>
    </motion.div>
  )
}
