import { getAnomalies, getDashboardSummary, getMeterById, getMeterPage } from '../actions/api.actions';
import { DECISION_TABLE, METER_WITHOUT_ANOMALY } from '../data/anomalies.data';
import { expect, test } from '../fixtures';

test.describe('Anomalías (API)', () => {
  for (const rule of DECISION_TABLE) {
    test(`CB-19 · ${rule.rule}: ${rule.type} → severidad ${rule.severity}, prioridad ${rule.priority}`, async ({ authApi }) => {
      const anomaly = (await getAnomalies(authApi)).find((a) => a.meter_id === rule.meterId);
      expect(anomaly).toBeDefined();
      expect(anomaly).toMatchObject({
        type: rule.type,
        severity: rule.severity,
        priority: rule.priority,
        anomaly: rule.isAnomaly,
        confidence: rule.confidence,
      });
      expect(anomaly!.recommended_action).toContain(rule.actionKeyword);

      const meter = await (await getMeterById(authApi, rule.meterId)).json();
      expect(meter.status).toBe(rule.meterStatus);
    });
  }

  test('CB-19 · las anomalías vienen ordenadas por prioridad', async ({ authApi }) => {
    const priorities = (await getAnomalies(authApi)).map((a) => a.priority);
    expect(priorities).toEqual([...priorities].sort((a, b) => a - b));
  });

  test('CB-20 · un medidor normal no tiene anomalía asociada', async ({ authApi }) => {
    const meter = await (await getMeterById(authApi, METER_WITHOUT_ANOMALY)).json();
    expect(meter.status).toBe('NORMAL');
    expect(meter.severity).toBeNull();
    expect(meter.priority).toBeNull();
    expect(meter.anomaly_type).toBeNull();
  });
});

test.describe('Consistencia entre endpoints (API)', () => {
  test('CB-22 · el resumen del dashboard coincide con medidores y anomalías', async ({ authApi }) => {
    const summary = await getDashboardSummary(authApi);
    const anomalies = await getAnomalies(authApi);
    const all = await getMeterPage(authApi, { pagination: { page: 1, size: 100 } });
    const byStatus = (s: string) => all.rows.filter((m) => m.status === s).length;

    expect(summary.total_meters).toBe(all.count);
    expect(summary.status_counts).toEqual({
      normal: byStatus('NORMAL'),
      alert: byStatus('ALERT'),
      critical: byStatus('CRITICAL'),
    });
    expect(summary.anomalies_detected).toBe(anomalies.length);
    expect(summary.requiring_attention).toBe(anomalies.filter((a) => a.severity === 'HIGH').length);
  });
});
