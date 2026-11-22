import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function MonthlyTrendLineChart({ trendsData = [] }) {
  const { chartData, options } = useMemo(() => {
    const labels = trendsData.map((t) => t.monthName || t.monthKey);
    const incomeSeries = trendsData.map((t) => t.income);
    const expenseSeries = trendsData.map((t) => t.expenses);

    const data = {
      labels,
      datasets: [
        {
          label: 'Total Inflow (Income)',
          data: incomeSeries,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          tension: 0.35,
          fill: true,
          pointBackgroundColor: '#10B981',
          pointBorderColor: '#080A0F',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: 'Total Outflow (Expenses)',
          data: expenseSeries,
          borderColor: '#F43F5E',
          backgroundColor: 'rgba(244, 63, 94, 0.08)',
          tension: 0.35,
          fill: true,
          pointBackgroundColor: '#F43F5E',
          pointBorderColor: '#080A0F',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: {
            color: '#94A3B8',
            font: { family: 'Plus Jakarta Sans', size: 12, weight: '500' },
            boxWidth: 12,
            boxHeight: 12,
            padding: 16,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          backgroundColor: '#171D2C',
          titleColor: '#F8FAFC',
          bodyColor: '#94A3B8',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          padding: 12,
          boxPadding: 6,
          usePointStyle: true,
          callbacks: {
            label: (ctx) => {
              const val = ctx.raw || 0;
              return ` ${ctx.dataset.label}: ₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.04)', drawBorder: false },
          ticks: { color: '#64748B', font: { family: 'Plus Jakarta Sans', size: 11 } }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.04)', drawBorder: false },
          ticks: {
            color: '#64748B',
            font: { family: 'JetBrains Mono', size: 10 },
            callback: (val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`
          }
        }
      }
    };

    return { chartData: data, options: chartOptions };
  }, [trendsData]);

  if (!trendsData || trendsData.length === 0) {
    return (
      <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        No historical trend data available.
      </div>
    );
  }

  return (
    <div style={{ height: '320px', width: '100%' }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
