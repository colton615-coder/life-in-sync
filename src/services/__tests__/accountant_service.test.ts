
import { AccountantService } from '../accountant/accountant-service';
import { FinancialAudit } from '@/types/accountant';

// Mock GeminiCore to avoid real API calls
jest.mock('../gemini_core', () => {
    return {
        GeminiCore: jest.fn().mockImplementation(() => {
            return {
                generateJSONWithRepair: jest.fn().mockImplementation((prompt, schema) => {
                     // Check if it's an audit or report request based on prompt content (simple heuristic)
                     if (prompt.includes('performFinancialAudit') || prompt.includes('flags')) {
                        return Promise.resolve({
                            success: true,
                            data: {
                                flags: [
                                    {
                                        categoryId: 'cat-1',
                                        severity: 'warning',
                                        title: 'Mock Warning',
                                        message: 'You spend too much.',
                                        suggestedAction: 'Spend less.'
                                    }
                                ]
                            }
                        });
                     }
                     // Fallback for report
                     return Promise.resolve({
                        success: true,
                        data: {
                            executiveSummary: 'Mock Summary',
                            spendingAnalysis: [],
                            proposedBudget: [],
                            moneyManagementAdvice: [],
                            reportGeneratedAt: '2023-01-01',
                            version: '2.0'
                        }
                    });
                })
            }
        })
    }
});

describe('AccountantService', () => {
    let service: AccountantService;

    beforeEach(() => {
        service = new AccountantService();
    });

    it('should perform financial audit and return hydration flags', async () => {
        const mockAudit: FinancialAudit = {
            version: '2.0',
            lastUpdated: '2023-01-01',
            status: 'data_entry',
            monthlyIncome: 5000,
            categories: [{ id: 'cat-1', name: 'Food', subcategories: [{ id: 'sub-1', name: 'Groceries', amount: 500 }] }],
            flags: [],
            resolutions: []
        };

        const result = await service.performFinancialAudit(mockAudit);

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toHaveLength(1);
            expect(result.data[0].title).toBe('Mock Warning');
            expect(result.data[0].id).toBeDefined(); // Test hydration
        }
    });
});
