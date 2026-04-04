import { db } from "@/lib/db";
import { activity } from "@/lib/db/schema";

type ActivityType =
  | "created_script"
  | "updated_script"
  | "deleted_script"
  | "starred_script"
  | "unstarred_script"
  | "forked_script";

interface TrackOptions {
  userId: string;
  type: ActivityType;
  scriptId?: string;
  targetUserId?: string;
  metadata?: Record<string, string | number>;
}

/**
 * Fire-and-forget activity tracking.
 * Never throws — failures are silently swallowed so they don't break the caller.
 */
export function trackActivity(opts: TrackOptions): void {
  db.insert(activity)
    .values({
      userId: opts.userId,
      type: opts.type,
      scriptId: opts.scriptId ?? null,
      targetUserId: opts.targetUserId ?? null,
      metadata: opts.metadata ?? null,
    })
    .then(() => {})
    .catch(() => {});
}
