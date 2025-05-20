import React, { useState, useRef, useEffect } from 'react';
import { supabase } from './supabaseClient';

const BarcodeScannerApp = () => {
  const [barcode, setBarcode] = useState('');
  const [sum, setSum] = useState(0);
  const [records, setRecords] = useState([]);
  const [location, setLocation] = useState('本店');
  const inputRef = useRef(null);

  const storeOptions = [
    '八戸店', '南佐賀店', 'LG鳥栖店', '鳥栖店', '高木瀬店',
    '三日月店', '兵庫店', '小城店', '江北店', '多久店',
    '佐々中央店', '相浦店', '伊万里店', '伊万里松島店', '北鹿島店',
    '大村店', '東諌早店', '諫早幸町店', '北方店', '武雄店', 
    '佐世保店', '鏡店', '和多田店', '若葉町店', '時津店', '三重店', '福田店', '西諫早店', '島原店'
  ];

  useEffect(() => {
    inputRef.current?.focus();
  }, [barcode]);

  const sendToSupabase = async (barcode, basePrice) => {
    try {
      const { error } = await supabase.from('scan_data').insert([
        { location, barcode, price: basePrice }
      ]);
      if (error) throw error;
    } catch (err) {
      console.error('送信エラー:', err);
    }
  };

  const handleBarcode = async (value) => {
    const extracted = parseInt(value.slice(7, 12), 10);
    const basePrice = Math.ceil(extracted / 1.08);

    await sendToSupabase(value, basePrice);

    setRecords(prev => [...prev, { barcode: value, price: basePrice }]);
    setSum(prev => prev + basePrice);
    setBarcode('');
  };

  const handleBarcodeInput = (e) => {
    const value = e.target.value;
    if (/^\d{13}$/.test(value)) {
      handleBarcode(value);
    } else {
      setBarcode(value);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && /^\d{13}$/.test(barcode)) {
      handleBarcode(barcode);
    }
  };

  const handleReset = () => {
    setBarcode('');
    setSum(0);
    setRecords([]);
    inputRef.current?.focus();
  };

  const handleDownloadCSV = () => {
    const header = ['No', 'Price', 'Barcode', 'Location'];
    const rows = records.map((r, i) => [i + 1, r.price, r.barcode, location]);
    const csv = [header, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `scan_data_${Date.now()}.csv`;
    link.click();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', padding: 20 }}>
      <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: 20, maxWidth: 400, width: '100%' }}>
        <h1>バーコードスキャナーアプリ</h1>

        <div style={{ marginBottom: '1rem' }}>
          <label><strong>店舗を選択：</strong></label><br />
          <select value={location} onChange={e => setLocation(e.target.value)} style={{ width: '100%', padding: 8 }}>
            {storeOptions.map((store, idx) => (
              <option key={idx} value={store}>{store}</option>
            ))}
          </select>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={barcode}
          onChange={handleBarcodeInput}
          onKeyDown={handleKeyPress}
          placeholder="バーコードを入力してください (13桁)"
          style={{ width: '100%', padding: 8, marginBottom: 16 }}
        />

        <div><strong>合計 (税抜):</strong> {sum}</div>

        <div style={{ marginTop: 16 }}>
          <strong>読み取った税抜金額:</strong>
          <ul>
            {records.map((r, i) => <li key={i}>{r.price}</li>)}
          </ul>
        </div>

        <div style={{ marginTop: 16 }}>
          <button onClick={handleReset} style={{ marginRight: 8 }}>リセットする</button>
          <button onClick={handleDownloadCSV}>CSVダウンロード</button>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScannerApp;

