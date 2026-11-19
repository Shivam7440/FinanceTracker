import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function SpendingDoughnutChart({ categoryData = [] }) {
  // Memoize chart dataset computation
  const { chartData, options, totalExpense } = useMemo(() => {
    const total = categoryData.reduce((acc, c) => acc + parseFloat(c.total || 0), 0);

    const labels = categoryData.map((c) => c.name);
    const dataValues = categoryData.map((c) => parseFloat(c.total || 0));
    const backgroundColors = categoryData.map((c) => c.color || '#06B6D4');

    const data = {
      labels: labels.length > 0 ? labels : ['No Expenses'],
      datasets: [
        {
          data: dataValues.length > 0 ? dataValues : [1],
          backgroundColor: backgroundColors.length > 0 ? backgroundColors : ['#334155'],
          borderColor: 'rgba(18, 22, 34, 0.9)',
          borderWidth: 3,
          hoverOffset: 6
        }
      ]
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            color: '#94A3B8',
            font: { family: 'Plus Jakarta Sans', size: 11, weight: '500' },
            boxWidth: 10,
            boxHeight: 10,
            padding: 12,
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
              const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
              return ` $${val.toLocaleString('en-US', { minimumFractionDigits: 2 })} (${pct}%)`;
            }
          }
        }
      }
    };

    return { chartData: data, options: chartOptions, totalExpense: total };
  }, [categoryData]);

  if (!categoryData || categoryData.length === 0) {
    return (
      <div style={{ height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        No category expense records found for this period.
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', height: '300px', width: '100%' }}>
      <Doughnut data={chartData} options={options} />
      {/* Centered Total Overlay */}
      <div style={{
        position: 'absolute',
        top: '40%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        pointerEvents: 'none'
      }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Total Outflow
        </div>
        <div className="tabular-nums" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          ${totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
      </div>
    </div>
  );
}
