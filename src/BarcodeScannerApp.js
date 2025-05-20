import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const BarcodeScannerApp = () => {
    const [barcode, setBarcode] = useState('');
    const [sum, setSum] = useState(0);
    const [numbers, setNumbers] = useState([]);
    const inputRef = useRef(null);

    const location = '本店';
    const scriptUrl = 'https://script.google.com/macros/s/AKfycbwzir7GwTvU42NUA2gbtrKaQG7qIWmiZL0-C86PNFspXci3_HuWeFHjFadl51EAfVmpZQ/exec';
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

        setNumbers(prev => [...prev, basePrice]);
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
                        {numbers.map((num, index) => (
                            <li key={index}>{num}</li>
                        ))}
                    </ul>
                </div>
                <button onClick={handleReset} style={{ padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>リセット</button>
            </div>
        </div>
    );
};

export default BarcodeScannerApp;
