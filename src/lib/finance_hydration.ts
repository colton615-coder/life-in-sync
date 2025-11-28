
import { FinancialAudit } from '../types/accountant';
import { FinancialReport } from '../types/financial_report';

/**
 * Hydrates the IDs in a loose Financial Report (where IDs might be missing)
 * using the original Audit Data as the source of truth.
 *
 * This solves the issue where AI generation often drops UUIDs.
 */
export function hydrateReportIds(looseReport: any, sourceAudit: FinancialAudit): FinancialReport {
    // Helper to find category ID by name
    const findCatId = (name: string): string => {
      const match = sourceAudit.categories.find(c => c.name.toLowerCase() === name.toLowerCase());
      return match ? match.id : crypto.randomUUID();
    };

    // Helper to find subcategory ID by name within a category
    const findSubId = (catId: string, subName: string): string => {
      const cat = sourceAudit.categories.find(c => c.id === catId);
      if (!cat) return crypto.randomUUID();
      const sub = cat.subcategories.find(s => s.name.toLowerCase() === subName.toLowerCase());
      return sub ? sub.id : crypto.randomUUID();
    };

    // Hydrate Spending Analysis
    const spendingAnalysis = looseReport.spendingAnalysis.map((item: any) => {
      // If AI provided an ID, use it. Otherwise lookup by name.
      const catId = item.categoryId || findCatId(item.categoryName);
      return {
        ...item,
        categoryId: catId
      };
    });

    // Hydrate Proposed Budget
    const proposedBudget = looseReport.proposedBudget.map((catItem: any) => {
      const catId = catItem.categoryId || findCatId(catItem.categoryName);
      return {
        ...catItem,
        categoryId: catId,
        subcategories: catItem.subcategories.map((subItem: any) => ({
          ...subItem,
          subcategoryId: subItem.subcategoryId || findSubId(catId, subItem.subcategoryName)
        }))
      };
    });

    return {
      ...looseReport,
      spendingAnalysis,
      proposedBudget
    } as FinancialReport;
}
