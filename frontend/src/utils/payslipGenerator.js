/**
 * Utility to generate and download official Salary Slips / Payslips.
 */

function numberToWords(amount) {
  const single = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  function convertTwoDigits(n) {
    if (n < 10) return single[n]
    if (n >= 10 && n < 20) return teens[n - 10]
    return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + single[n % 10] : '')
  }

  function convertThreeDigits(n) {
    let str = ''
    if (Math.floor(n / 100) > 0) {
      str += single[Math.floor(n / 100)] + ' Hundred '
      n %= 100
    }
    if (n > 0) {
      str += convertTwoDigits(n)
    }
    return str.trim()
  }

  if (amount === 0) return 'Zero Rupees Only'

  let n = Math.floor(amount)
  let crore = Math.floor(n / 10000000)
  n %= 10000000
  let lakh = Math.floor(n / 100000)
  n %= 100000
  let thousand = Math.floor(n / 1000)
  n %= 1000
  let hundred = n

  let res = ''
  if (crore > 0) res += convertThreeDigits(crore) + ' Crore '
  if (lakh > 0) res += convertThreeDigits(lakh) + ' Lakh '
  if (thousand > 0) res += convertThreeDigits(thousand) + ' Thousand '
  if (hundred > 0) res += convertThreeDigits(hundred) + ' '

  return (res.trim() + ' Rupees Only').replace(/\s+/g, ' ')
}

