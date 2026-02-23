import { describe, it, expect, vi, afterEach } from 'vitest';
import RefineReporter from '@reporter/refine-reporter';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs to prevent actual file writes during testing
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn()
}));

describe('RefineReporter', () => {
  afterEach(() => {
    vi.clearAllMocks();
    delete process.env.REFINE_OUTPUT_PATH;
  });

  it('initializes with default output path', () => {
    delete process.env.REFINE_OUTPUT_PATH;
    const reporter = new RefineReporter();
    expect((reporter as any).outputPath).toBe('./refine-output');
  });

  it('initializes with REFINE_OUTPUT_PATH env var', () => {
    process.env.REFINE_OUTPUT_PATH = '/custom/path';
    const reporter = new RefineReporter();
    expect((reporter as any).outputPath).toBe('/custom/path');
  });

  it('writes a stub report.json onEnd', async () => {
    const reporter = new RefineReporter();
    
    vi.mocked(fs.existsSync).mockReturnValue(false);
    
    // Simulate Playwright FullResult
    const mockResult = {
      status: 'passed' as const,
      duration: 5000,
      startTime: new Date()
    };

    await reporter.onEnd(mockResult);

    // Should create the session directory inside the CI project folder
    expect(fs.mkdirSync).toHaveBeenCalledWith(
      expect.stringContaining(path.join('refine-output', 'CI', 'sessions')), 
      { recursive: true }
    );
    
    // We can't predict the exact sessionId in the path, so we check that writeFileSync
    // was called with a path containing 'report.json' and the correct content
    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const reportJsonCall = writeCalls.find(call => call[0].toString().endsWith('report.json'));
    
    expect(reportJsonCall).toBeDefined();
    expect(reportJsonCall![1]).toContain('"source": "playwright-reporter"');
    expect(reportJsonCall![1]).toContain('"status": "COMPLETED"');
  });
});
