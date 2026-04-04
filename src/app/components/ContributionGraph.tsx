"use client";

/**
 * GitHub-style contribution graph.
 * Renders a grid of 52 weeks x 7 days showing activity intensity.
 */

interface ContributionGraphProps {
  contributions: Record<string, number>;
}

export default function ContributionGraph({ contributions }: ContributionGraphProps) {
  // Build 52 weeks of data ending today
  const today = new Date();
  const weeks: { date: string; count: number; day: number }[][] = [];

  // Start from 52 weeks ago, on a Sunday
  const start = new Date(today);
  start.setDate(start.getDate() - 364 - start.getDay());

  let currentWeek: { date: string; count: number; day: number }[] = [];

  for (let i = 0; i <= 371; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    if (d > today) break;

    const dateStr = d.toISOString().split("T")[0];
    const day = d.getDay();

    if (day === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }

    currentWeek.push({
      date: dateStr,
      count: contributions[dateStr] || 0,
      day,
    });
  }
  if (currentWeek.length > 0) weeks.push(currentWeek);

  // Determine max for intensity scaling
  const allCounts = Object.values(contributions);
  const maxCount = Math.max(1, ...allCounts);

  function getColor(count: number): string {
    if (count === 0) return "bg-elevated";
    const ratio = count / maxCount;
    if (ratio <= 0.25) return "bg-success/20";
    if (ratio <= 0.5) return "bg-success/40";
    if (ratio <= 0.75) return "bg-success/70";
    return "bg-success";
  }

  const totalContributions = allCounts.reduce((a, b) => a + b, 0);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-muted">
          {totalContributions} contributions in the last year
        </p>
      </div>
      <div className="overflow-x-auto">
        <div className="inline-flex gap-[3px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((day) => (
                <div
                  key={day.date}
                  className={`w-[11px] h-[11px] rounded-[2px] ${getColor(day.count)}`}
                  title={`${day.date}: ${day.count} contribution${day.count !== 1 ? "s" : ""}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1 mt-2 text-xs text-faint justify-end">
        <span>Less</span>
        <div className="w-[11px] h-[11px] rounded-[2px] bg-elevated" />
        <div className="w-[11px] h-[11px] rounded-[2px] bg-success/20" />
        <div className="w-[11px] h-[11px] rounded-[2px] bg-success/40" />
        <div className="w-[11px] h-[11px] rounded-[2px] bg-success/70" />
        <div className="w-[11px] h-[11px] rounded-[2px] bg-success" />
        <span>More</span>
      </div>
    </div>
  );
}