export function generatePayslipHTML(payslip, user = {}) {
  const periodDate = new Date(payslip.period || '2026-07-01')
  const periodFormatted = periodDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
  
  const gross = payslip.gross || 148000
  const net = payslip.net || 128000
  const totalDeductions = gross - net

  // Realistic breakdown calculation
  const basic = Math.round(gross * 0.5)
  const hra = Math.round(gross * 0.25)
  const specialAllowance = Math.round(gross * 0.15)
  const conveyance = gross - basic - hra - specialAllowance

  const pf = 1800
  const pt = 200
  const tds = Math.max(0, totalDeductions - pf - pt)

  const employeeName = user.name || user.full_name || 'Rahul Kumar'
  const employeeId = user.id || 'EMP-9024'
  const designation = user.designation || 'Senior Software Engineer'
  const department = user.department || 'Engineering & Platform'

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Payslip - ${payslip.id} - ${periodFormatted}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1e293b;
      background: #f8fafc;
      padding: 40px 20px;
    }
    .payslip-container {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 36px;
      box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #6366f1;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .company-title {
      font-size: 24px;
      font-weight: 700;
      color: #4f46e5;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .company-subtitle {
      font-size: 12px;
      color: #64748b;
      margin-top: 4px;
    }
    .payslip-badge {
      text-align: right;
    }
    .badge-title {
      font-size: 16px;
      font-weight: 700;
      color: #0f172a;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge-period {
      font-size: 13px;
      font-weight: 600;
      color: #4f46e5;
      margin-top: 2px;
    }
    .badge-id {
      font-size: 11px;
      color: #94a3b8;
    }
    .section-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px 20px;
      margin-bottom: 24px;
    }
    .info-group {
      font-size: 13px;
    }
    .info-row {
      display: flex;
      margin-bottom: 8px;
    }
    .info-row:last-child {
      margin-bottom: 0;
    }
    .info-label {
      width: 130px;
      font-weight: 500;
      color: #64748b;
    }
    .info-value {
      font-weight: 600;
      color: #0f172a;
    }
    .breakdown-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      font-size: 13px;
    }
    .breakdown-table th {
      background: #f1f5f9;
      color: #334155;
      font-weight: 600;
      text-align: left;
      padding: 10px 14px;
      border: 1px solid #e2e8f0;
    }
    .breakdown-table td {
      padding: 10px 14px;
      border: 1px solid #e2e8f0;
    }
    .breakdown-table .amount {
      text-align: right;
      font-variant-numeric: tabular-nums;
    }
    .total-row {
      font-weight: 700;
      background: #f8fafc;
    }
    .net-pay-banner {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: #ffffff;
      border-radius: 8px;
      padding: 18px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .net-pay-label {
      font-size: 14px;
      font-weight: 500;
      opacity: 0.9;
    }
    .net-pay-words {
      font-size: 12px;
      opacity: 0.85;
      margin-top: 3px;
      font-style: italic;
    }
    .net-pay-amount {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      font-size: 11px;
      color: #94a3b8;
    }
    .signature-box {
      text-align: center;
      width: 180px;
    }
    .sig-line {
      border-bottom: 1px dashed #cbd5e1;
      height: 36px;
      margin-bottom: 6px;
    }
    .no-print {
      margin-top: 24px;
      text-align: center;
    }
    .print-btn {
      background: #4f46e5;
      color: #fff;
      border: none;
      padding: 10px 24px;
      font-size: 14px;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
    }
    .print-btn:hover {
      background: #4338ca;
    }
    @media print {
      body {
        background: #ffffff;
        padding: 0;
      }
      .payslip-container {
        border: none;
        box-shadow: none;
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>

  <div class="payslip-container">
    <div class="header">
      <div>
        <div class="company-title">⚡ SalaryFund AI Technologies</div>
        <div class="company-subtitle">Bangalore, Karnataka, India • support@salaryfund.ai</div>
      </div>
      <div class="payslip-badge">
        <div class="badge-title">Salary Slip</div>
        <div class="badge-period">${periodFormatted}</div>
        <div class="badge-id">Ref: ${payslip.id}</div>
      </div>
    </div>

    <div class="section-grid">
      <div class="info-group">
        <div class="info-row">
          <span class="info-label">Employee Name:</span>
          <span class="info-value">${employeeName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Employee ID:</span>
          <span class="info-value">${employeeId}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Department:</span>
          <span class="info-value">${department}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Designation:</span>
          <span class="info-value">${designation}</span>
        </div>
      </div>

      <div class="info-group">
        <div class="info-row">
          <span class="info-label">Bank Name:</span>
          <span class="info-value">HDFC Bank</span>
        </div>
        <div class="info-row">
          <span class="info-label">A/C Number:</span>
          <span class="info-value">•••• •••• 9821</span>
        </div>
        <div class="info-row">
          <span class="info-label">PAN Number:</span>
          <span class="info-value">ABCDE1234F</span>
        </div>
        <div class="info-row">
          <span class="info-label">Payment Mode:</span>
          <span class="info-value">Direct Deposit (NEFT)</span>
        </div>
      </div>
    </div>

    <table class="breakdown-table">
      <thead>
        <tr>
          <th style="width: 35%;">Earnings</th>
          <th style="width: 15%; text-align: right;">Amount (₹)</th>
          <th style="width: 35%;">Deductions</th>
          <th style="width: 15%; text-align: right;">Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Basic Salary</td>
          <td class="amount">${basic.toLocaleString('en-IN')}</td>
          <td>Provident Fund (PF)</td>
          <td class="amount">${pf.toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td>House Rent Allowance (HRA)</td>
          <td class="amount">${hra.toLocaleString('en-IN')}</td>
          <td>Professional Tax (PT)</td>
          <td class="amount">${pt.toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td>Special Allowance</td>
          <td class="amount">${specialAllowance.toLocaleString('en-IN')}</td>
          <td>Income Tax (TDS)</td>
          <td class="amount">${tds.toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td>Conveyance Allowance</td>
          <td class="amount">${conveyance.toLocaleString('en-IN')}</td>
          <td>Loan / Advance Deductions</td>
          <td class="amount">0</td>
        </tr>
        <tr class="total-row">
          <td>Total Gross Earnings</td>
          <td class="amount">₹${gross.toLocaleString('en-IN')}</td>
          <td>Total Deductions</td>
          <td class="amount">₹${totalDeductions.toLocaleString('en-IN')}</td>
        </tr>
      </tbody>
    </table>

    <div class="net-pay-banner">
      <div>
        <div class="net-pay-label">Net Take-Home Salary</div>
        <div class="net-pay-words">${numberToWords(net)}</div>
      </div>
      <div class="net-pay-amount">₹${net.toLocaleString('en-IN')}</div>
    </div>

    <div class="footer">
      <div>
        <p>• This is a computer-generated salary slip and does not require a physical signature.</p>
        <p>• Generated on ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} via SalaryFund AI Payroll Engine.</p>
      </div>
      <div class="signature-box">
        <div class="sig-line"></div>
        <span>Authorized Signatory</span>
      </div>
    </div>
  </div>

  <div class="no-print">
    <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
  </div>

  <script>
    // Auto trigger print/save dialog on load
    window.addEventListener('load', function() {
      setTimeout(function() {
        window.print();
      }, 500);
    });
  </script>
</body>
</html>
`
}

export function downloadPayslip(payslip, user) {
  const htmlContent = generatePayslipHTML(payslip, user)
  const blob = new Blob([htmlContent], { type: 'text/html' })
  const url = URL.createObjectURL(blob)

  // Open in a new tab which triggers automatic print to PDF dialog
  const printWindow = window.open(url, '_blank')
  if (!printWindow) {
    // Fallback: download the HTML file directly if popups are blocked
    const a = document.createElement('a')
    a.href = url
    a.download = `Payslip_${payslip.id}_${payslip.period || '2026'}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
}
