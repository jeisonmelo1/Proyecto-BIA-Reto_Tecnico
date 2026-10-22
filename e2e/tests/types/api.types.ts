export type MeterStatus = 'NORMAL' | 'ALERT' | 'CRITICAL';

export interface MeterSummary {
  meter_id: string;
  status: MeterStatus;
  severity: string | null;
  priority: number | null;
  anomaly_type: string | null;
  consumption_kwh: number;
  baseline_kwh: number;
  variation_pct: number;
  last_reading_at: string;
}

export interface MeterPageResult {
  count: number;
  page: number;
  size: number;
  rows: MeterSummary[];
}

export interface Anomaly {
  meter_id: string;
  anomaly: boolean;
  type: string;
  severity: string;
  confidence: number;
  priority: number;
  recommended_action: string;
}

export interface DashboardSummary {
  total_meters: number;
  status_counts: { normal: number; alert: number; critical: number };
  anomalies_detected: number;
  requiring_attention: number;
  ai_confidence: number;
  anomalies_by_type: Record<string, number>;
}
