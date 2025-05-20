// src/BarcodeScannerApp.js
import React, { useState, useRef, useEffect } from 'react';
import { supabase } from './supabaseClient';

const BarcodeScannerApp = () => {
    const [barcode, setBarcode] = useState('');
    const [sum, setSum] = useState(0);
    const [entries, setEntries] = useState([]);
    const inputRef = useRef(null);

    const location = '本店';

    useEffect(() => {
        inputRef.current?.focus();
    }, [barcode]);

    const handleBarcode = async (value) => {
        if (!/^\d{13}$/.test(value)) return;

        const price = Math.ceil(parseInt(value.slice(7, 12), 10) / 1.08);

        try {
            await supabase.from('scan_data').insert([
                {
                    location,
                    barcode: value,
                    price,
                },
            ]);
        } catch (error) {
            console.error('Supabase送信エラー:', error);
        }

        setEntries(prev => [...prev, { price }]);
        setSum(prevSum => prevSum + price);
        setBarcode('');
    };

    const handleInputChange = (e) => {
        const val = e.target.value;
        if (/^\d{13}$/.test(val)) {
            handleBarcode(val);
        } else {
            setBarcode(val);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && /^\d{13}$/.test(barcode)) {
            handleBarcode(barcode);
        }
    };

    const handleReset = () => {
        setEntries([]);
        setSum(0);
        setBarcode('');
        inputRef.current?.focus();
    };

    const handleDownloadCSV = () => {
        const header = ['No', '価格', '日時'];
        const rows = entries.map((entry, i) => [
            i + 1,
            entry.price,
            new Date().toLocaleString('ja-JP'),
        ]);

        const csvContent = [header, ...rows].map(e => e.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `scan_data_${Date.now()}.csv`;
        link.click();
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
            <h1>バーコードスキャナーアプリ</h1>
            <input
                ref={inputRef}
                type="text"
                value={barcode}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="バーコードを入力してください（13桁）"
                inputMode="numeric"
                pattern="[0-9]*"
                style={{ width: '100%', padding: '8px' }}
            />
            <div style={{ margin: '10px 0' }}>
                <strong>合計(税抜):</strong> {sum}
            </div>
            <div>
                <strong>読み取った税抜金額:</strong>
                <ul>
                    {entries.map((entry, index) => (
                        <li key={index}>{entry.price}</li>
                    ))}
                </ul>
            </div>
            <button onClick={handleReset} style={{ marginRight: '10px' }}>リセットする</button>
            <button onClick={handleDownloadCSV}>CSVダウンロード</button>
        </div>
    );
};

export default BarcodeScannerApp;
