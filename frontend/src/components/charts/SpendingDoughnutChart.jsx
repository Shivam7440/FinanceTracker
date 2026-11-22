import React, { useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function SpendingDoughnutChart({ categoryData = [] }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Memoize chart dataset computation
  const { chartData, options, totalExpense, categories } = useMemo(() => {
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
          borderColor: 'rgba(18, 22, 34, 0.95)',
          borderWidth: 3,
          hoverOffset: 14, // Noticeably pops the slice outward
          hoverBorderColor: '#FFFFFF',
          hoverBorderWidth: 2.5
        }
      ]
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '72%',
      onHover: (event, chartElement) => {
        if (chartElement && chartElement.length > 0) {
          setHoveredIndex(chartElement[0].index);
        } else {
          setHoveredIndex(null);
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            color: '#94A3B8',
            font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' },
            boxWidth: 10,
            boxHeight: 10,
            padding: 12,
            usePointStyle: true,
            pointStyle: 'circle'
          }
        },
        tooltip: {
          enabled: true,
          position: 'nearest',
          backgroundColor: '#0F131D',
          titleColor: '#FFFFFF',
          titleFont: { family: 'Plus Jakarta Sans', size: 14, weight: '800' },
          bodyColor: '#38BDF8', // Vibrant high-contrast cyan
          bodyFont: { family: 'JetBrains Mono', size: 13, weight: '700' },
          borderColor: 'rgba(6, 182, 212, 0.7)',
          borderWidth: 2,
          padding: 14,
          boxPadding: 8,
          usePointStyle: true,
          caretPadding: 18, // Pushes tooltip further away from the arc to prevent overlapping
          cornerRadius: 10,
          displayColors: true,
          callbacks: {
            title: (items) => {
              return items[0]?.label || '';
            },
            label: (ctx) => {
              const val = ctx.raw || 0;
              const pct = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
              return `  ₹${val.toLocaleString('en-IN', { minimumFractionDigits: 2 })}  (${pct}%)`;
            }
          }
        }
      }
    };

    return { chartData: data, options: chartOptions, totalExpense: total, categories: categoryData };
  }, [categoryData]);

  if (!categoryData || categoryData.length === 0) {
    return (
      <div style={{ height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        No category expense records found for this period.
      </div>
    );
  }

  const activeCategory = hoveredIndex !== null && categories[hoveredIndex] ? categories[hoveredIndex] : null;
  const activeAmount = activeCategory ? parseFloat(activeCategory.total || 0) : totalExpense;
  const activePct = activeCategory && totalExpense > 0 ? ((activeAmount / totalExpense) * 100).toFixed(1) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Dedicated High-Visibility Hover Banner (Never Collides) */}
      <div
        style={{
          minHeight: '38px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '6px'
        }}
      >
        {activeCategory ? (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 16px',
              borderRadius: '9999px',
              background: 'linear-gradient(90deg, rgba(6, 182, 212, 0.15), rgba(139, 92, 246, 0.15))',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
              animation: 'fadeIn 0.15s ease'
            }}
          >
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: activeCategory.color || 'var(--accent-cyan)',
                boxShadow: `0 0 8px ${activeCategory.color || 'var(--accent-cyan)'}`
              }}
            />
            <span style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
              {activeCategory.name}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span className="tabular-nums" style={{ fontWeight: 800, color: 'var(--accent-cyan)', fontSize: '0.95rem' }}>
              ₹{activeAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
            <span style={{ fontWeight: 700, color: 'var(--accent-emerald)', fontSize: '0.8rem' }}>
              ({activePct}% of total)
            </span>
          </div>
        ) : (
          <div style={{ fontSize: '0.785rem', color: 'var(--text-muted)' }}>
            Hover over any category slice to inspect allocation
          </div>
        )}
      </div>

      {/* Chart Canvas Area */}
      <div style={{ position: 'relative', height: '310px', width: '100%' }}>
        <Doughnut data={chartData} options={options} />

        {/* Center Total Overlay — Fades out on hover so the tooltip NEVER overlaps with center text */}
        <div
          style={{
            position: 'absolute',
            top: '38%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
            maxWidth: '170px',
            opacity: hoveredIndex !== null ? 0 : 1, // Instantly clears center space when hovering any slice
            transition: 'opacity 0.2s ease'
          }}
        >
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            Total Outflow
          </div>
          <div
            className="tabular-nums"
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginTop: '2px'
            }}
          >
            ₹{totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>
    </div>
  );
}
