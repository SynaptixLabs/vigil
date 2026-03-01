import { useEffect, useRef, useImperativeHandle, forwardRef, useCallback } from 'react';
import type { RecordingItem } from '../types';
import { loadRrwebPlayer } from './rrweb-loader';

/**
 * rrweb eventWithTime — minimal shape for the player.
 * We use `unknown` events from RrwebChunk, which are already eventWithTime
 * objects serialized by the extension's rrweb recorder.
 */
type RrwebEvent = { timestamp: number; type: number; data: unknown };

export interface RecordingPlayerHandle {
  goto: (timeOffset: number) => void;
}

export interface RecordingPlayerProps {
  recordings: RecordingItem[];
  width?: number;
  height?: number;
}

/**
 * Flatten all rrweb chunks from all recordings into a single sorted event array.
 * rrweb-player requires a contiguous event stream with real timestamps.
 */
function flattenEvents(recordings: RecordingItem[]): RrwebEvent[] {
  const events: RrwebEvent[] = [];
  for (const rec of recordings) {
    for (const chunk of rec.rrwebChunks) {
      if (Array.isArray(chunk.events)) {
        for (const evt of chunk.events) {
          // Each event should be an object with at least { timestamp, type, data }
          const e = evt as RrwebEvent;
          if (e && typeof e.timestamp === 'number') {
            events.push(e);
          }
        }
      }
    }
  }
  // Sort by timestamp ascending
  events.sort((a, b) => a.timestamp - b.timestamp);
  return events;
}

/**
 * RecordingPlayer — wraps rrweb-player (Svelte component) in a React wrapper.
 *
 * The rrweb-player is instantiated imperatively via `new Player({ target, props })`.
 * Exposes a `goto(timeOffset)` method via React ref for timeline sync.
 */
export const RecordingPlayer = forwardRef<RecordingPlayerHandle, RecordingPlayerProps>(
  function RecordingPlayer({ recordings, width = 640, height = 480 }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const playerRef = useRef<any>(null);

    const gotoFn = useCallback((timeOffset: number) => {
      if (playerRef.current?.goto) {
        playerRef.current.goto(timeOffset, false);
      }
    }, []);

    useImperativeHandle(ref, () => ({ goto: gotoFn }), [gotoFn]);

    const events = flattenEvents(recordings);
    const hasEvents = events.length > 0;

    useEffect(() => {
      if (!hasEvents || !containerRef.current) return;

      // Clear previous player
      const container = containerRef.current;
      container.innerHTML = '';

      let player: unknown = null;

      // Load rrweb-player via extracted loader (mockable in tests)
      loadRrwebPlayer().then((Player) => {
        if (!container.isConnected) return; // component unmounted

        try {
          player = new Player({
            target: container,
            props: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              events: events as any,
              width,
              height,
              autoPlay: false,
              showController: true,
              skipInactive: true,
            },
          });
          playerRef.current = player;
        } catch (err) {
          console.warn('[RecordingPlayer] Failed to init rrweb-player:', err);
        }
      }).catch((err) => {
        console.warn('[RecordingPlayer] Failed to load rrweb-player:', err);
      });

      return () => {
        playerRef.current = null;
        // Svelte components have $destroy
        if (player && typeof (player as Record<string, unknown>).$destroy === 'function') {
          (player as { $destroy: () => void }).$destroy();
        }
        container.innerHTML = '';
      };
      // We intentionally depend on recordings identity rather than events
      // to avoid re-creating the player on every render
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasEvents, recordings, width, height]);

    if (!hasEvents) {
      return (
        <div
          data-testid="recording-player"
          className="bg-white rounded-lg border border-gray-200 p-6 text-center text-sm text-gray-500"
        >
          No recording available for this session.
        </div>
      );
    }

    return (
      <div data-testid="recording-player" className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">
            Session Recording
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {events.length} events across {recordings.length} recording{recordings.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div
          ref={containerRef}
          className="p-2 flex justify-center overflow-hidden"
          style={{ minHeight: height + 80 }}
        />
      </div>
    );
  },
);
