import React, { useState, useRef, useEffect } from 'react';
import { supabase } from './supabaseClient';

const storeOptions = [
 　 '〇〇店','八戸店', '南佐賀店', 'LG鳥栖店', '鳥栖店', '高木瀬店',
    '三日月店', '兵庫店', '小城店', '江北店', '多久店',
    '佐々中央店', '相浦店', '伊万里店', '伊万里松島店', '北鹿島店',
    '大村店', '東諌早店', '諫早幸町店', '北方店', '武雄店', 
    '佐世保店', '鏡店', '和多田店', '若葉町店', '時津店', '三重店', '福田店', '西諫早店', '島原店'
];

const BarcodeScannerApp = () => {
  const [barcode, setBarcode] = useState('');
  const [sum, setSum] = useState(0);
  const [numbers, setNumbers] = useState([]);
  const [location, setLocation] = useState(storeOptions[0]);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [barcode]);

  const sendToSupabase = async (barcode, price) => {
    try {
      const { error } = await supabase.from('scan_data').insert([
        {
          location,
          barcode,
          price,
        },
      ]);
      if (error) throw error;
      console.log('送信成功');
    } catch (err) {
      console.error('Supabase送信エラー:', err.message);
    }
  };

  const handleBarcode = async (value) => {
    const extracted = parseInt(value.slice(7, 12), 10);
    const basePrice = Math.ceil(extracted / 1.08);
    try {
      await sendToSupabase(value, basePrice);
    } catch (err) {
      console.error('送信エラー:', err);
    }
    setNumbers(prev => [...prev, { barcode: value, price: basePrice }]);
    setSum(prevSum => prevSum + basePrice);
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
    setNumbers([]);
    inputRef.current?.focus();
  };

  const handleDownloadCSV = () => {
    const header = ['No', 'バーコード', '税抜価格'];
    const rows = numbers.map((n, i) => [i + 1, n.barcode, n.price]);
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scan_data_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ border: '1px solid #ccc', borderRadius: 8, padding: 20, width: '100%', maxWidth: 400 }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>廃棄集計アプリ</h1>

        <label>店舗を選択：</label>
        <select
          value={location}
          onChange={(e) => {
            setLocation(e.target.value);
            inputRef.current?.focus();
          }}
          style={{ width: '100%', padding: 8, marginBottom: 16,fontsize:'3rem' }}
        >
          {storeOptions.map((store, idx) => (
            <option key={idx} value={store}>{store}</option>
          ))}
        </select>

        <input
          type="text"
          ref={inputRef}
          value={barcode}
          onChange={handleBarcodeInput}
          onKeyDown={handleKeyPress}
          placeholder="バーコードを入力してください (13桁)"
          inputMode="numeric"
          pattern="[0-9]*"
          style={{ width: '100%', padding: 8, marginBottom: 16 }}
        />

        <div style={{ marginBottom: 16 }}>
          <strong>合計(税抜):</strong> {sum}
        </div>

        <div style={{ marginBottom: 16 }}>
          <strong>読み取った税抜金額:</strong>
          <ul>
            {numbers.map((n, i) => (
              <li key={i}>{n.price}</li>
            ))}
          </ul>
        </div>

        <button onClick={handleReset} style={{ padding: 8, borderRadius: 4, cursor: 'pointer', marginRight: 10 }}>リセットする</button>
        <button onClick={handleDownloadCSV} style={{ padding: 8, borderRadius: 4, cursor: 'pointer' }}>CSVダウンロード</button>
      </div>
    </div>
  );
};

export default BarcodeScannerApp;
