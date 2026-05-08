// Career-path quadrant chart using Chart.js.
// X = Cat B average (Operational & Management Efficiency %)
// Y = Cat A average (Level & Quality of Water Supply Service %)

let chartInstance = null;

const zoneBgPlugin = {
  id: 'zoneBg',
  beforeDatasetsDraw(chart) {
    const { ctx, chartArea, scales: { x, y } } = chart;
    if (!chartArea) return;
    ctx.save();
    for (const z of window.CAREER_ZONES) {
      const x0 = x.getPixelForValue(z.x[0]);
      const x1 = x.getPixelForValue(z.x[1]);
      const y0 = y.getPixelForValue(z.y[0]);
      const y1 = y.getPixelForValue(z.y[1]);
      ctx.fillStyle = z.color;
      ctx.globalAlpha = 0.85;
      ctx.fillRect(Math.min(x0,x1), Math.min(y0,y1), Math.abs(x1-x0), Math.abs(y1-y0));
    }
    ctx.restore();
  }
};

window.renderChart = function(canvas, results, history) {
  const points = [];
  if (history && history.length) {
    history.forEach((h, i) => {
      points.push({ x: h.catBAvg, y: h.catAAvg, label: h.label || `Yr ${i+1}` });
    });
  }
  // Always include the current point as the last entry
  points.push({ x: results.catBAvg, y: results.catAAvg, label: 'Current' });

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(canvas.getContext('2d'), {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Year-wise Scores',
        data: points,
        backgroundColor: '#d62728',
        borderColor: '#8b0000',
        borderWidth: 2,
        pointRadius: 9,
        pointHoverRadius: 11,
        showLine: true,
        fill: false,
        tension: 0,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (item) => {
              const p = item.raw;
              const z = window.classifyZone(p.x, p.y);
              return `${p.label}: O&M=${p.x}%  Service=${p.y}%  → ${z?.name || '-'}`;
            }
          }
        },
        title: {
          display: true,
          text: 'Service Provider Career Path',
          font: { size: 14, weight: 'bold' }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Operational and Management Efficiency (%)' },
          min: 0, max: 100, ticks: { stepSize: 10 },
          grid: { color: 'rgba(0,0,0,0.06)' }
        },
        y: {
          title: { display: true, text: 'Level & Quality of Water Supply Service (%)' },
          min: 0, max: 100, ticks: { stepSize: 10 },
          grid: { color: 'rgba(0,0,0,0.06)' }
        }
      }
    },
    plugins: [zoneBgPlugin]
  });
};

window.getChartCanvas = () => chartInstance?.canvas;
window.getChartImageDataUrl = () => chartInstance ? chartInstance.toBase64Image('image/png', 1) : null;
