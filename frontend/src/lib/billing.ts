/**
 * Calculates the total due amount including late fees using Compound Interest formula.
 * Formula: A = P * (1 + r)^n
 * 
 * @param principal - The original bill amount (P)
 * @param dailyRate - The daily interest rate (r) (e.g., 0.0005 for 0.05%)
 * @param daysOverdue - Number of days overdue (n)
 * @returns Object containing breakdown of total, penalty, and principal
 */
export function calculateTotalDue(principal: number, dailyRate: number, daysOverdue: number) {
    if (daysOverdue <= 0) {
        return {
            principal,
            penalty: 0,
            total: principal
        };
    }

    // A = P * (1 + r)^n
    const totalAmount = principal * Math.pow((1 + dailyRate), daysOverdue);
    const penalty = totalAmount - principal;

    return {
        principal,
        penalty: Number(penalty.toFixed(2)),
        total: Number(totalAmount.toFixed(2))
    };
}

export const CURRENCY_FORMAT = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
});
