import { useState, useMemo, useRef, useCallback } from 'react';
import type { SessionDetail as SessionDetailType, SnapshotItem, SessionBug, SessionFeature, TimelineEvent } from '../types';
import { SessionTimeline } from '../components/SessionTimeline';
import { RecordingPlayer } from '../components/RecordingPlayer';
import type { RecordingPlayerHandle } from '../components/RecordingPlayer';
import { ImageLightbox } from '../components/ImageLightbox';
import type { LightboxImage } from '../components/ImageLightbox';

interface SessionDetailProps {
  session: SessionDetailType;
}

type CanvasTab = 'recording' | 'bugs' | 'snapshots' | 'features' | 'annotations';

function formatClock(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs.toString().padStart(2, '0')}s`;
}

function formatDate(epoch: number): string {
  return new Date(epoch).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ── Canvas content components ─────────────────────────────────────────────────

function BugCanvas({ bug, snapshots, onImageClick }: { bug: SessionBug; snapshots: SnapshotItem[]; onImageClick?: (src: string) => void }) {
  const linkedSnapshot = bug.screenshotId
    ? snapshots.find((s) => s.id === bug.screenshotId)
    : undefined;

  const priorityStyles: Record<string, string> = {
    P0: 'bg-red-100 text-red-800 ring-1 ring-red-200',
    P1: 'bg-orange-100 text-orange-800 ring-1 ring-orange-200',
    P2: 'bg-blue-100 text-blue-800 ring-1 ring-blue-200',
    P3: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  };

  return (
    <div data-testid="canvas-bug" className="p-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <h3 className="text-lg font-bold text-slate-900">{bug.title}</h3>
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-bold shrink-0 ${priorityStyles[bug.priority] || priorityStyles.P3}`}>
          {bug.priority}
        </span>
      </div>
      {bug.description && (
        <p className="text-sm text-slate-600 leading-relaxed mb-4">{bug.description}</p>
      )}
      <div className="flex flex-wrap gap-3 text-xs text-slate-400 mb-4">
        <span>Status: <strong className="text-slate-600">{bug.status}</strong></span>
        {bug.url && <span className="truncate max-w-xs">{bug.url}</span>}
      </div>
      {linkedSnapshot?.screenshotDataUrl && (
        <img
          src={linkedSnapshot.screenshotDataUrl}
          alt="Bug screenshot"
          className="rounded-lg border border-slate-200 max-w-full max-h-[28rem] object-contain shadow-sm cursor-pointer hover:ring-2 hover:ring-indigo-300 transition-all"
          onClick={() => onImageClick?.(linkedSnapshot.screenshotDataUrl)}
        />
      )}
    </div>
  );
}

function FeatureCanvas({ feature }: { feature: SessionFeature }) {
  return (
    <div data-testid="canvas-feature" className="p-6">
      <div className="flex items-start justify-between gap-3 mb-4">
        <h3 className="text-lg font-bold text-slate-900">{feature.title}</h3>
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-bold bg-purple-100 text-purple-800 ring-1 ring-purple-200 shrink-0">
          {feature.featureType}
        </span>
      </div>
      {feature.description && (
        <p className="text-sm text-slate-600 leading-relaxed mb-4">{feature.description}</p>
      )}
      <div className="flex flex-wrap gap-3 text-xs text-slate-400">
        <span>Status: <strong className="text-slate-600">{feature.status}</strong></span>
        {feature.url && <span className="truncate max-w-xs">{feature.url}</span>}
      </div>
    </div>
  );
}

function SnapshotCanvas({ snapshot, onImageClick }: { snapshot: SnapshotItem; onImageClick?: (src: string) => void }) {
  return (
    <div data-testid="canvas-snapshot" className="p-6 flex flex-col items-center">
      <div className="text-xs text-slate-400 mb-3">
        {formatClock(snapshot.capturedAt)} · {snapshot.triggeredBy}
        {snapshot.url && <span className="ml-2 truncate">{snapshot.url}</span>}
      </div>
      {snapshot.screenshotDataUrl ? (
        <img
          src={snapshot.screenshotDataUrl}
          alt={`Snapshot at ${formatClock(snapshot.capturedAt)}`}
          className="rounded-lg border border-slate-200 max-w-full max-h-[32rem] object-contain shadow-sm cursor-pointer hover:ring-2 hover:ring-indigo-300 transition-all"
          onClick={() => onImageClick?.(snapshot.screenshotDataUrl)}
        />
      ) : (
        <div className="text-3xl text-slate-300">📸</div>
      )}
    </div>
  );
}

// ── Tab list views (shown when clicking stat cards) ───────────────────────────

