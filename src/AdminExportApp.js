import React, { useState } from 'react';
import { supabase } from './supabaseClient';

const AdminExportApp = () => {
  const [status, setStatus] = useState('');

  const fetchAllData = async () => {
    const allData = [];
    const pageSize = 1000;
    let from = 0;
    let to = pageSize - 1;
    let done = false;

    while (!done) {
      const { data, error } = await supabase
        .from('scan_data')
        .select('*')
        .range(from, to);

      if (error) {
        throw new Error(error.message);
      }

      if (data.length === 0) {
        done = true;
      } else {
        allData.push(...data);
        if (data.length < pageSize) {
          done = true;
        } else {
          from += pageSize;
          to += pageSize;
        }
      }
    }

    return allData;
  };

  const handleExportAll = async () => {
    setStatus('データ取得中...');
    try {
      const data = await fetchAllData();

      if (!data || data.length === 0) {
        setStatus('データが見つかりません');
        return;
      }

      const header = ['timestamp', 'location', 'barcode', 'price'];
      const rows = data.map(row => [
        row.created_at || '',
        row.location || '',
        `"${row.barcode || ''}"`,
        row.price ?? ''
      ]);

      const csv = [header, ...rows].map(r => r.join(',')).join('\n');
      const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `supabase_export_${Date.now()}.csv`;
      a.click();
      setStatus('CSVをダウンロードしました');
    } catch (err) {
      setStatus('エラー: ' + err.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: 20, maxWidth: 400, width: '100%' }}>
        <h2>管理者エクスポート画面</h2>
        <button onClick={handleExportAll} style={{ padding: '10px 20px', marginBottom: 10 }}>全件CSV出力</button>
        <div>{status}</div>
      </div>
    </div>
  );
};

export default AdminExportApp;
