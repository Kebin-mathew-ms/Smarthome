import React from 'react';
import { Button } from 'antd';
import { Download } from 'lucide-react';

const ExportCSVButton = ({ data = [], filename = 'export.csv', headers = [] }) => {
  const exportToCSV = () => {
    if (!data || !data.length) return;

    const keys = headers.length ? headers : Object.keys(data[0]);
    const csvRows = [];

    // Header row
    csvRows.push(keys.join(','));

    // Data rows
    for (const row of data) {
      const values = keys.map((key) => {
        const val = row[key] !== undefined && row[key] !== null ? row[key] : '';
        const escaped = ('' + val).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button icon={<Download size={16} />} onClick={exportToCSV} disabled={!data || !data.length}>
      Export CSV
    </Button>
  );
};

export default ExportCSVButton;
