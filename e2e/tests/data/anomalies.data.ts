// Tabla de decisión del motor (CB-19): tipo de anomalía → estado, severidad, prioridad y acción.
export interface DecisionRule {
  rule: string;
  meterId: string;
  type: string;
  meterStatus: string;
  severity: string;
  priority: number;
  isAnomaly: boolean;
  confidence: number;
  actionKeyword: string;
}

export const DECISION_TABLE: DecisionRule[] = [
  { rule: 'R1', meterId: 'M-109', type: 'REAL_ANOMALY', meterStatus: 'CRITICAL', severity: 'HIGH', priority: 1, isAnomaly: true, confidence: 0.95, actionKeyword: 'Investigar en sitio' },
  { rule: 'R2', meterId: 'M-112', type: 'DATA_QUALITY', meterStatus: 'CRITICAL', severity: 'HIGH', priority: 2, isAnomaly: true, confidence: 0.95, actionKeyword: 'Validar el medidor' },
  { rule: 'R3', meterId: 'M-104', type: 'EXPLAINABLE_ANOMALY', meterStatus: 'ALERT', severity: 'MEDIUM', priority: 3, isAnomaly: true, confidence: 0.86, actionKeyword: 'Validar con operación' },
  { rule: 'R4', meterId: 'M-106', type: 'FALSE_POSITIVE', meterStatus: 'ALERT', severity: 'LOW', priority: 4, isAnomaly: false, confidence: 0.86, actionKeyword: 'No escalar' },
];

export const METER_WITHOUT_ANOMALY = 'M-101';
export const UNKNOWN_METER_ID = 'M-999';
