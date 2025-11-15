import React, { useState, useEffect } from "react";
import {
    generateKeys,
    getPublicKey,
    downloadPublicKey,
    downloadPrivateKey,
    listKeys,
    encryptFile,
    decryptFile,
    encryptText,
    decryptText,
    downloadBlob,
    deleteKey
} from "../../../services/api/lab-four/labFourService";
import "./labFour.css";

type TabType = 'keys' | 'text' | 'file';

export const LabFour = () => {
    const [activeTab, setActiveTab] = useState<TabType>('keys');

    const [keySize, setKeySize] = useState(2048);
    const [publicKeys, setPublicKeys] = useState<string[]>([]);
    const [privateKeys, setPrivateKeys] = useState<string[]>([]);
    const [generatedKeyPair, setGeneratedKeyPair] = useState<any>(null);

    const [textData, setTextData] = useState('');
    const [textPublicKeyPem, setTextPublicKeyPem] = useState('');
    const [textPublicKeyFile, setTextPublicKeyFile] = useState<File | null>(null);
    const [textEncryptedResult, setTextEncryptedResult] = useState<any>(null);

    const [encryptedTextData, setEncryptedTextData] = useState('');
    const [textPrivateKeyPem, setTextPrivateKeyPem] = useState('');
    const [textPrivateKeyFile, setTextPrivateKeyFile] = useState<File | null>(null);
    const [textDecryptedResult, setTextDecryptedResult] = useState('');

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePublicKeyPem, setFilePublicKeyPem] = useState('');
    const [filePublicKeyFile, setFilePublicKeyFile] = useState<File | null>(null);

    const [encryptedFile, setEncryptedFile] = useState<File | null>(null);
    const [filePrivateKeyPem, setFilePrivateKeyPem] = useState('');
    const [filePrivateKeyFile, setFilePrivateKeyFile] = useState<File | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        loadKeys();
    }, []);

    const clearMessages = () => {
        setError(null);
        setSuccess(null);
    };

    const loadKeys = async () => {
        try {
            const result = await listKeys();
            if ('publicKeys' in result) {
                setPublicKeys(result.publicKeys);
                setPrivateKeys(result.privateKeys);
            }
        } catch (err) {
            console.error('Error loading keys:', err);
        }
    };

    const handleGenerateKeys = async (e: React.FormEvent) => {
        e.preventDefault();
        clearMessages();
        setLoading(true);

        try {
            const result = await generateKeys(keySize);
            if ('success' in result && result.success) {
                setGeneratedKeyPair(result);
                setSuccess(result.message);
                await loadKeys();
            } else {
                setError('message' in result ? result.message : 'Key generation failed');
            }
        } catch (err: any) {
            setError(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPublicKey = async (filename: string) => {
        try {
            const result = await downloadPublicKey(filename);
            if (result.success && result.blob) {
                downloadBlob(result.blob, result.fileName!);
                setSuccess("Public key downloaded successfully");
            } else {
                setError(result.message || "Download failed");
            }
        } catch (err: any) {
            setError(`Error: ${err.message}`);
        }
    };

    const handleDownloadPrivateKey = async (filename: string) => {
        try {
            const result = await downloadPrivateKey(filename);
            if (result.success && result.blob) {
                downloadBlob(result.blob, result.fileName!);
                setSuccess("Private key downloaded successfully");
            } else {
                setError(result.message || "Download failed");
            }
        } catch (err: any) {
            setError(`Error: ${err.message}`);
        }
    };

    const handleDeleteKey = async (filename: string) => {
        if (!confirm(`Are you sure you want to delete ${filename}?`)) {
            return;
        }

        try {
            const result = await deleteKey(filename);
            if ('success' in result && result.success) {
                setSuccess(result.message);
                await loadKeys();
            } else {
                setError('message' in result ? result.message : 'Delete failed');
            }
        } catch (err: any) {
            setError(`Error: ${err.message}`);
        }
    };

    const handleTextEncrypt = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!textData || (!textPublicKeyPem && !textPublicKeyFile)) {
            setError("Enter text and provide a public key");
            return;
        }

        clearMessages();
        setLoading(true);

        try {
            const result = await encryptText(textData, textPublicKeyPem, textPublicKeyFile);
            if ('success' in result && result.success) {
                setTextEncryptedResult(result);
                setSuccess(result.message);
            } else {
                setError('message' in result ? result.message : 'Text encryption failed');
            }
        } catch (err: any) {
            setError(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleTextDecrypt = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!encryptedTextData || (!textPrivateKeyPem && !textPrivateKeyFile)) {
            setError("Enter encrypted text and provide a private key");
            return;
        }

        clearMessages();
        setLoading(true);

        try {
            console.log('Attempting to decrypt text:', encryptedTextData);
            const result = await decryptText(encryptedTextData, textPrivateKeyPem, textPrivateKeyFile);
            console.log('Decryption result:', result);

            if ('success' in result && result.success) {
                const decryptedMessage = result.decryptedText || '';
                console.log('Setting decrypted result:', decryptedMessage);
                setTextDecryptedResult(decryptedMessage);
                setSuccess(result.message);
            } else {
                console.error('Decryption failed:', result);
                setError('message' in result ? result.message : 'Text decryption failed');
            }
        } catch (err: any) {
            console.error('Decryption error:', err);
            setError(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleFileEncrypt = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile || (!filePublicKeyPem && !filePublicKeyFile)) {
            setError("Select a file and provide a public key (PEM or file)");
            return;
        }

        clearMessages();
        setLoading(true);

        try {
            const result = await encryptFile(selectedFile, undefined, filePublicKeyFile, filePublicKeyPem);
            if (result.success && result.blob) {
                downloadBlob(result.blob, result.fileName || 'encrypted-file.dat');
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
        if (!encryptedFile || (!filePrivateKeyPem && !filePrivateKeyFile)) {
            setError("Select encrypted file and provide a private key (PEM or file)");
            return;
        }

        clearMessages();
        setLoading(true);

        try {
            const result = await decryptFile(encryptedFile, undefined, filePrivateKeyFile, filePrivateKeyPem);
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
        <div className="labfour-page">
            <div className="labfour-header">
                <h1 className="labfour-title">RSA Encryption/Decryption</h1>
                <p className="labfour-subtitle">Public-key cryptography for secure communications</p>
            </div>

            <div className="tab-container">
                <button
                    className={`tab-button ${activeTab === 'keys' ? 'active' : ''}`}
                    onClick={() => setActiveTab('keys')}
                >
                    Key Management
                </button>
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

            {activeTab === 'keys' && (
                <div className="tab-content">
                    <div className="form-grid">
                        <div className="form-section">
                            <h3>Generate RSA Key Pair</h3>
                            <form onSubmit={handleGenerateKeys} className="labfour-form">
                                <label htmlFor="keySize">Key size:</label>
                                <select
                                    id="keySize"
                                    value={keySize}
                                    onChange={(e) => setKeySize(Number(e.target.value))}
                                    className="labfour-select"
                                >
                                    <option value={1024}>1024 bits</option>
                                    <option value={2048}>2048 bits</option>
                                    <option value={4096}>4096 bits</option>
                                </select>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="labfour-btn primary"
                                >
                                    {loading ? "Generating..." : "Generate Keys"}
                                </button>
                            </form>

                            {generatedKeyPair && (
                                <div className="result-section">
                                    <h4>Generated Key Pair:</h4>
                                    <div className="result-item">
                                        <label>Public Key (PEM):</label>
                                        <div className="result-with-copy">
                                            <textarea
                                                value={generatedKeyPair.publicKey.pemKey}
                                                readOnly
                                                className="labfour-textarea readonly"
                                                rows={8}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => copyToClipboard(generatedKeyPair.publicKey.pemKey)}
                                                className="copy-btn"
                                            >
                                                Copy
                                            </button>
                                        </div>
                                    </div>
                                    <div className="key-info">
                                        <span>Public Key File: {generatedKeyPair.publicKeyPath}</span>
                                        <span>Private Key File: {generatedKeyPair.privateKeyPath}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="form-section">
                            <h3>Available Keys</h3>
                            <button
                                type="button"
                                onClick={loadKeys}
                                className="labfour-btn secondary"
                                style={{ marginBottom: '16px' }}
                            >
                                Refresh Keys
                            </button>

                            <div className="keys-list">
                                <h4>Public Keys:</h4>
                                {publicKeys.length === 0 ? (
                                    <p className="no-keys">No public keys available</p>
                                ) : (
                                    <ul className="key-list">
                                        {publicKeys.map((key) => (
                                            <li key={key} className="key-item">
                                                <span className="key-name">{key}</span>
                                                <div className="key-actions">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDownloadPublicKey(key)}
                                                        className="download-btn"
                                                    >
                                                        Download
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteKey(key)}
                                                        className="delete-btn"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                <h4>Private Keys:</h4>
                                {privateKeys.length === 0 ? (
                                    <p className="no-keys">No private keys available</p>
                                ) : (
                                    <ul className="key-list">
                                        {privateKeys.map((key) => (
                                            <li key={key} className="key-item">
                                                <span className="key-name">{key}</span>
                                                <div className="key-actions">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDownloadPrivateKey(key)}
                                                        className="download-btn"
                                                    >
                                                        Download
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteKey(key)}
                                                        className="delete-btn"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'text' && (
                <div className="tab-content">
                    <div className="form-grid">
                        <div className="form-section">
                            <h3>Text Encryption</h3>
                            <form onSubmit={handleTextEncrypt} className="labfour-form">
                                <label htmlFor="textData">Text for encryption:</label>
                                <textarea
                                    id="textData"
                                    value={textData}
                                    onChange={(e) => setTextData(e.target.value)}
                                    className="labfour-textarea"
                                    rows={4}
                                    placeholder="Enter text for encryption..."
                                    required
                                />

                                <label htmlFor="textPublicKeyPem">Public Key (PEM format):</label>
                                <textarea
                                    id="textPublicKeyPem"
                                    value={textPublicKeyPem}
                                    onChange={(e) => setTextPublicKeyPem(e.target.value)}
                                    className="labfour-textarea"
                                    rows={6}
                                    placeholder="Paste public key in PEM format or upload file below..."
                                />

                                <label htmlFor="textPublicKeyFile">Or upload public key file:</label>
                                <input
                                    id="textPublicKeyFile"
                                    type="file"
                                    accept=".pem,.key,.pub"
                                    onChange={(e) => setTextPublicKeyFile(e.target.files?.[0] || null)}
                                    className="labfour-file-input"
                                />
                                {textPublicKeyFile && (
                                    <div className="file-info">
                                        <span>Selected: {textPublicKeyFile.name}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="labfour-btn primary"
                                >
                                    {loading ? "Encrypting..." : "Encrypt"}
                                </button>
                            </form>

                            {textEncryptedResult && (
                                <div className="result-section">
                                    <h4>Encryption Result:</h4>
                                    <div className="result-item">
                                        <label>Encrypted Text:</label>
                                        <div className="result-with-copy">
                                            <textarea
                                                value={textEncryptedResult.encryptedText}
                                                readOnly
                                                className="labfour-textarea readonly"
                                                rows={4}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => copyToClipboard(textEncryptedResult.encryptedText)}
                                                className="copy-btn"
                                            >
                                                Copy
                                            </button>
                                        </div>
                                    </div>
                                    <div className="processing-time">
                                        Processing time: {textEncryptedResult.processingTimeMs?.toFixed(2) || 'N/A'} ms
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="form-section">
                            <h3>Text Decryption</h3>
                            <form onSubmit={handleTextDecrypt} className="labfour-form">
                                <label htmlFor="encryptedTextData">Encrypted text:</label>
                                <textarea
                                    id="encryptedTextData"
                                    value={encryptedTextData}
                                    onChange={(e) => setEncryptedTextData(e.target.value)}
                                    className="labfour-textarea"
                                    rows={4}
                                    placeholder="Paste encrypted text..."
                                    required
                                />

                                <label htmlFor="textPrivateKeyPem">Private Key (PEM format):</label>
                                <textarea
                                    id="textPrivateKeyPem"
                                    value={textPrivateKeyPem}
                                    onChange={(e) => setTextPrivateKeyPem(e.target.value)}
                                    className="labfour-textarea"
                                    rows={6}
                                    placeholder="Paste private key in PEM format or upload file below..."
                                />

                                <label htmlFor="textPrivateKeyFile">Or upload private key file:</label>
                                <input
                                    id="textPrivateKeyFile"
                                    type="file"
                                    accept=".pem,.key"
                                    onChange={(e) => setTextPrivateKeyFile(e.target.files?.[0] || null)}
                                    className="labfour-file-input"
                                />
                                {textPrivateKeyFile && (
                                    <div className="file-info">
                                        <span>Selected: {textPrivateKeyFile.name}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="labfour-btn secondary"
                                >
                                    {loading ? "Decrypting..." : "Decrypt"}
                                </button>
                            </form>

                            {textDecryptedResult && (
                                <div className="decrypted-message-section">
                                    <h4>Decrypted Message:</h4>
                                    <div className="result-with-copy">
                                        <textarea
                                            value={textDecryptedResult}
                                            readOnly
                                            className="labfour-textarea readonly"
                                            rows={6}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => copyToClipboard(textDecryptedResult)}
                                            className="copy-btn"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                    <div className="message-info">
                                        Message length: {textDecryptedResult.length} characters
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
                            <form onSubmit={handleFileEncrypt} className="labfour-form">
                                <label htmlFor="fileInput">Select file:</label>
                                <input
                                    id="fileInput"
                                    type="file"
                                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                    className="labfour-file-input"
                                    required
                                />
                                {selectedFile && (
                                    <div className="file-info">
                                        <span>Selected file: {selectedFile.name}</span>
                                        <span>Size: {(selectedFile.size / 1024).toFixed(2)} KB</span>
                                    </div>
                                )}

                                <label htmlFor="filePublicKeyPem">Public Key (PEM format):</label>
                                <textarea
                                    id="filePublicKeyPem"
                                    value={filePublicKeyPem}
                                    onChange={(e) => setFilePublicKeyPem(e.target.value)}
                                    className="labfour-textarea"
                                    rows={6}
                                    placeholder="Paste public key in PEM format or upload file below..."
                                />

                                <label htmlFor="filePublicKeyFileInput">Or upload public key file:</label>
                                <input
                                    id="filePublicKeyFileInput"
                                    type="file"
                                    accept=".pem,.key,.pub"
                                    onChange={(e) => setFilePublicKeyFile(e.target.files?.[0] || null)}
                                    className="labfour-file-input"
                                />
                                {filePublicKeyFile && (
                                    <div className="file-info">
                                        <span>Public key: {filePublicKeyFile.name}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="labfour-btn primary"
                                >
                                    {loading ? "Encrypting..." : "Encrypt File"}
                                </button>
                            </form>
                        </div>

                        <div className="form-section">
                            <h3>File Decryption</h3>
                            <form onSubmit={handleFileDecrypt} className="labfour-form">
                                <label htmlFor="encryptedFileInput">Select encrypted file:</label>
                                <input
                                    id="encryptedFileInput"
                                    type="file"
                                    accept=".dat"
                                    onChange={(e) => setEncryptedFile(e.target.files?.[0] || null)}
                                    className="labfour-file-input"
                                    required
                                />
                                {encryptedFile && (
                                    <div className="file-info">
                                        <span>Selected file: {encryptedFile.name}</span>
                                        <span>Size: {(encryptedFile.size / 1024).toFixed(2)} KB</span>
                                    </div>
                                )}

                                <label htmlFor="filePrivateKeyPem">Private Key (PEM format):</label>
                                <textarea
                                    id="filePrivateKeyPem"
                                    value={filePrivateKeyPem}
                                    onChange={(e) => setFilePrivateKeyPem(e.target.value)}
                                    className="labfour-textarea"
                                    rows={6}
                                    placeholder="Paste private key in PEM format or upload file below..."
                                />

                                <label htmlFor="filePrivateKeyFileInput">Or upload private key file:</label>
                                <input
                                    id="filePrivateKeyFileInput"
                                    type="file"
                                    accept=".pem,.key"
                                    onChange={(e) => setFilePrivateKeyFile(e.target.files?.[0] || null)}
                                    className="labfour-file-input"
                                />
                                {filePrivateKeyFile && (
                                    <div className="file-info">
                                        <span>Private key: {filePrivateKeyFile.name}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="labfour-btn secondary"
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
