
import { GeminiCore } from '../gemini_core';
import { FinancialAudit, INITIAL_TEMPLATE_CATEGORIES } from '@/types/accountant';

// Mock the GeminiCore class
jest.mock('../gemini_core', () => {
    return {
        GeminiCore: jest.fn().mockImplementation(() => {
            return {
                performFinancialAudit: jest.fn().mockResolvedValue({
                    success: true,
                    data: [
                        {
                            id: 'mock-flag-id',
                            categoryId: 'mock-cat-id',
                            severity: 'warning',
                            title: 'Mock Warning',
                            message: 'You spend too much.',
                            suggestedAction: 'Spend less.'
                        }
                    ]
                }),
                generateFinalReport: jest.fn().mockResolvedValue({
                    success: true,
                    data: {
                        executiveSummary: 'Mock Summary',
                        spendingAnalysis: [],
                        proposedBudget: [],
                        moneyManagementAdvice: [],
                        reportGeneratedAt: '2023-01-01',
                        version: '2.0'
                    }
                })
            }
        })
    }
});

describe('GeminiCore Service (Mocked)', () => {
    let gemini: GeminiCore;

    beforeEach(() => {
        gemini = new GeminiCore();
    });

    it('should initialize successfully', () => {
        expect(gemini).toBeDefined();
    });

    it('should return mock data for audit', async () => {
        const mockAudit: FinancialAudit = {
            version: '2.0',
            lastUpdated: '2023-01-01',
            status: 'data_entry',
            monthlyIncome: 5000,
            categories: [],
            flags: [],
            resolutions: []
        };
        const result = await gemini.performFinancialAudit(mockAudit);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data[0].title).toBe('Mock Warning');
        }
    });
});
