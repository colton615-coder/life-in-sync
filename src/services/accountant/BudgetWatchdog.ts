import { FinancialAudit, FinancialReport } from '@/types/financial_report'; // Wait, types might be mixed. Let's check imports carefully.
import { FinancialAudit } from '@/types/accountant';
import { FinancialReport } from '@/types/financial_report';
import { differenceInDays, parseISO, isSameMonth } from 'date-fns';

export type InterventionType = 'Runway' | 'Variance';

export interface InterventionEventDetail {
    type: InterventionType;
    message: string;
    data?: any;
}

const COOLDOWN_HOURS = 24;
const CHECK_INTERVAL_MS = 15 * 60 * 1000; // 15 Minutes

class BudgetWatchdogService {
    private intervalId: NodeJS.Timeout | null = null;

    constructor() {
        // Bind methods
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.runChecks = this.runChecks.bind(this);
    }

    public start() {
        if (this.intervalId) return; // Already running

        console.log('[BudgetWatchdog] Service Started');

        // Run immediately on start
        this.runChecks();

        this.intervalId = setInterval(this.runChecks, CHECK_INTERVAL_MS);

        // Expose test trigger
        // @ts-ignore
        window.triggerWatchdog = (params: { type: InterventionType }) => {
            console.log(`[BudgetWatchdog] Manual Trigger: ${params.type}`);
            this.forceTrigger(params.type);
        };
    }

    public stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('[BudgetWatchdog] Service Stopped');
        }
    }

    private async runChecks() {
        try {
            // 1. Load Data
            // We use direct localStorage access because we are in a service, not a React component hook.
            const auditStr = localStorage.getItem('finance-audit-v2');
            const reportStr = localStorage.getItem('finance-report-v2');

            if (!auditStr || !reportStr) return;

            const audit: FinancialAudit = JSON.parse(auditStr);
            const report: FinancialReport = JSON.parse(reportStr);

            // 2. Check Runway (Condition A)
            if (!this.isCoolingDown('Runway')) {
                const runwayAlert = this.checkRunway(audit);
                if (runwayAlert) {
                    this.dispatchIntervention('Runway', runwayAlert);
                    return; // Prioritize Runway over Variance
                }
            }

            // 3. Check Variance (Condition B)
            if (!this.isCoolingDown('Variance')) {
                const varianceAlert = this.checkVariance(audit, report);
                if (varianceAlert) {
                    this.dispatchIntervention('Variance', varianceAlert);
                }
            }

        } catch (error) {
            console.error('[BudgetWatchdog] Error running checks:', error);
        }
    }

    /**
     * Condition A: Runway Risk
     * Rolling 30-Day Runway < 30 Days
     */
    private checkRunway(audit: FinancialAudit): string | null {
        const liquidAssets = audit.liquidAssets || 0;
        if (liquidAssets <= 0) return "Critical: Liquid assets are depleted.";

        // Calculate Rolling 30-Day Burn Rate
        // Sum of all dated transactions in the last 30 days
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        let totalSpentLast30Days = 0;

        audit.categories.forEach(cat => {
            cat.subcategories.forEach(sub => {
                if (sub.dateAdded && sub.amount) {
                    const date = parseISO(sub.dateAdded);
                    if (date >= thirtyDaysAgo && date <= now) {
                        totalSpentLast30Days += sub.amount;
                    }
                }
            });
        });

        // If no data yet (cold start), we can't really calculate rolling burn rate accurately.
        // However, the requirement says "Actual Burn Rate". If 0 spend, burn rate is 0, runway is infinite.
        if (totalSpentLast30Days === 0) return null;

        const dailyBurnRate = totalSpentLast30Days / 30;
        const runwayDays = liquidAssets / dailyBurnRate;

        if (runwayDays < 30) {
            return `Runway Alert: Based on your last 30 days of spending, you have ${Math.floor(runwayDays)} days of liquidity remaining.`;
        }

        return null;
    }

    /**
     * Condition B: High Variance
     * Major category spend > 50% in first 7 days
     */
    private checkVariance(audit: FinancialAudit, report: FinancialReport): string | null {
        const now = new Date();
        const currentDay = now.getDate(); // 1-31

        // Only check within the first 7 days
        if (currentDay > 7) return null;

        // Iterate through categories in the PROPOSED BUDGET (source of truth for limits)
        for (const budgetCat of report.proposedBudget) {
            const budgetLimit = budgetCat.allocatedAmount;
            if (budgetLimit <= 0) continue;

            // Calculate actual spend for this category in the CURRENT MONTH
            // We match by name because IDs might differ between Audit and Report (though they should align)
            // Ideally use ID if possible. V2/V3 report usually has categoryId.

            // Find corresponding category in Audit (Actuals)
            const auditCat = audit.categories.find(c => c.name === budgetCat.categoryName); // Fallback to name match or ID
            if (!auditCat) continue;

            let currentMonthSpend = 0;

            auditCat.subcategories.forEach(sub => {
                if (sub.dateAdded && sub.amount) {
                    const date = parseISO(sub.dateAdded);
                    if (isSameMonth(date, now)) {
                        currentMonthSpend += sub.amount;
                    }
                }
            });

            // Threshold: 50%
            if (currentMonthSpend > (budgetLimit * 0.5)) {
                return `Variance Alert: You have spent ${Math.round((currentMonthSpend / budgetLimit) * 100)}% of your ${budgetCat.categoryName} budget in the first ${currentDay} days.`;
            }
        }

        return null;
    }

    // --- Cooldown Management ---

    private isCoolingDown(type: InterventionType): boolean {
        const key = `watchdog-cooldown-${type}`;
        const lastTriggered = localStorage.getItem(key);
        if (!lastTriggered) return false;

        const date = parseISO(lastTriggered);
        const diffHours = (new Date().getTime() - date.getTime()) / (1000 * 60 * 60);

        return diffHours < COOLDOWN_HOURS;
    }

    private setCooldown(type: InterventionType) {
        localStorage.setItem(`watchdog-cooldown-${type}`, new Date().toISOString());
    }

    // --- Event Dispatch ---

    private dispatchIntervention(type: InterventionType, message: string) {
        this.setCooldown(type);

        const event = new CustomEvent<InterventionEventDetail>('finance-intervention', {
            detail: { type, message }
        });
        window.dispatchEvent(event);
    }

    // --- Test Helpers ---
    private forceTrigger(type: InterventionType) {
        if (type === 'Runway') {
            this.dispatchIntervention('Runway', "TEST ALERT: Runway is critically low (<30 Days).");
        } else if (type === 'Variance') {
            this.dispatchIntervention('Variance', "TEST ALERT: Spending velocity is too high (>50% in 7 days).");
        }
    }
}

export const BudgetWatchdog = new BudgetWatchdogService();
