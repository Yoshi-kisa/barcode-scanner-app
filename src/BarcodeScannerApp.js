
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

    const getTimestamp = () => {
        const now = new Date();
        const pad = (n) => n.toString().padStart(2, '0');
        return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    };

    const sendToSupabase = async (barcode, basePrice) => {
        try {
            const { data, error } = await supabase
                .from('scans')
                .insert([{ location, barcode, price: basePrice }]);

            if (error) {
                console.error('Supabase送信エラー:', error);
            } else {
                console.log('Supabase送信成功:', data);
            }
        } catch (err) {
            console.error('通信エラー:', err);
        }
    };

    const handleBarcode = async (value) => {
        const extractedNumber = parseInt(value.slice(7, 12), 10);
        const basePrice = Math.ceil(extractedNumber / 1.08);
        const timestamp = getTimestamp();

        await sendToSupabase(value, basePrice);

        setEntries(prev => [...prev, { timestamp, barcode: value, basePrice }]);
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
        setEntries([]);
        inputRef.current?.focus();
    };

    const handleDownloadCSV = () => {
        const header = ['タイムスタンプ', 'No', 'バーコード', '税抜金額'];
        const rows = entries.map((entry, i) => [
            entry.timestamp,
            i + 1,
            entry.barcode,
            entry.basePrice
        ]);

        const csvContent = '\uFEFF' + [header, ...rows].map(e => e.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `scan_data_${Date.now()}.csv`);
        link.click();
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '20px', width: '100%', maxWidth: '400px' }}>
                <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>バーコードスキャナーアプリ</h1>
                <input
                    type="text"
                    ref={inputRef}
                    value={barcode}
                    onChange={handleBarcodeInput}
                    onKeyDown={handleKeyPress}
                    placeholder="バーコードを入力してください (13桁)"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    style={{ width: '100%', padding: '8px', marginBottom: '1rem' }}
                />
                <div style={{ marginBottom: '1rem' }}>
                    <strong>合計 (税抜):</strong> {sum}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <strong>読み取った税抜金額:</strong>
                    <ul>
                        {entries.map((entry, index) => (
                            <li key={index}>{entry.basePrice}</li>
                        ))}
                    </ul>
                </div>
                <button onClick={handleReset} style={{ padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}>リセット</button>
                <button onClick={handleDownloadCSV} style={{ padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>CSVダウンロード</button>
            </div>
        </div>
    );
};

export default BarcodeScannerApp;
