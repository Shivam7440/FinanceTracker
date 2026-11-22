import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function IncomeExpenseBarChart({ trendsData = [] }) {
  const { chartData, options } = useMemo(() => {
    const labels = trendsData.map((t) => t.monthName || t.monthKey);
    const incomeSeries = trendsData.map((t) => t.income);
    const expenseSeries = trendsData.map((t) => t.expenses);

    const data = {
      labels,
      datasets: [
        {
          label: 'Income Inflow',
          data: incomeSeries,
          backgroundColor: '#06B6D4',
          borderRadius: 6,
          barPercentage: 0.6,
          categoryPercentage: 0.7
        },
        {
          label: 'Expense Outflow',
          data: expenseSeries,
          backgroundColor: '#8B5CF6',
          borderRadius: 6,
          barPercentage: 0.6,
          categoryPercentage: 0.7
        }
      ]
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
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
            pointStyle: 'rectRounded'
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
          grid: { display: false },
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
        No comparative period data available.
      </div>
    );
  }

  return (
    <div style={{ height: '320px', width: '100%' }}>
      <Bar data={chartData} options={options} />
    </div>
  );
}
