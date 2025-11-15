import React, { useState } from "react";
import {
    encryptText,
    decryptText,
    encryptFile,
    decryptFile,
    downloadBlob
} from "../../../services/api/lab-three/labThreeService";
import "./labThree.css";

type TabType = 'text' | 'file';

export const LabThree = () => {
    const [activeTab, setActiveTab] = useState<TabType>('text');

    const [textData, setTextData] = useState('');
    const [textPassword, setTextPassword] = useState('');
    const [textKeySize, setTextKeySize] = useState(128);
    const [encryptedResult, setEncryptedResult] = useState<any>(null);
    const [decryptedResult, setDecryptedResult] = useState('');
    const [encryptedData, setEncryptedData] = useState('');
    const [iv, setIv] = useState('');

    const [decryptPassword, setDecryptPassword] = useState('');
    const [decryptKeySize, setDecryptKeySize] = useState(128);

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [encryptedFile, setEncryptedFile] = useState<File | null>(null);
    const [filePassword, setFilePassword] = useState('');
    const [fileKeySize, setFileKeySize] = useState(128);

    const [fileDecryptPassword, setFileDecryptPassword] = useState('');
    const [fileDecryptKeySize, setFileDecryptKeySize] = useState(128);

    const [showTextPassword, setShowTextPassword] = useState(false);
    const [showDecryptPassword, setShowDecryptPassword] = useState(false);
    const [showFilePassword, setShowFilePassword] = useState(false);
    const [showFileDecryptPassword, setShowFileDecryptPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const clearMessages = () => {
        setError(null);
        setSuccess(null);
    };

    const handleTextEncrypt = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!textData || !textPassword) {
            setError("Enter text and password for encryption");
            return;
        }

        clearMessages();
        setLoading(true);

        try {
            const result = await encryptText({
                data: textData,
                password: textPassword,
                keySize: textKeySize
            });

            if (result.success) {
                setEncryptedResult(result);
                setEncryptedData(result.encryptedData || '');
                setIv(result.iv || '');
                setSuccess(result.message);
            } else {
                setError(result.message);
            }
        } catch (err: any) {
            setError(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleTextDecrypt = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!encryptedData || !decryptPassword) {
            setError("Enter encrypted data and password for decryption");
            return;
        }

        clearMessages();
        setLoading(true);

        try {
            const result = await decryptText({
                encryptedData: encryptedData,
                password: decryptPassword,
                keySize: decryptKeySize
            });

            if (result.success) {
                setDecryptedResult(result.decryptedData || '');
                setSuccess(result.message);
            } else {
                setError(result.message);
            }
        } catch (err: any) {
            setError(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleFileEncrypt = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile || !filePassword) {
            setError("Select a file and enter password for encryption");
            return;
        }

        clearMessages();
        setLoading(true);

        try {
            const result = await encryptFile(selectedFile, filePassword, fileKeySize);

            if (result.success && result.blob) {
                downloadBlob(result.blob, result.fileName || 'encrypted-file.rc5encrypted');
                setSuccess("File successfully encrypted and downloaded");
            } else {
                setError(result.message || "File encryption error");
            }
        } catch (err: any) {
            setError(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleFileDecrypt = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!encryptedFile || !fileDecryptPassword) {
            setError("Select encrypted file and enter password for decryption");
            return;
        }

        clearMessages();
        setLoading(true);

        try {
            const result = await decryptFile(encryptedFile, fileDecryptPassword, fileDecryptKeySize);

            if (result.success && result.blob) {
                downloadBlob(result.blob, result.fileName || 'decrypted-file');
                setSuccess("File successfully decrypted and downloaded");
            } else {
                setError(result.message || "File decryption error");
            }
        } catch (err: any) {
            setError(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setSuccess("Copied to clipboard");
        });
    };

    return (
        <div className="labthree-page">
            <div className="labthree-header">
                <h1 className="labthree-title">RC5 Encryption/Decryption</h1>
                <p className="labthree-subtitle">Secure encryption of texts and files</p>
            </div>

            <div className="tab-container">
                <button
                    className={`tab-button ${activeTab === 'text' ? 'active' : ''}`}
                    onClick={() => setActiveTab('text')}
                >
                    Text Encryption
                </button>
                <button
                    className={`tab-button ${activeTab === 'file' ? 'active' : ''}`}
                    onClick={() => setActiveTab('file')}
                >
                    File Encryption
                </button>
            </div>

            {error && <div className="error-box">{error}</div>}
            {success && <div className="success-box">{success}</div>}

            {activeTab === 'text' && (
                <div className="tab-content">
                    <div className="form-grid">
                        <div className="form-section">
                            <h3>Text Encryption</h3>
                            <form onSubmit={handleTextEncrypt} className="labthree-form">
                                <label htmlFor="textData">Text for encryption:</label>
                                <textarea
                                    id="textData"
                                    value={textData}
                                    onChange={(e) => setTextData(e.target.value)}
                                    className="labthree-textarea"
                                    rows={4}
                                    placeholder="Enter text for encryption..."
                                    required
                                />

                                <label htmlFor="textPassword">Password:</label>
                                <div className="password-input-container">
                                    <input
                                        id="textPassword"
                                        type={showTextPassword ? "text" : "password"}
                                        value={textPassword}
                                        onChange={(e) => setTextPassword(e.target.value)}
                                        className="labthree-input password-input"
                                        placeholder="Enter password..."
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle-btn"
                                        onClick={() => setShowTextPassword(!showTextPassword)}
                                    >
                                        {showTextPassword ? "Hide" : "Show"}
                                    </button>
                                </div>

                                <label htmlFor="textKeySize">Key size:</label>
                                <select
                                    id="textKeySize"
                                    value={textKeySize}
                                    onChange={(e) => setTextKeySize(Number(e.target.value))}
                                    className="labthree-select"
                                >
                                    <option value={64}>8 bytes</option>
                                    <option value={128}>16 bytes</option>
                                    <option value={256}>32 bytes</option>
                                </select>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="labthree-btn primary"
                                >
                                    {loading ? "Encrypting..." : "Encrypt"}
                                </button>
                            </form>

                            {encryptedResult && (
                                <div className="result-section">
                                    <h4>Encryption Result:</h4>
                                    <div className="result-item">
                                        <label>Encrypted data:</label>
                                        <div className="result-with-copy">
                                            <textarea
                                                value={encryptedResult.encryptedData}
                                                readOnly
                                                className="labthree-textarea readonly"
                                                rows={3}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => copyToClipboard(encryptedResult.encryptedData)}
                                                className="copy-btn"
                                            >
                                                Copy
                                            </button>
                                        </div>
                                    </div>
                                    <div className="result-item">
                                        <label>Initialization Vector (IV):</label>
                                        <div className="result-with-copy">
                                            <input
                                                value={encryptedResult.iv}
                                                readOnly
                                                className="labthree-input readonly"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => copyToClipboard(encryptedResult.iv)}
                                                className="copy-btn"
                                            >
                                                Copy
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="form-section">
                            <h3>Text Decryption</h3>
                            <form onSubmit={handleTextDecrypt} className="labthree-form">
                                <label htmlFor="encryptedData">Encrypted data:</label>
                                <textarea
                                    id="encryptedData"
                                    value={encryptedData}
                                    onChange={(e) => setEncryptedData(e.target.value)}
                                    className="labthree-textarea"
                                    rows={4}
                                    placeholder="Paste encrypted data..."
                                    required
                                />

                                <label htmlFor="decryptPassword">Password:</label>
                                <div className="password-input-container">
                                    <input
                                        id="decryptPassword"
                                        type={showDecryptPassword ? "text" : "password"}
                                        value={decryptPassword}
                                        onChange={(e) => setDecryptPassword(e.target.value)}
                                        className="labthree-input password-input"
                                        placeholder="Enter password for decryption..."
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle-btn"
                                        onClick={() => setShowDecryptPassword(!showDecryptPassword)}
                                    >
                                        {showDecryptPassword ? "Hide" : "Show"}
                                    </button>
                                </div>

                                <label htmlFor="decryptKeySize">Key size:</label>
                                <select
                                    id="decryptKeySize"
                                    value={decryptKeySize}
                                    onChange={(e) => setDecryptKeySize(Number(e.target.value))}
                                    className="labthree-select"
                                >
                                    <option value={64}> 8 bytes</option>
                                    <option value={128}>16 bytes</option>
                                    <option value={256}>32 bytes</option>
                                </select>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="labthree-btn secondary"
                                >
                                    {loading ? "Decrypting..." : "Decrypt"}
                                </button>
                            </form>

                            {decryptedResult && (
                                <div className="result-section">
                                    <h4>Decryption Result:</h4>
                                    <div className="result-item">
                                        <label>Decrypted text:</label>
                                        <div className="result-with-copy">
                                            <textarea
                                                value={decryptedResult}
                                                readOnly
                                                className="labthree-textarea readonly"
                                                rows={4}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => copyToClipboard(decryptedResult)}
                                                className="copy-btn"
                                            >
                                                Copy
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'file' && (
                <div className="tab-content">
                    <div className="form-grid">
                        <div className="form-section">
                            <h3>File Encryption</h3>
                            <form onSubmit={handleFileEncrypt} className="labthree-form">
                                <label htmlFor="fileInput">Select file:</label>
                                <input
                                    id="fileInput"
                                    type="file"
                                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                    className="labthree-file-input"
                                    required
                                />
                                {selectedFile && (
                                    <div className="file-info">
                                        <span>Selected file: {selectedFile.name}</span>
                                        <span>Size: {(selectedFile.size / 1024).toFixed(2)} KB</span>
                                    </div>
                                )}

                                <label htmlFor="filePassword">Password:</label>
                                <div className="password-input-container">
                                    <input
                                        id="filePassword"
                                        type={showFilePassword ? "text" : "password"}
                                        value={filePassword}
                                        onChange={(e) => setFilePassword(e.target.value)}
                                        className="labthree-input password-input"
                                        placeholder="Enter password for file..."
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle-btn"
                                        onClick={() => setShowFilePassword(!showFilePassword)}
                                    >
                                        {showFilePassword ? "Hide" : "Show"}
                                    </button>
                                </div>

                                <label htmlFor="fileKeySize">Key size:</label>
                                <select
                                    id="fileKeySize"
                                    value={fileKeySize}
                                    onChange={(e) => setFileKeySize(Number(e.target.value))}
                                    className="labthree-select"
                                >
                                    <option value={64}> 8 bytes</option>
                                    <option value={128}>16 bytes</option>
                                    <option value={256}>32 bytes</option>
                                </select>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="labthree-btn primary"
                                >
                                    {loading ? "Encrypting..." : "Encrypt File"}
                                </button>
                            </form>
                        </div>

                        <div className="form-section">
                            <h3>File Decryption</h3>
                            <form onSubmit={handleFileDecrypt} className="labthree-form">
                                <label htmlFor="encryptedFileInput">Select encrypted file:</label>
                                <input
                                    id="encryptedFileInput"
                                    type="file"
                                    accept=".rc5encrypted"
                                    onChange={(e) => setEncryptedFile(e.target.files?.[0] || null)}
                                    className="labthree-file-input"
                                    required
                                />
                                {encryptedFile && (
                                    <div className="file-info">
                                        <span>Selected file: {encryptedFile.name}</span>
                                        <span>Size: {(encryptedFile.size / 1024).toFixed(2)} KB</span>
                                    </div>
                                )}

                                <label htmlFor="fileDecryptPassword">Password:</label>
                                <div className="password-input-container">
                                    <input
                                        id="fileDecryptPassword"
                                        type={showFileDecryptPassword ? "text" : "password"}
                                        value={fileDecryptPassword}
                                        onChange={(e) => setFileDecryptPassword(e.target.value)}
                                        className="labthree-input password-input"
                                        placeholder="Enter password for decryption..."
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle-btn"
                                        onClick={() => setShowFileDecryptPassword(!showFileDecryptPassword)}
                                    >
                                        {showFileDecryptPassword ? "Hide" : "Show"}
                                    </button>
                                </div>

                                <label htmlFor="fileDecryptKeySize">Key size:</label>
                                <select
                                    id="fileDecryptKeySize"
                                    value={fileDecryptKeySize}
                                    onChange={(e) => setFileDecryptKeySize(Number(e.target.value))}
                                    className="labthree-select"
                                >
                                    <option value={64}> 8 bytes</option>
                                    <option value={128}>16 bytes</option>
                                    <option value={256}>32 bytes</option>
                                </select>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="labthree-btn secondary"
                                >
                                    {loading ? "Decrypting..." : "Decrypt File"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
