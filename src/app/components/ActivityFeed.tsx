"use client";

interface ActivityEvent {
  id: string;
  type: string;
  metadata: Record<string, string | number> | null;
  createdAt: string | Date | null;
  script?: { name: string; slug: string } | null;
}

interface ActivityFeedProps {
  events: ActivityEvent[];
}

const EVENT_CONFIG: Record<string, { icon: React.ReactNode; verb: string; color: string }> = {
  created_script: {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
    verb: "Created",
    color: "text-success",
  },
  updated_script: {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    verb: "Updated",
    color: "text-accent",
  },
  deleted_script: {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    ),
    verb: "Deleted",
    color: "text-danger",
  },
  starred_script: {
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" stroke="none">
        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    verb: "Starred",
    color: "text-warning",
  },
  unstarred_script: {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
    verb: "Unstarred",
    color: "text-muted",
  },
  forked_script: {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
      </svg>
    ),
    verb: "Forked",
    color: "text-accent",
  },
};

function timeAgo(date: string | Date | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export default function ActivityFeed({ events }: ActivityFeedProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-faint text-sm">
        No recent activity.
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {events.map((event, i) => {
        const config = EVENT_CONFIG[event.type] ?? {
          icon: <div className="w-4 h-4 rounded-full bg-elevated" />,
          verb: event.type,
          color: "text-muted",
        };

        const scriptName =
          event.script?.name ??
          (event.metadata?.name as string) ??
          (event.metadata?.sourceName as string) ??
          "a script";

        return (
          <div key={event.id} className="flex items-start gap-3 relative">
            {/* Timeline line */}
            {i < events.length - 1 && (
              <div className="absolute left-[11px] top-8 bottom-0 w-px bg-edge" />
            )}

            {/* Icon */}
            <div className={`shrink-0 w-6 h-6 rounded-full bg-surface border border-edge flex items-center justify-center ${config.color} z-10`}>
              {config.icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 pb-4">
              <p className="text-sm text-body">
                <span className={config.color}>{config.verb}</span>{" "}
                <span className="text-heading font-medium">{scriptName}</span>
              </p>
              <p className="text-xs text-faint mt-0.5">
                {timeAgo(event.createdAt)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
