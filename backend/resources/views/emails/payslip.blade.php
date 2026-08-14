<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial, sans-serif; color: #16203a; background: #f6f7fb; padding: 24px; }
        .card { max-width: 480px; margin: 0 auto; background: #ffffff; border: 1px solid #e7eaf3; border-radius: 12px; overflow: hidden; }
        .bar { height: 6px; background: #0f1a3d; }
        .content { padding: 24px; }
        h1 { font-size: 16px; margin: 0 0 4px; }
        .muted { color: #6b7590; font-size: 13px; margin: 0 0 16px; }
        table { width: 100%; border-collapse: collapse; font-size: 14px; margin-top: 12px; }
        td { padding: 4px 0; }
        .label { color: #6b7590; }
        .value { text-align: right; font-weight: 600; }
        .total-row td { border-top: 1px solid #e7eaf3; padding-top: 8px; font-weight: 700; }
        .net { background: #0f1a3d; color: #ffffff; padding: 12px 16px; border-radius: 8px; margin-top: 16px; display: flex; justify-content: space-between; font-weight: 700; }
    </style>
</head>
<body>
    <div class="card">
        <div class="bar"></div>
        <div class="content">
            <h1>Payslip — {{ $run->cutoffLabel ?? $run->cutoff_label }}</h1>
            <p class="muted">
                Pay period {{ $run->pay_period_start->format('M j, Y') }} – {{ $run->pay_period_end->format('M j, Y') }}
                &middot; Pay date {{ $run->pay_date->format('M j, Y') }}
            </p>

            <p>Hi {{ $payslip->employee_name }},</p>
            <p class="muted">Here is a summary of your pay for this period.</p>

            <table>
                <tr><td class="label">Basic Pay</td><td class="value">₱{{ number_format($payslip->basic_pay, 2) }}</td></tr>
                <tr><td class="label">Overtime Pay</td><td class="value">₱{{ number_format($payslip->overtime_pay, 2) }}</td></tr>
                <tr><td class="label">Gross Pay</td><td class="value">₱{{ number_format($payslip->gross_pay, 2) }}</td></tr>
                <tr><td class="label">SSS</td><td class="value">-₱{{ number_format($payslip->sss_contribution, 2) }}</td></tr>
                <tr><td class="label">PhilHealth</td><td class="value">-₱{{ number_format($payslip->philhealth_contribution, 2) }}</td></tr>
                <tr><td class="label">Pag-IBIG</td><td class="value">-₱{{ number_format($payslip->pagibig_contribution, 2) }}</td></tr>
                <tr><td class="label">Withholding Tax</td><td class="value">-₱{{ number_format($payslip->withholding_tax, 2) }}</td></tr>
                <tr><td class="label">Other Deductions</td><td class="value">-₱{{ number_format($payslip->other_deductions, 2) }}</td></tr>
                <tr class="total-row"><td>Total Deductions</td><td class="value">₱{{ number_format($payslip->total_deductions, 2) }}</td></tr>
            </table>

            <div class="net">
                <span>Net Pay</span>
                <span>₱{{ number_format($payslip->net_pay, 2) }}</span>
            </div>

            <p class="muted" style="margin-top:20px;">
                This is a system-generated payslip. For questions, contact your HR administrator.
            </p>
        </div>
    </div>
</body>
</html>
