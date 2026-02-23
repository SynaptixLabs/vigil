import type { Reporter, FullConfig, Suite, TestCase, TestResult, FullResult, TestStep } from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';
import type { Session, Bug, Action } from '@shared/types';
import { SessionStatus, BugPriority } from '@shared/types';
import { generateMarkdownReport } from '@core/report-generator';

/**
 * @file refine-reporter.ts
 * @description S04-06: Playwright reporter stub for exporting test results in Refine format.
 * Future CI integration will allow AI-run Playwright suites to generate session artifacts.
 */

export default class RefineReporter implements Reporter {
  private outputPath: string;
  private projectBaseUrl: string;
  private projectName: string;
  private actions: Action[] = [];
  private bugs: Bug[] = [];
  private sessionStartTime: number = Date.now();

  constructor() {
    // Determine output path from env or fallback to a local folder
    this.outputPath = process.env.REFINE_OUTPUT_PATH ?? './refine-output';
    this.projectBaseUrl = process.env.REFINE_BASE_URL ?? 'http://localhost';
    this.projectName = process.env.REFINE_PROJECT_NAME ?? 'CI';
  }

  onBegin(_config: FullConfig, suite: Suite): void {
    console.log(`[RefineReporter] Starting test run with ${suite.allTests().length} tests. Output: ${this.outputPath}`);
    this.sessionStartTime = Date.now();
  }

  onStepEnd(_test: TestCase, _result: TestResult, step: TestStep): void {
    if (step.category !== 'test.step' && step.category !== 'pw:api') return;
    
    // Map some common Playwright steps to Refine actions
    if (step.title.includes('page.goto')) {
      this.actions.push({
        id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        sessionId: '', // Set later
        timestamp: step.startTime.getTime(),
        type: 'navigation',
        pageUrl: step.title.replace('page.goto(', '').replace(')', '').replace(/['"]/g, ''),
        selectorStrategy: 'playwright'
      });
    } else if (step.title.includes('click')) {
      this.actions.push({
        id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        sessionId: '',
        timestamp: step.startTime.getTime(),
        type: 'click',
        pageUrl: this.projectBaseUrl,
        selector: step.title.split('locator(')[1]?.split(')')[0]?.replace(/['"]/g, '') || step.title,
        selectorStrategy: 'playwright'
      });
    }
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    if (result.status === 'failed' || result.status === 'timedOut') {
      console.log(`[RefineReporter] Test failed: ${test.title}`);
      
      const errorMsg = result.error?.message || result.errors?.[0]?.message || 'Unknown error';
      
      this.bugs.push({
        id: `bug-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        sessionId: '', // Set later
        type: 'bug',
        priority: BugPriority.P1, // CI failures are P1 by default
        status: 'open',
        title: `Test Failure: ${test.title}`,
        description: `Playwright test failed during CI.\n\nError:\n\`\`\`\n${errorMsg}\n\`\`\``,
        url: this.projectBaseUrl,
        timestamp: result.startTime.getTime() + result.duration
      });
    }
  }

  async onEnd(result: FullResult): Promise<void> {
    console.log(`[RefineReporter] Test run completed. Status: ${result.status}`);

    const dateStr = new Date().toISOString().split('T')[0];
    const seq = String(Date.now() % 1000).padStart(3, '0');
    const sessionId = `ats-${dateStr}-${seq}`;
    
    // Update IDs
    this.actions.forEach(a => a.sessionId = sessionId);
    this.bugs.forEach(b => b.sessionId = sessionId);

    // Create session object
    const session: Session = {
      id: sessionId,
      name: `CI Acceptance Test — ${this.projectName}`,
      description: `Automated Playwright run mapped to Refine format. Status: ${result.status}`,
      status: result.status === 'passed' ? SessionStatus.COMPLETED : SessionStatus.ERROR,
      project: this.projectName,
      outputPath: this.outputPath,
      tags: ['ci', 'automated'],
      startedAt: this.sessionStartTime,
      stoppedAt: Date.now(),
      duration: result.duration,
      pages: [this.projectBaseUrl],
      actionCount: this.actions.length,
      bugCount: this.bugs.length,
      featureCount: 0,
      screenshotCount: 0,
      recordMouseMove: false
    };

    // Prepare directory
    const sessionDir = path.join(this.outputPath, this.projectName, 'sessions', sessionId);
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }

    // 1. Write report.json
    const reportJson = {
      source: 'playwright-reporter',
      session,
      bugs: this.bugs,
      features: [],
      actions: this.actions,
      screenshots: []
    };
    fs.writeFileSync(
      path.join(sessionDir, 'report.json'),
      JSON.stringify(reportJson, null, 2)
    );

    // 2. Write report.md
    const reportMd = generateMarkdownReport(session, this.bugs, [], this.actions, []);
    fs.writeFileSync(
      path.join(sessionDir, 'report.md'),
      reportMd
    );
    
    // 3. Update dashboard if we can
    try {
      const dashboardModule = await import('../core/dashboard-generator');
      
      // Try to read existing sessions to rebuild dashboard
      const projectDir = path.join(this.outputPath, this.projectName);
      const sessionsDir = path.join(projectDir, 'sessions');
      
      const allSessions: Session[] = [];
      const allBugs: Bug[][] = [];
      
      if (fs.existsSync(sessionsDir)) {
        const dirs = fs.readdirSync(sessionsDir);
        for (const dir of dirs) {
          const jsonPath = path.join(sessionsDir, dir, 'report.json');
          if (fs.existsSync(jsonPath)) {
            try {
              const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
              if (data.session) {
                allSessions.push(data.session);
                allBugs.push(data.bugs || []);
              }
            } catch (e) {
              // Ignore invalid JSON
            }
          }
        }
      }
      
      const html = dashboardModule.generateProjectDashboard(allSessions, allBugs);
      fs.writeFileSync(path.join(projectDir, 'index.html'), html);
      console.log(`[RefineReporter] Regenerated Project Dashboard at ${path.join(projectDir, 'index.html')}`);
      
    } catch (err) {
      console.error('[RefineReporter] Failed to update dashboard HTML:', err);
    }

    console.log(`[RefineReporter] Wrote session artifacts to ${sessionDir}`);
  }
}
