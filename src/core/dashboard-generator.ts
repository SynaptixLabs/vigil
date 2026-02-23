import type { Session, Bug } from '@shared/types';

export function generateProjectDashboard(sessions: Session[], bugs: Bug[][]): string {
  // We'll map the sessions and bugs to a self-contained HTML string
  const totalSessions = sessions.length;
  const totalBugs = bugs.flat().length;
  const totalFeatures = sessions.reduce((sum, s) => sum + (s.featureCount || 0), 0);

  const formatDuration = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    return m > 0 ? `${m}m ${s % 60}s` : `${s}s`;
  };

  const rows = sessions.sort((a, b) => b.startedAt - a.startedAt).map((session, i) => {
    const date = new Date(session.startedAt).toISOString().split('T')[0];
    const sourceBadge = (session.tags ?? []).includes('ci') || (session.tags ?? []).includes('automated')
      ? '<span class="badge ai">CI</span>'
      : '<span class="badge manual">Manual</span>';
      
    const bugCount = bugs[i]?.length || session.bugCount || 0;
    const featCount = session.featureCount || 0;
    
    return `
      <tr onclick="toggleReport('${session.id}')">
        <td>${date}</td>
        <td class="name-cell">${sourceBadge} <strong>${session.name}</strong></td>
        <td class="text-center">${bugCount > 0 ? `<span class="count bugs">${bugCount}</span>` : '-'}</td>
        <td class="text-center">${featCount > 0 ? `<span class="count feats">${featCount}</span>` : '-'}</td>
        <td class="text-right text-muted">${formatDuration(session.duration)}</td>
        <td class="actions" onclick="event.stopPropagation()">
          <a href="./sessions/${session.id}/regression.spec.ts" target="_blank" title="View Spec">📄 Spec</a>
          <a href="./sessions/${session.id}/replay.html" target="_blank" title="Watch Replay">▶️ Replay</a>
        </td>
      </tr>
      <tr id="report-${session.id}" class="report-row" style="display: none;">
        <td colspan="6">
          <div class="report-container">
            <iframe src="./sessions/${session.id}/report.md" frameborder="0"></iframe>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Refine Dashboard</title>
  <style>
    :root {
      --bg: #0f111a;
      --surface: #1e1e2e;
      --surface-hover: #2a2a3c;
      --border: #333344;
      --text: #e2e2e9;
      --text-muted: #8b8b9e;
      --indigo: #6366f1;
      --red: #f87171;
      --green: #4ade80;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      margin: 0;
      padding: 2rem;
      line-height: 1.5;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 2rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 1rem;
    }
    .header h1 {
      margin: 0;
      font-size: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .header h1 span { color: var(--indigo); }
    .metrics {
      display: flex;
      gap: 1.5rem;
    }
    .metric {
      text-align: right;
    }
    .metric .val {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text);
    }
    .metric .lbl {
      font-size: 0.75rem;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      background: var(--surface);
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    th, td {
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid var(--border);
    }
    th {
      background: rgba(0,0,0,0.2);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
    }
    tr:not(.report-row):hover {
      background: var(--surface-hover);
      cursor: pointer;
    }
    .name-cell {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .badge {
      font-size: 0.65rem;
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge.ai { background: rgba(99, 102, 241, 0.2); color: #818cf8; border: 1px solid rgba(99, 102, 241, 0.3); }
    .badge.manual { background: rgba(139, 139, 158, 0.2); color: var(--text-muted); border: 1px solid rgba(139, 139, 158, 0.3); }
    .count {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.1rem 0.4rem;
      border-radius: 4px;
    }
    .count.bugs { background: rgba(248, 113, 113, 0.15); color: var(--red); }
    .count.feats { background: rgba(74, 222, 128, 0.15); color: var(--green); }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-muted { color: var(--text-muted); font-size: 0.85rem; }
    .actions { display: flex; gap: 0.75rem; justify-content: flex-end; }
    .actions a {
      color: var(--indigo);
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 500;
      opacity: 0.8;
      transition: opacity 0.2s;
    }
    .actions a:hover { opacity: 1; text-decoration: underline; }
    .report-row td { padding: 0; border-bottom: 2px solid var(--indigo); background: #151520; }
    .report-container { padding: 1rem; }
    iframe { width: 100%; height: 400px; background: white; border-radius: 4px; }
  </style>
  <script>
    function toggleReport(id) {
      const row = document.getElementById('report-' + id);
      row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
    }
  </script>
</head>
<body>
  <div class="header">
    <h1><span>⬡</span> Refine Dashboard</h1>
    <div class="metrics">
      <div class="metric"><div class="val">${totalSessions}</div><div class="lbl">Sessions</div></div>
      <div class="metric"><div class="val" style="color: var(--red)">${totalBugs}</div><div class="lbl">Total Bugs</div></div>
      <div class="metric"><div class="val" style="color: var(--green)">${totalFeatures}</div><div class="lbl">Features</div></div>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th width="120">Date</th>
        <th>Session Name</th>
        <th width="80" class="text-center">Bugs</th>
        <th width="80" class="text-center">Features</th>
        <th width="100" class="text-right">Duration</th>
        <th width="150" class="text-right">Links</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
</body>
</html>`;
}
