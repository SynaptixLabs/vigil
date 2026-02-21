export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'Todo' | 'In Progress' | 'Done' | 'Archived';
  assignee: string;
  dueDate: string;
}

export const mockTasks: Task[] = [
  {
    id: 'TASK-1',
    title: 'Implement user authentication',
    description: 'Add login and signup pages with JWT token handling. We need to support email/password and OAuth providers.',
    status: 'Done',
    assignee: 'Alice Chen',
    dueDate: '2026-02-15'
  },
  {
    id: 'TASK-2',
    title: 'Fix dashboard chart alignment',
    description: 'The revenue chart is overlapping the sidebar on screens smaller than 1024px. Needs flexbox adjustments.',
    status: 'In Progress',
    assignee: 'Bob Smith',
    dueDate: '2026-02-22'
  },
  {
    id: 'TASK-3',
    title: 'Write API documentation',
    description: 'Document all v2 endpoints using OpenAPI/Swagger spec. Ensure request/response examples are included.',
    status: 'Todo',
    assignee: 'Charlie Davis',
    dueDate: '2026-02-28'
  },
  {
    id: 'TASK-4',
    title: 'Update payment gateway webhook',
    description: 'Stripe webhook signature verification is failing in production. We need to update the secret key rotation logic.',
    status: 'In Progress',
    assignee: 'Alice Chen',
    dueDate: '2026-02-23'
  },
  {
    id: 'TASK-5',
    title: 'Design new landing page',
    description: 'Create high-fidelity mockups for the Q3 marketing campaign landing page.',
    status: 'Done',
    assignee: 'Diana Prince',
    dueDate: '2026-02-10'
  },
  {
    id: 'TASK-6',
    title: 'Optimize database queries',
    description: 'The tasks table query is taking >500ms on the main dashboard. Add composite indexes on status and assignee.',
    status: 'Todo',
    assignee: 'Bob Smith',
    dueDate: '2026-03-05'
  },
  {
    id: 'TASK-7',
    title: 'Setup E2E testing pipeline',
    description: 'Configure Playwright to run on every PR to main. Needs to spin up a local DB and seed it with test data.',
    status: 'In Progress',
    assignee: 'Charlie Davis',
    dueDate: '2026-02-25'
  },
  {
    id: 'TASK-8',
    title: 'Customer interview analysis',
    description: 'Review transcripts from last week\'s beta user interviews and extract top 3 feature requests.',
    status: 'Done',
    assignee: 'Diana Prince',
    dueDate: '2026-02-12'
  },
  {
    id: 'TASK-9',
    title: 'Upgrade React to v19',
    description: 'Test all components against React 19 RC. Update any deprecated lifecycle hooks.',
    status: 'Todo',
    assignee: 'Alice Chen',
    dueDate: '2026-03-15'
  },
  {
    id: 'TASK-10',
    title: 'Fix memory leak in worker',
    description: 'The background worker processing images is holding onto Buffer objects. Force garbage collection after processing.',
    status: 'Archived',
    assignee: 'Bob Smith',
    dueDate: '2026-01-20'
  },
  {
    id: 'TASK-11',
    title: 'Implement dark mode',
    description: 'Add Tailwind dark mode classes to all components. Ensure contrast ratios meet accessibility standards.',
    status: 'Done',
    assignee: 'Diana Prince',
    dueDate: '2026-02-18'
  },
  {
    id: 'TASK-12',
    title: 'Localize into Spanish',
    description: 'Extract all hardcoded strings into i18n JSON files and add Spanish translations.',
    status: 'In Progress',
    assignee: 'Charlie Davis',
    dueDate: '2026-03-01'
  },
  {
    id: 'TASK-13',
    title: 'Create onboarding flow',
    description: 'Design and implement a 3-step wizard for new users to set up their workspace.',
    status: 'Todo',
    assignee: 'Diana Prince',
    dueDate: '2026-03-10'
  },
  {
    id: 'TASK-14',
    title: 'Audit third-party dependencies',
    description: 'Run npm audit and update packages with known vulnerabilities. Focus on high/critical first.',
    status: 'In Progress',
    assignee: 'Bob Smith',
    dueDate: '2026-02-24'
  },
  {
    id: 'TASK-15',
    title: 'Prepare investor presentation',
    description: 'Compile Q1 metrics and product roadmap slides for the upcoming board meeting.',
    status: 'Done',
    assignee: 'Alice Chen',
    dueDate: '2026-02-05'
  },
  {
    id: 'TASK-16',
    title: 'Fix typo in email template',
    description: 'The welcome email says "hte" instead of "the" in the second paragraph.',
    status: 'Archived',
    assignee: 'Charlie Davis',
    dueDate: '2026-01-15'
  },
  {
    id: 'TASK-17',
    title: 'Implement drag and drop',
    description: 'Allow users to reorder tasks in the list view using @hello-pangea/dnd.',
    status: 'Todo',
    assignee: 'Alice Chen',
    dueDate: '2026-03-20'
  }
];
