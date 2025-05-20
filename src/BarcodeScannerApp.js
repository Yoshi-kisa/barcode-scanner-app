import React, { useState, useRef, useEffect } from 'react';
import { supabase } from './supabaseClient';

const BarcodeScannerApp = () => {
    const [barcode, setBarcode] = useState('');
    const [sum, setSum] = useState(0);
    const [scannedData, setScannedData] = useState([]);
    const inputRef = useRef(null);

    const location = '本店';

    useEffect(() => {
        inputRef.current?.focus();
    }, [barcode]);

    const handleBarcode = async (value) => {
        const extracted = parseInt(value.slice(7, 12), 10);
        const basePrice = Math.ceil(extracted / 1.08);
        const entry = { barcode: value, price: basePrice };

        setScannedData(prev => [...prev, entry]);
        setSum(prev => prev + basePrice);
        setBarcode('');

        try {
            await supabase.from('scan_data').insert({
                location,
                barcode: value,
                price: basePrice
            });
        } catch (error) {
            console.error('Supabase送信エラー:', error);
        }
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
        setScannedData([]);
        inputRef.current?.focus();
    };

    const handleDownloadCSV = () => {
        const header = ['No', '税抜価格'];
        const rows = scannedData.map((item, i) => [i + 1, item.price]);
        const csvContent = [header, ...rows].map(e => e.join(',')).join('\n');

        const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
        const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
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
                    placeholder="バーコードを入力してください（13桁）"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    style={{ width: '100%', padding: '8px', marginBottom: '1rem' }}
                />
                <div style={{ marginBottom: '1rem' }}>
                    <strong>合計(税抜):</strong> {sum}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <strong>読み取った税抜金額:</strong>
                    <ul>
                        {scannedData.map((item, index) => (
                            <li key={index}>{item.price}</li>
                        ))}
                    </ul>
                </div>
                <button onClick={handleReset} style={{ padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}>リセットする</button>
                <button onClick={handleDownloadCSV} style={{ padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>CSVダウンロード</button>
            </div>
        </div>
    );
};

export default BarcodeScannerApp;
