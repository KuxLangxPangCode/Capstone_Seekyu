// kpi.js - Global KPI Monitoring Script

const KPI = (() => {
  let kpiChart;

  function initChart() {
    const ctx = document.getElementById('kpiChart');
    if (!ctx) return;

    kpiChart = new Chart(ctx.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['Compliance', 'Attendance', 'Response', 'Resolved'],
        datasets: [{
          data: [87, 92, 60, 80],
          backgroundColor: [
            'rgba(78,161,255,0.95)',
            'rgba(102,179,255,0.95)',
            'rgba(120,200,255,0.95)',
            'rgba(60,150,200,0.95)'
          ],
          borderWidth: 0
        }]
      },
      options: {
        plugins: { legend: { position: 'bottom', labels: { color: '#cfd8dd' } } },
        maintainAspectRatio: false
      }
    });
  }

  function update(data) {
    if (document.getElementById('avgResponse')) {
      document.getElementById('avgResponse').textContent = data.avgResponse || '—';
    }
    if (document.getElementById('incResolved')) {
      document.getElementById('incResolved').textContent = data.resolved ?? '—';
    }
    if (document.getElementById('attendance')) {
      document.getElementById('attendance').textContent = (data.attendance ?? '—') + '%';
    }
    if (document.getElementById('compliance')) {
      document.getElementById('compliance').textContent = (data.compliance ?? '—') + '%';
    }

    if (document.getElementById('pResp')) document.getElementById('pResp').style.width = (data.respPct ?? 0) + '%';
    if (document.getElementById('pResolved')) document.getElementById('pResolved').style.width = (data.resolvedPct ?? 0) + '%';
    if (document.getElementById('pAttend')) document.getElementById('pAttend').style.width = (data.attendance ?? 0) + '%';
    if (document.getElementById('pComp')) document.getElementById('pComp').style.width = (data.compliance ?? 0) + '%';

    if (kpiChart && data.chart) {
      kpiChart.data.datasets[0].data = data.chart;
      kpiChart.update();
    }
  }

  function init() {
    initChart();
    update({
      avgResponse: '2m 30s',
      resolved: 48,
      attendance: 92,
      compliance: 87,
      respPct: 60,
      resolvedPct: 80,
      chart: [87, 92, 60, 80]
    });
  }

  return { init, update };
})();

// Auto-init on DOM load
document.addEventListener("DOMContentLoaded", KPI.init);
