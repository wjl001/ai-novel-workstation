import { describe, it, expect, vi } from 'vitest';

// We extract the logic into standalone functions to test them easily
const isInteger = (val: any): val is number => typeof val === 'number' && Number.isInteger(val);

const getTargetWordCount = (minVal: any, maxVal: any): number => {
  const min = isInteger(minVal) ? minVal : 500;
  const max = isInteger(maxVal) ? maxVal : 1500;
  const mid = Math.floor((min + max) / 2);
  const variance = Math.floor(Math.abs(mid) * 0.05); // ensure positive variance
  const rand = Math.random();
  // We want rand * variance * 2 to range from 0 to 2*variance
  // And subtract variance to get range from -variance to +variance
  return mid + (Math.floor(rand * variance * 2) - variance);
};

const validateGeneratedWordCount = (content: string, min: number, max: number): boolean => {
  const length = content.replace(/\s+/g, '').length;
  return length >= min && length <= max;
};

describe('Word Count Logic Tests', () => {
  it('isInteger should return true for integers', () => {
    expect(isInteger(100)).toBe(true);
    expect(isInteger(0)).toBe(true);
    expect(isInteger(-50)).toBe(true);
  });

  it('isInteger should return false for non-integers', () => {
    expect(isInteger(10.5)).toBe(false);
    expect(isInteger('100')).toBe(false);
    expect(isInteger(null)).toBe(false);
    expect(isInteger(undefined)).toBe(false);
    expect(isInteger({})).toBe(false);
  });

  it('getTargetWordCount should use default bounds if inputs are invalid', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    // default min 500, max 1500, mid 1000, variance 50. rand=0.5 -> offset = floor(0.5*100)-50 = 0.
    expect(getTargetWordCount(null, undefined)).toBe(1000);
    vi.restoreAllMocks();
  });

  it('getTargetWordCount should use provided bounds', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    expect(getTargetWordCount(200, 400)).toBe(300); // variance 15
    vi.restoreAllMocks();
  });

  it('getTargetWordCount should apply variance correctly (min variance)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    // mid 1000, var 50, rand 0 -> offset = -50 -> 950
    expect(getTargetWordCount(500, 1500)).toBe(950);
    vi.restoreAllMocks();
  });

  it('getTargetWordCount should apply variance correctly (max variance)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999);
    // mid 1000, var 50, rand 0.999 -> offset = floor(99.9) - 50 = 49 -> 1049
    expect(getTargetWordCount(500, 1500)).toBe(1049);
    vi.restoreAllMocks();
  });

  it('validateGeneratedWordCount should correctly strip whitespaces and check bounds', () => {
    const text = '这 是\n一 个 测 试。'; // 7 non-whitespace chars
    expect(validateGeneratedWordCount(text, 5, 10)).toBe(true);
    expect(validateGeneratedWordCount(text, 8, 10)).toBe(false); // too short
    expect(validateGeneratedWordCount(text, 1, 5)).toBe(false); // too long
  });

  it('validateGeneratedWordCount should work with empty strings', () => {
    expect(validateGeneratedWordCount('', 0, 10)).toBe(true);
    expect(validateGeneratedWordCount('   \n  ', 0, 10)).toBe(true);
    expect(validateGeneratedWordCount('', 1, 10)).toBe(false);
  });
  
  it('validateGeneratedWordCount boundary checks', () => {
    const text = '12345';
    expect(validateGeneratedWordCount(text, 5, 5)).toBe(true);
    expect(validateGeneratedWordCount(text, 6, 10)).toBe(false);
    expect(validateGeneratedWordCount(text, 1, 4)).toBe(false);
  });

  describe('Generation Retry Mock Logic', () => {
    it('Should retry up to 3 times on failure', async () => {
      // Let's test the retry mechanism concept using a mocked attemptGeneration
      let attempts = 0;
      const maxRetries = 3;
      const attemptGeneration = async (): Promise<boolean> => {
        attempts++;
        return false; // Always fail
      };

      const runGeneration = async () => {
        let retryCount = 0;
        while (retryCount <= maxRetries) {
          const success = await attemptGeneration();
          if (success) return true;
          retryCount++;
        }
        return false;
      };

      const result = await runGeneration();
      expect(result).toBe(false);
      expect(attempts).toBe(4); // 1 initial + 3 retries
    });

    it('Should succeed on 2nd retry', async () => {
      let attempts = 0;
      const maxRetries = 3;
      const attemptGeneration = async (): Promise<boolean> => {
        attempts++;
        return attempts === 3; // Fails 1st and 2nd, succeeds 3rd
      };

      const runGeneration = async () => {
        let retryCount = 0;
        while (retryCount <= maxRetries) {
          const success = await attemptGeneration();
          if (success) return true;
          retryCount++;
        }
        return false;
      };

      const result = await runGeneration();
      expect(result).toBe(true);
      expect(attempts).toBe(3); // 1 initial + 2 retries
    });

    it('Should succeed immediately', async () => {
      let attempts = 0;
      const attemptGeneration = async (): Promise<boolean> => {
        attempts++;
        return true;
      };

      const runGeneration = async () => {
        let retryCount = 0;
        while (retryCount <= 3) {
          const success = await attemptGeneration();
          if (success) return true;
          retryCount++;
        }
        return false;
      };

      const result = await runGeneration();
      expect(result).toBe(true);
      expect(attempts).toBe(1);
    });

    it('Sentry reporting mock works', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const reportToSentry = (msg: string, meta: any) => {
        console.error('[Sentry Mock Report]', msg, meta);
      };
      
      reportToSentry('Generation Word Count Mismatch', { retryCount: 1 });
      expect(consoleSpy).toHaveBeenCalledWith('[Sentry Mock Report]', 'Generation Word Count Mismatch', { retryCount: 1 });
      consoleSpy.mockRestore();
    });

    it('validateGeneratedWordCount with special characters', () => {
      const text = 'hello world!';
      expect(validateGeneratedWordCount(text, 10, 11)).toBe(true); // 'helloworld!' -> 11 chars
    });
    
    it('getTargetWordCount handles edge cases like 0 or negative', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      expect(getTargetWordCount(0, 0)).toBe(0);
      expect(getTargetWordCount(-10, -5)).toBe(-8); // mid -8, var 0 (since 0.05 * 8 = 0.4 -> floor -> 0)
      vi.restoreAllMocks();
    });

    it('getTargetWordCount handles min > max gracefully if implemented', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      // mid 15, var 0
      expect(getTargetWordCount(20, 10)).toBe(15);
      vi.restoreAllMocks();
    });
    
    it('getTargetWordCount ensures numeric variance limits', () => {
      vi.spyOn(Math, 'random').mockReturnValue(0.5);
      expect(getTargetWordCount(1000, 2000)).toBe(1500); // var 75 -> rand=0.5 -> floor(0.5*150)-75 = 0
      vi.restoreAllMocks();
    });
  });
});
