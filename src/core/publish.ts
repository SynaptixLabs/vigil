import type { Session, Bug, Feature, Action, Screenshot, RecordingChunk } from '@shared/types';
import { generateJsonReport, generateMarkdownReport } from './report-generator';
import { generatePlaywrightSpec } from './playwright-codegen';
import { generateReplayHtml } from './replay-bundler';

/**
 * @file publish.ts
 * @description R025: Downloads all session artifacts to a local project folder
 * via the chrome.downloads API.
 */

export async function publishSession(
  session: Session,
  bugs: Bug[],
  features: Feature[],
  actions: Action[],
  screenshots: Screenshot[],
  chunks: RecordingChunk[]
): Promise<void> {
  if (!session.project || !session.outputPath) {
    throw new Error('Cannot publish: Session is missing project or outputPath configuration.');
  }

  // Base directory format: <outputPath>/<project>/sessions/<sessionId>/
  const baseDir = `${session.outputPath}/${session.project}/sessions/${session.id}`;

  const downloads: Promise<number>[] = [];

  const triggerDownload = (content: string, filename: string, mimeType: string) => {
    return new Promise<number>((resolve, reject) => {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      chrome.downloads.download(
        {
          url,
          filename: `${baseDir}/${filename}`,
          saveAs: false, // Bypass save dialog
          conflictAction: 'overwrite',
        },
        (downloadId) => {
          URL.revokeObjectURL(url);
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else if (downloadId === undefined) {
            reject(new Error('Download failed without ID'));
          } else {
            resolve(downloadId);
          }
        }
      );
    });
  };

  const triggerBase64Download = (dataUrl: string, filename: string) => {
    return new Promise<number>(async (resolve, reject) => {
      try {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        chrome.downloads.download(
          {
            url,
            filename: `${baseDir}/${filename}`,
            saveAs: false,
            conflictAction: 'overwrite',
          },
          (downloadId) => {
            URL.revokeObjectURL(url);
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else if (downloadId === undefined) {
              reject(new Error('Download failed without ID'));
            } else {
              resolve(downloadId);
            }
          }
        );
      } catch (err) {
        reject(err);
      }
    });
  };

  try {
    // 1. JSON Report
    const json = generateJsonReport(session, bugs, features, actions, screenshots);
    downloads.push(triggerDownload(JSON.stringify(json, null, 2), 'report.json', 'application/json'));

    // 2. Markdown Report
    const md = generateMarkdownReport(session, bugs, features, actions, screenshots);
    downloads.push(triggerDownload(md, 'report.md', 'text/markdown'));

    // 3. Playwright Spec
    const spec = generatePlaywrightSpec(session, actions, bugs);
    downloads.push(triggerDownload(spec, 'regression.spec.ts', 'text/plain'));

    // 4. Replay HTML
    const events = chunks.flatMap((c) => c.events);
    const html = generateReplayHtml(session, events);
    downloads.push(triggerDownload(html, 'replay.html', 'text/html'));

    // 5. Screenshots
    if (screenshots.length > 0) {
      screenshots.forEach((ss, i) => {
        const ext = ss.dataUrl.startsWith('data:image/jpeg') ? 'jpg' : 'png';
        const name = `screenshots/screenshot-${String(i + 1).padStart(3, '0')}.${ext}`;
        downloads.push(triggerBase64Download(ss.dataUrl, name));
      });
    }

    await Promise.all(downloads);
  } catch (err) {
    console.error('[Refine] Publish failed:', err);
    throw err;
  }
}
