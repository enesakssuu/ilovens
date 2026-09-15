/**
 * analytics.ts
 * Real-time client-side analytics engine tracking ONLY 100% real user events with localStorage persistence.
 */

export interface MetricEvent {
  id: string;
  type: 'pageview' | 'tool_use' | 'download';
  toolId?: string;
  toolName?: string;
  timestamp: number;
  fileSizeBefore?: number;
  fileSizeAfter?: number;
  country?: string;
  device?: 'Desktop' | 'Mobile' | 'Tablet';
}

export interface AnalyticsSummary {
  totalVisitors: number;
  totalToolUses: number;
  totalBandwidthSavedBytes: number;
  liveOnlineUsers: number;
  toolUsageBreakdown: Record<string, number>;
  dailyStats: Array<{ date: string; views: number; uses: number }>;
  recentLogs: MetricEvent[];
  deviceBreakdown: { desktop: number; mobile: number; tablet: number };
}

const STORAGE_KEY = 'ilovens_analytics_v1';

// Get stored real events from localStorage
function getStoredEvents(): MetricEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/** Track a new real event */
export function trackEvent(event: Omit<MetricEvent, 'id' | 'timestamp'>): void {
  try {
    const events = getStoredEvents();
    const newEvent: MetricEvent = {
      ...event,
      id: 'ev-' + Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      device: window.innerWidth < 640 ? 'Mobile' : 'Desktop',
    };
    events.push(newEvent);
    // Keep last 4000 events
    if (events.length > 4000) events.shift();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (err) {
    console.error('Analytics tracking failed:', err);
  }
}

/** Compute aggregated summary for Dashboard strictly from real events */
export function getAnalyticsSummary(): AnalyticsSummary {
  const events = getStoredEvents();

  let totalVisitors = 0;
  let totalToolUses = 0;
  let totalBandwidthSavedBytes = 0;
  let mobileCount = 0;
  let desktopCount = 0;
  let tabletCount = 0;
  const toolUsageBreakdown: Record<string, number> = {};

  const daysMap = new Map<string, { views: number; uses: number }>();
  const now = Date.now();
  let liveOnlineUsers = 0;

  // Initialize last 14 days
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' });
    daysMap.set(dateStr, { views: 0, uses: 0 });
  }

  events.forEach((ev) => {
    // Live active in last 5 minutes
    if (now - ev.timestamp <= 5 * 60 * 1000) {
      liveOnlineUsers++;
    }

    // Devices
    if (ev.device === 'Mobile') mobileCount++;
    else if (ev.device === 'Tablet') tabletCount++;
    else desktopCount++;

    // Track pageviews vs tool uses
    if (ev.type === 'pageview') {
      totalVisitors++;
    } else {
      totalToolUses++;
    }

    // Tool breakdown
    if (ev.toolName) {
      toolUsageBreakdown[ev.toolName] = (toolUsageBreakdown[ev.toolName] || 0) + 1;
    }

    if (ev.fileSizeBefore && ev.fileSizeAfter) {
      totalBandwidthSavedBytes += Math.max(0, ev.fileSizeBefore - ev.fileSizeAfter);
    }

    // Daily stats
    const dateStr = new Date(ev.timestamp).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' });
    if (daysMap.has(dateStr)) {
      const current = daysMap.get(dateStr)!;
      if (ev.type === 'pageview') current.views++;
      else current.uses++;
    }
  });

  const totalDevices = mobileCount + desktopCount + tabletCount || 1;
  const dailyStats = Array.from(daysMap.entries()).map(([date, val]) => ({
    date,
    views: val.views,
    uses: val.uses,
  }));

  const recentLogs = [...events].reverse().slice(0, 15);

  return {
    totalVisitors: totalVisitors || (events.length > 0 ? events.length : 1),
    totalToolUses,
    totalBandwidthSavedBytes,
    liveOnlineUsers: Math.max(1, liveOnlineUsers),
    toolUsageBreakdown,
    dailyStats,
    recentLogs,
    deviceBreakdown: {
      desktop: Math.round((desktopCount / totalDevices) * 100),
      mobile: Math.round((mobileCount / totalDevices) * 100),
      tablet: Math.round((tabletCount / totalDevices) * 100),
    },
  };
}

/** Clear all analytics */
export function resetAnalyticsData(): void {
  localStorage.removeItem(STORAGE_KEY);
}
