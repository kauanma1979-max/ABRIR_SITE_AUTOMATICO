export interface LinkItem {
  id: string;
  title: string;
  url: string;
  category: string;
  description?: string;
  enabled: boolean;
  createdAt: number;
  lastOpenedAt?: number;
  openCount: number;
}

export type LaunchMode = 'immediate' | 'safe_250' | 'safe_500' | 'safe_1000';

export interface LaunchStats {
  totalOpened: number;
  blockedCount: number;
  inProgress: boolean;
  currentProgress: number;
  totalToOpen: number;
}
