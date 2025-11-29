
import { generateWorkoutPlan } from '../workout-generator';
import { GeminiCore } from '../../services/gemini_core';

// Mock the global logger and sonner toast
global.console.error = jest.fn();
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn()
  },
}));

// Mock GeminiCore
jest.mock('../../services/gemini_core', () => {
  return {
    GeminiCore: jest.fn().mockImplementation(() => ({
      generateJSON: jest.fn()
    }))
  };
});

describe('generateWorkoutPlan', () => {
  let mockGenerateJSON: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    // Setup the mock instance method
    mockGenerateJSON = jest.fn();
    (GeminiCore as unknown as jest.Mock).mockImplementation(() => ({
      generateJSON: mockGenerateJSON
    }));
  });

  test('should handle API success wrapper { success: true, data: T }', async () => {
    const mockPlanData = {
      workoutPlan: {
        name: 'Test Workout',
        focus: 'Test Focus',
        difficulty: 'beginner',
        exercises: []
      }
    };

    // Setup the mock to return the new wrapper format
    mockGenerateJSON.mockResolvedValue({
      success: true,
      data: mockPlanData
    });

    const onProgress = jest.fn();
    const result = await generateWorkoutPlan('Test User', onProgress);

    expect(mockGenerateJSON).toHaveBeenCalled();
    expect(result).not.toBeNull();
    expect(result?.name).toBe('Test Workout');
  });

  test('should handle API error wrapper { success: false, ... }', async () => {
    // Setup the mock to return an error wrapper
    mockGenerateJSON.mockResolvedValue({
      success: false,
      code: 'TEST_ERROR',
      message: 'Something went wrong'
    });

    const onProgress = jest.fn();
    const result = await generateWorkoutPlan('Test User', onProgress);

    expect(result).toBeNull();
  });

  test('should handle exception during generation', async () => {
    mockGenerateJSON.mockRejectedValue(new Error('Network error'));

    const onProgress = jest.fn();
    const result = await generateWorkoutPlan('Test User', onProgress);

    expect(result).toBeNull();
  });
});
