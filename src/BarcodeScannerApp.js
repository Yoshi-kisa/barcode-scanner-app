import React, { useState, useRef, useEffect } from 'react';
import { supabase } from './supabaseClient';

const BarcodeScannerApp = () => {
    const [barcode, setBarcode] = useState('');
    const [sum, setSum] = useState(0);
    const [records, setRecords] = useState([]);
    const inputRef = useRef(null);

    const location = '本店';

    useEffect(() => {
        inputRef.current?.focus();
    }, [barcode]);

    const sendToSupabase = async (barcode, basePrice) => {
        const { error } = await supabase.from('scans').insert([
            {
                barcode,
                price: basePrice,
                location,
                timestamp: new Date().toISOString(),
            }
        ]);
        if (error) console.error('Supabase送信エラー:', error);
    };

    const handleBarcode = async (value) => {
        const extractedNumber = parseInt(value.slice(7, 12), 10);
        const basePrice = Math.ceil(extractedNumber / 1.08);
        const timestamp = new Date().toLocaleString('ja-JP');

        await sendToSupabase(value, basePrice);

        setRecords(prev => [...prev, { timestamp, barcode: value, price: basePrice }]);
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
        const header = ['No', 'タイムスタンプ', 'バーコード', '税抜金額'];
        const rows = records.map((r, i) => [i + 1, r.timestamp, r.barcode, r.price]);
        const csv = [header, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `scan_data_${Date.now()}.csv`;
        link.click();
    };

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', maxWidth: '500px', margin: 'auto' }}>
                <h1>バーコードスキャナーアプリ</h1>
                <input
                    ref={inputRef}
                    value={barcode}
                    onChange={handleBarcodeInput}
                    onKeyDown={handleKeyPress}
                    placeholder="バーコードを入力（13桁）"
                    style={{ width: '100%', padding: '8px' }}
                />
                <div><strong>合計 (税抜):</strong> {sum}</div>
                <ul>
                    {records.map((r, i) => (
                        <li key={i}>{r.price}（{r.barcode}）</li>
                    ))}
                </ul>
                <button onClick={handleReset}>リセット</button>
                <button onClick={handleDownloadCSV}>CSVダウンロード</button>
            </div>
        </div>
    );
};

export default BarcodeScannerApp;

