import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const BarcodeScannerApp = () => {
    const [barcode, setBarcode] = useState('');
    const [sum, setSum] = useState(0);
    const [records, setRecords] = useState([]);
    const inputRef = useRef(null);

    const location = '本店';
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbzEveX2Nw5rzGdSuRFn2N2ZXI86LyGkys0CWjuOL95wycDMH-WMowx7poERRum3ms81/exec';

    useEffect(() => {
        inputRef.current?.focus();
    }, [barcode]);

    const sendToGoogleSheet = async (barcode, basePrice) => {
        try {
            const response = await axios.post(
                scriptUrl,
                {
                    location,
                    barcode,
                    price: basePrice
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log('送信成功:', response.data);
        } catch (error) {
            console.error('送信エラー:', error);
        }
    };

    const handleBarcode = async (value) => {
        const extractedNumber = parseInt(value.slice(7, 12), 10);
        const basePrice = Math.ceil(extractedNumber / 1.08);

        try {
            await sendToGoogleSheet(value, basePrice);
        } catch (err) {
            console.error("送信中にエラーが発生しました", err);
        }

        setRecords(prev => [...prev, { barcode: value, price: basePrice }]);
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
        setRecords([]);
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
    
        const csvContent = '\uFEFF' + [header, ...rows].map(e => e.join(',')).join('\n'); // UTF-8 BOMつき
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
                        {records.map((r, index) => (
                            <li key={index}>{r.price}</li>
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
