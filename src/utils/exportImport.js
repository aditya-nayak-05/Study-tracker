import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { generateId } from './helpers';

export function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToPDF(plan) {
  const doc = new jsPDF();
  let y = 20;

  doc.setFontSize(20);
  doc.text(plan.name || 'Study Plan', 14, y);
  y += 10;

  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(plan.description || '', 14, y);
  y += 12;

  if (plan.months) {
    plan.months.forEach((month) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(14);
      doc.setTextColor(99, 102, 241);
      doc.text(month.name || 'Month', 14, y);
      y += 8;

      if (month.weeks) {
        month.weeks.forEach((week) => {
          if (y > 270) { doc.addPage(); y = 20; }
          doc.setFontSize(12);
          doc.setTextColor(139, 92, 246);
          doc.text('  ' + (week.name || 'Week'), 18, y);
          y += 7;

          if (week.days) {
            week.days.forEach((day) => {
              if (y > 270) { doc.addPage(); y = 20; }
              doc.setFontSize(10);
              doc.setTextColor(80);
              doc.text('    ' + (day.name || 'Day') + (day.date ? ' - ' + day.date : ''), 22, y);
              y += 6;

              if (day.tasks) {
                day.tasks.forEach((task) => {
                  if (y > 270) { doc.addPage(); y = 20; }
                  const statusIcon = task.status === 'completed' ? '✓' : task.status === 'in-progress' ? '◐' : '○';
                  doc.setFontSize(9);
                  doc.setTextColor(50);
                  doc.text(`      ${statusIcon} ${task.title || 'Task'} [${task.priority || 'low'}]`, 26, y);
                  y += 5;
                });
              }
            });
          }
        });
      }
      y += 4;
    });
  }

  doc.save(`${plan.name || 'study-plan'}.pdf`);
}

export function exportToCSV(plan) {
  const rows = [['Month', 'Week', 'Day', 'Date', 'Task', 'Status', 'Priority', 'Estimated Time']];

  if (plan.months) {
    plan.months.forEach((month) => {
      if (month.weeks) {
        month.weeks.forEach((week) => {
          if (week.days) {
            week.days.forEach((day) => {
              if (day.tasks && day.tasks.length > 0) {
                day.tasks.forEach((task) => {
                  rows.push([
                    month.name || '',
                    week.name || '',
                    day.name || '',
                    day.date || '',
                    task.title || '',
                    task.status || 'not-started',
                    task.priority || 'low',
                    task.estimatedTime || '',
                  ]);
                });
              } else {
                rows.push([month.name || '', week.name || '', day.name || '', day.date || '', '', '', '', '']);
              }
            });
          }
        });
      }
    });
  }

  const csvContent = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, `${plan.name || 'study-plan'}.csv`);
}

export function exportToExcel(plan) {
  const rows = [['Month', 'Week', 'Day', 'Date', 'Task', 'Status', 'Priority', 'Estimated Time']];

  if (plan.months) {
    plan.months.forEach((month) => {
      if (month.weeks) {
        month.weeks.forEach((week) => {
          if (week.days) {
            week.days.forEach((day) => {
              if (day.tasks && day.tasks.length > 0) {
                day.tasks.forEach((task) => {
                  rows.push([
                    month.name, week.name, day.name, day.date || '',
                    task.title, task.status, task.priority, task.estimatedTime || '',
                  ]);
                });
              } else {
                rows.push([month.name, week.name, day.name, day.date || '', '', '', '', '']);
              }
            });
          }
        });
      }
    });
  }

  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Study Plan');
  XLSX.writeFile(wb, `${plan.name || 'study-plan'}.xlsx`);
}

export function importFromCSV(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').filter((l) => l.trim());
        const headers = lines[0].split(',').map((h) => h.replace(/"/g, '').trim().toLowerCase());
        const data = lines.slice(1).map((line) => {
          const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
          const obj = {};
          headers.forEach((h, i) => {
            obj[h] = (values[i] || '').replace(/"/g, '').trim();
          });
          return obj;
        });
        resolve(data);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export function importFromExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);
        const normalized = json.map((row) => {
          const obj = {};
          Object.keys(row).forEach((key) => {
            obj[key.toLowerCase().trim()] = row[key];
          });
          return obj;
        });
        resolve(normalized);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export function buildPlanFromImport(data, planName) {
  const monthsMap = new Map();

  data.forEach((row) => {
    const monthName = row.month || 'Month 1';
    const weekName = row.week || 'Week 1';
    const dayName = row.day || 'Day 1';

    if (!monthsMap.has(monthName)) {
      monthsMap.set(monthName, { id: generateId(), name: monthName, weeks: new Map() });
    }
    const month = monthsMap.get(monthName);

    if (!month.weeks.has(weekName)) {
      month.weeks.set(weekName, { id: generateId(), name: weekName, days: new Map() });
    }
    const week = month.weeks.get(weekName);

    if (!week.days.has(dayName)) {
      week.days.set(dayName, {
        id: generateId(),
        name: dayName,
        date: row.date || '',
        tasks: [],
      });
    }
    const day = week.days.get(dayName);

    if (row.task) {
      day.tasks.push({
        id: generateId(),
        title: row.task,
        description: '',
        notes: '',
        estimatedTime: row['estimated time'] || row.estimatedtime || '',
        priority: row.priority || 'low',
        status: row.status || 'not-started',
      });
    }
  });

  const months = [];
  monthsMap.forEach((month) => {
    const weeks = [];
    month.weeks.forEach((week) => {
      const days = [];
      week.days.forEach((day) => days.push(day));
      weeks.push({ ...week, days });
    });
    months.push({ id: month.id, name: month.name, weeks });
  });

  return {
    id: generateId(),
    name: planName || 'Imported Plan',
    description: 'Imported from file',
    category: 'imported',
    color: '#6366f1',
    icon: 'FileUp',
    startDate: new Date().toISOString(),
    targetEndDate: '',
    pinned: false,
    archived: false,
    months,
    studyHours: [],
    activities: [{ id: generateId(), type: 'import', message: 'Plan imported from file', timestamp: new Date().toISOString() }],
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