function BugListView({ bugs, snapshots, onImageClick }: { bugs: SessionBug[]; snapshots: SnapshotItem[]; onImageClick?: (src: string) => void }) {
  if (bugs.length === 0) return <div className="p-8 text-center text-sm text-slate-400">No bugs in this session</div>;
  const priorityStyles: Record<string, string> = {
    P0: 'bg-red-100 text-red-800 ring-1 ring-red-200',
    P1: 'bg-orange-100 text-orange-800 ring-1 ring-orange-200',
    P2: 'bg-blue-100 text-blue-800 ring-1 ring-blue-200',
    P3: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  };
  return (
    <div className="p-4 space-y-3">
      {bugs.map((bug) => {
        const snap = bug.screenshotId ? snapshots.find(s => s.id === bug.screenshotId) : undefined;
        return (
          <div key={bug.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-900">{bug.title}</div>
                {bug.description && <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{bug.description}</p>}
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold shrink-0 ${priorityStyles[bug.priority] || priorityStyles.P3}`}>
                {bug.priority}
              </span>
            </div>
            {snap?.screenshotDataUrl && (
              <img
                src={snap.screenshotDataUrl}
                alt="Bug screenshot"
                className="mt-3 rounded-lg border border-slate-200 max-h-40 object-contain cursor-pointer hover:ring-2 hover:ring-indigo-300 transition-all"
                onClick={() => onImageClick?.(snap.screenshotDataUrl)}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function SnapshotListView({ snapshots, onImageClick }: { snapshots: SnapshotItem[]; onImageClick?: (src: string) => void }) {
  if (snapshots.length === 0) return <div className="p-8 text-center text-sm text-slate-400">No snapshots in this session</div>;
  return (
    <div className="p-4 grid grid-cols-2 gap-3">
      {snapshots.map((snap) => (
        <div key={snap.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
          {snap.screenshotDataUrl ? (
            <img
              src={snap.screenshotDataUrl}
              alt={`Snapshot at ${formatClock(snap.capturedAt)}`}
              className="w-full aspect-video object-contain bg-slate-100 cursor-pointer hover:opacity-90 transition-opacity"
              loading="lazy"
              onClick={() => onImageClick?.(snap.screenshotDataUrl)}
            />
          ) : (
            <div className="w-full aspect-video bg-slate-100 flex items-center justify-center text-slate-400 text-2xl">📸</div>
          )}
          <div className="px-3 py-2 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">{formatClock(snap.capturedAt)}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              snap.triggeredBy === 'manual' ? 'bg-blue-50 text-blue-600' :
              snap.triggeredBy === 'bug-editor' ? 'bg-red-50 text-red-600' :
              'bg-slate-50 text-slate-500'
            }`}>{snap.triggeredBy}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function FeatureListView({ features }: { features: SessionFeature[] }) {
  if (features.length === 0) return <div className="p-8 text-center text-sm text-slate-400">No features in this session</div>;
  return (
    <div className="p-4 space-y-3">
      {features.map((feat) => (
        <div key={feat.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow">
          <div className="text-sm font-semibold text-slate-900">{feat.title}</div>
          {feat.description && <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{feat.description}</p>}
        </div>
      ))}
    </div>
  );
}

function AnnotationListView({ annotations }: { annotations: SessionDetailType['annotations'] }) {
  if (annotations.length === 0) return <div className="p-8 text-center text-sm text-slate-400">No annotations in this session</div>;
  return (
    <div className="p-4 space-y-3">
      {annotations.map((ann) => (
        <div key={ann.id} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${
              ann.kind === 'comment' ? 'bg-amber-50 text-amber-700' :
              ann.kind === 'rectangle' ? 'bg-blue-50 text-blue-700' :
              ann.kind === 'circle' ? 'bg-purple-50 text-purple-700' :
              'bg-slate-50 text-slate-600'
            }`}>{ann.kind}</span>
            {ann.text && <span className="text-sm text-slate-900">{ann.text}</span>}
          </div>
          {ann.url && <div className="text-xs text-slate-400 mt-1 truncate">{ann.url}</div>}
        </div>
      ))}
    </div>
  );
}

// ── Stat card (clickable) ─────────────────────────────────────────────────────

function StatCard({ label, value, icon, active, onClick }: { label: string; value: number | string; icon: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={`stat-card-${label.toLowerCase()}`}
      className={`rounded-xl border px-4 py-3 flex items-center gap-3 transition-all cursor-pointer ${
        active
          ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-200'
          : 'bg-white border-slate-200 hover:bg-slate-50'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <div className="text-left">
        <div className="text-lg font-bold text-slate-900">{value}</div>
        <div className="text-xs text-slate-400">{label}</div>
      </div>
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function SessionDetail({ session }: SessionDetailProps) {
  const playerRef = useRef<RecordingPlayerHandle>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<CanvasTab>('recording');
  const [selectedTimelineIndex, setSelectedTimelineIndex] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

  const handleTimelineSeek = useCallback((timeOffset: number) => {
    playerRef.current?.goto(timeOffset);
  }, []);

  const handleTimelineEventClick = useCallback((event: TimelineEvent, index: number) => {
    setSelectedTimelineIndex(index);
    setSelectedEvent(event);

    // Auto-switch to the relevant tab and show the event in canvas
    if (event.type === 'recording-start' || event.type === 'recording-end') {
      setActiveTab('recording');
      setSelectedEvent(null); // Recording tab shows the player, not a specific event
    } else if (event.type === 'bug') {
      setActiveTab('bugs');
    } else if (event.type === 'snapshot') {
      setActiveTab('snapshots');
    } else if (event.type === 'feature') {
      setActiveTab('features');
    }
  }, []);

  const handleStatClick = useCallback((tab: CanvasTab) => {
    setActiveTab(tab);
    setSelectedEvent(null);
    setSelectedTimelineIndex(null);
  }, []);

  const lightboxImages: LightboxImage[] = useMemo(() =>
    session.snapshots
      .filter((snap) => snap.screenshotDataUrl)
      .map((snap) => ({
        src: snap.screenshotDataUrl,
        alt: `Snapshot at ${formatClock(snap.capturedAt)}`,
        caption: `${formatClock(snap.capturedAt)}  ·  ${snap.triggeredBy}`,
      })),
    [session.snapshots],
  );

  const openLightbox = useCallback((src: string) => {
    const idx = lightboxImages.findIndex((img) => img.src === src);
    if (idx >= 0) setLightboxIndex(idx);
  }, [lightboxImages]);

  const showPlayer = session.recordings.length > 0;

  // ── Canvas content based on active tab + selected event ───────────────────
  const renderCanvas = () => {
    // If a specific event is selected from timeline, show it
    if (selectedEvent) {
      if (selectedEvent.type === 'bug') {
        return <BugCanvas bug={selectedEvent.bug} snapshots={session.snapshots} onImageClick={openLightbox} />;
      }
      if (selectedEvent.type === 'feature') {
        return <FeatureCanvas feature={selectedEvent.feature} />;
      }
      if (selectedEvent.type === 'snapshot') {
        return <SnapshotCanvas snapshot={selectedEvent.snapshot} onImageClick={openLightbox} />;
      }
    }

    // Otherwise show tab content
    switch (activeTab) {
      case 'recording':
        return showPlayer ? (
          <RecordingPlayer ref={playerRef} recordings={session.recordings} width={560} height={400} />
        ) : (
          <div data-testid="recording-player" className="p-8 text-center">
            <div className="text-3xl mb-2">🎥</div>
            <div className="text-sm text-slate-500">No recording for this session</div>
          </div>
        );
      case 'bugs':
        return <BugListView bugs={session.bugs} snapshots={session.snapshots} onImageClick={openLightbox} />;
      case 'snapshots':
        return <SnapshotListView snapshots={session.snapshots} onImageClick={openLightbox} />;
      case 'features':
        return <FeatureListView features={session.features} />;
      case 'annotations':
        return <AnnotationListView annotations={session.annotations} />;
    }
  };

  return (
    <div data-testid="session-detail" className="flex flex-col h-full">
      {/* Session header card */}
      <div className="bg-gradient-to-r from-indigo-50 to-slate-50 rounded-xl border border-indigo-100 px-5 py-4 shrink-0">
        <h2 className="text-base font-bold text-slate-900 mb-1">{session.name}</h2>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatDate(session.startedAt)}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Duration: {formatClock(session.clock)}
          </span>
          {session.sprint && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium">
              Sprint {session.sprint}
            </span>
          )}
          {session.description && (
            <span className="text-slate-400">{session.description}</span>
          )}
        </div>
      </div>

      {/* Stat cards row — clickable, switch canvas tab */}
      <div className="grid grid-cols-5 gap-2 my-3 shrink-0">
        <StatCard label="Recording" value={session.recordings.length} icon="🎥" active={activeTab === 'recording' && !selectedEvent} onClick={() => handleStatClick('recording')} />
        <StatCard label="Snapshots" value={session.snapshots.length} icon="📸" active={activeTab === 'snapshots' && !selectedEvent} onClick={() => handleStatClick('snapshots')} />
        <StatCard label="Bugs" value={session.bugs.length} icon="🐛" active={activeTab === 'bugs' && !selectedEvent} onClick={() => handleStatClick('bugs')} />
        <StatCard label="Features" value={session.features.length} icon="✨" active={activeTab === 'features' && !selectedEvent} onClick={() => handleStatClick('features')} />
        <StatCard label="Annotations" value={session.annotations.length} icon="✏️" active={activeTab === 'annotations' && !selectedEvent} onClick={() => handleStatClick('annotations')} />
      </div>

      {/* Two-panel layout: Timeline (left) + Canvas (right) */}
      <div data-testid="timeline-player-section" className="flex-1 min-h-0 grid grid-cols-[minmax(280px,30%),1fr] gap-4">
        {/* Left: Timeline */}
        <div className="min-h-0">
          <SessionTimeline
            session={session}
            onSeek={showPlayer && activeTab === 'recording' ? handleTimelineSeek : undefined}
            onEventClick={handleTimelineEventClick}
            selectedIndex={selectedTimelineIndex}
          />
        </div>

        {/* Right: Canvas */}
        <div className="bg-white rounded-xl border border-slate-200 min-h-0 overflow-y-auto">
          {renderCanvas()}
        </div>
      </div>

      {/* Screenshot lightbox */}
      {lightboxIndex !== null && lightboxImages.length > 0 && (
        <ImageLightbox
          images={lightboxImages}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
