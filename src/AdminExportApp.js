import React, { useState } from 'react';
import { supabase } from './supabaseClient';

const AdminExportApp = () => {
  const [status, setStatus] = useState('');

  const handleExportAll = async () => {
    setStatus('データ取得中...');
    const { data, error } = await supabase.from('scan_data').select('*').limit(10000);

    if (error) {
      setStatus(`エラー: ${error.message}`);
      return;
    }

    if (!data || data.length === 0) {
      setStatus('データが見つかりません');
      return;
    }

    const header = ['timestamp', 'location', 'barcode', 'price'];
    const rows = data.map(row => [
      row.created_at || '',
      row.location || '',
      `"${row.barcode || ''}"`,  // ← ここでバーコードを文字列として囲む
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
