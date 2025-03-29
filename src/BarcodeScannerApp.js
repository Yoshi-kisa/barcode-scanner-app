import React, { useState, useRef, useEffect } from 'react';

const BarcodeScannerApp = () => {
    const [barcode, setBarcode] = useState('');
    const [sum, setSum] = useState(0);
    const [numbers, setNumbers] = useState([]);
    const inputRef = useRef(null);

    useEffect(() => {
        // 自動フォーカス
        inputRef.current?.focus();
    }, [barcode]);

    const handleBarcodeInput = (e) => {
        const value = e.target.value;
        if (/^\d{13}$/.test(value)) {
            const extractedNumber = parseInt(value.slice(7, 12), 10); // 左から8〜12桁目を抽出 (税込価格)
            const basePrice = Math.round(extractedNumber / 1.08); // 税抜価格を計算 (8%消費税として計算)
            setNumbers(prev => [...prev, basePrice]);
            setSum(prevSum => prevSum + basePrice);
            setBarcode('');
        } else {
            setBarcode(value);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && /^\d{13}$/.test(barcode)) {
            const extractedNumber = parseInt(barcode.slice(7, 12), 10); // 左から8〜12桁目を抽出 (税込価格)
            const basePrice = Math.round(extractedNumber / 1.08); // 税抜価格を計算 (8%消費税として計算)
            setNumbers(prev => [...prev, basePrice]);
            setSum(prevSum => prevSum + basePrice);
            setBarcode('');
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
                <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>廃棄集計アプリ</h1>
                <input
                    type="text"
                    ref={inputRef}
                    value={barcode}
                    onChange={handleBarcodeInput}
                    onKeyDown={handleKeyPress}
                    placeholder="バーコードを入力してください (13桁)"
                    inputMode="numeric"
                    pattern="[0-9]*" 
                    className="mb-4"
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
