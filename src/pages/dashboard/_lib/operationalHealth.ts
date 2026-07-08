import type { LucideIcon } from "lucide-react";

export type HealthStatus = "online" | "warning" | "offline" | "pending";

export type HealthItem = {
  id: string;
  label: string;
  status: HealthStatus;
  weight: number;
  visibleFor: string[];
  icon: LucideIcon;
};

export type HealthLevel = "green" | "yellow" | "orange" | "red";

const statusScore: Record<HealthStatus, number> = {
  online: 100,
  pending: 95,
  warning: 70,
  offline: 35,
};

export function getVisibleHealthItems(items: HealthItem[], role: string) {
  return items.filter((item) => item.visibleFor.includes(role) || item.visibleFor.includes("*"));
}

export function calculateOperationalHealthScore(items: HealthItem[]) {
  const totalWeight = items.reduce((acc, item) => acc + item.weight, 0);
  if (totalWeight === 0) return 100;

  // Future evolution: replace instant statuses with a rolling 5-minute average per item.
  const weightedScore = items.reduce((acc, item) => {
    return acc + statusScore[item.status] * item.weight;
  }, 0);

  return Math.round(weightedScore / totalWeight);
}

export function getOperationalHealthLevel(score: number): HealthLevel {
  if (score >= 95) return "green";
  if (score >= 80) return "yellow";
  if (score >= 60) return "orange";
  return "red";
}

