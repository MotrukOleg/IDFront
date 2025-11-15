// src/pages/labs/lab-five/LabFive.tsx
import React, { useState, useEffect } from "react";
import {
    generateKeys,
    getAvailableKeys,
    downloadKey,
    deleteKey,
    loadKeyFromServer,
    importKey,
    importKeyFromFile,
    signText,
    signFile,
    verifyText,
    verifyFile,
    downloadBlob
} from "../../../services/api/lab-five/labFiveService";
import "./LabFive.css";

type TabType = 'keys' | 'sign' | 'verify';

interface KeysStatus {
    hasPublicKey: boolean;
    hasPrivateKey: boolean;
}

interface VerificationResult {
    isValid: boolean;
    message?: string;
}

interface ApiResponse {
    success?: boolean;
    message?: string;
    [key: string]: unknown;
}

export const LabFive = () => {
    const [activeTab, setActiveTab] = useState<TabType>('keys');
    const [publicKeyFileName, setPublicKeyFileName] = useState('');
    const [privateKeyFileName, setPrivateKeyFileName] = useState('');
    const [availableKeys, setAvailableKeys] = useState<string[]>([]);
    const [keysStatus, setKeysStatus] = useState<KeysStatus | null>(null);
    const [importKeyContent, setImportKeyContent] = useState('');
    const [importKeyFile, setImportKeyFile] = useState<File | null>(null);
    const [isPrivateKeyImport, setIsPrivateKeyImport] = useState(false);
    const [textToSign, setTextToSign] = useState('');
    const [signatureHex, setSignatureHex] = useState('');
    const [textToVerify, setTextToVerify] = useState('');
    const [signatureHexToVerify, setSignatureHexToVerify] = useState('');
    const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
    const [fileToSign, setFileToSign] = useState<File | null>(null);
    const [fileSignatureHex, setFileSignatureHex] = useState('');
    const [fileToVerify, setFileToVerify] = useState<File | null>(null);
    const [fileSignatureHexToVerify, setFileSignatureHexToVerify] = useState('');
    const [fileVerificationResult, setFileVerificationResult] = useState<VerificationResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        loadKeysAndStatus();
    }, []);

    const clearMessages = (): void => {
        setError(null);
        setSuccess(null);
    };

    const loadKeysAndStatus = async (): Promise<void> => {
        try {
            const keysResult = await getAvailableKeys();
            if ('files' in keysResult) {
                setAvailableKeys(keysResult.files as string[]);
            }
            const statusResult = await getKeysStatus();
            if ('hasPublicKey' in statusResult) {
                setKeysStatus(statusResult as KeysStatus);
            }
        } catch (err) {
            console.error('Error loading keys:', err);
        }
    };

    const handleGenerateKeys = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        clearMessages();
        setLoading(true);
        try {
            const result = (await generateKeys({
                publicKeyFileName: publicKeyFileName || undefined,
                privateKeyFileName: privateKeyFileName || undefined
            })) as ApiResponse;
            if ('success' in result && result.success) {
                setSuccess((result.message as string) || 'Keys generated successfully');
                setPublicKeyFileName('');
                setPrivateKeyFileName('');
                await loadKeysAndStatus();
            } else {
                setError((result.message as string) || 'Key generation failed');
            }
        } catch (err: unknown) {
            const error = err as Error;
            setError(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadKey = async (fileName: string, isPrivate: boolean): Promise<void> => {
        clearMessages();
        setLoading(true);
        try {
            const result = (await loadKeyFromServer({ fileName, isPrivateKey: isPrivate })) as ApiResponse;
            if ('success' in result && result.success) {
                setSuccess((result.message as string) || `${isPrivate ? 'Private' : 'Public'} key loaded successfully`);
                await loadKeysAndStatus();
            } else {
                setError((result.message as string) || 'Load key failed');
            }
        } catch (err: unknown) {
            const error = err as Error;
            setError(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadKey = async (fileName: string): Promise<void> => {
        try {
            const result = (await downloadKey(fileName)) as ApiResponse & { blob?: Blob; fileName?: string };
            if (result.success && result.blob) {
                downloadBlob(result.blob, result.fileName || fileName);
                setSuccess("Key downloaded successfully");
            } else {
                setError((result.message as string) || "Download failed");
            }
        } catch (err: unknown) {
            const error = err as Error;
            setError(`Error: ${error.message}`);
        }
    };

    const handleDeleteKey = async (fileName: string): Promise<void> => {
        if (!confirm(`Are you sure you want to delete ${fileName}?`)) {
            return;
        }
        try {
            const result = (await deleteKey(fileName)) as ApiResponse;
            if ('success' in result && result.success) {
                setSuccess((result.message as string) || 'Key deleted successfully');
                await loadKeysAndStatus();
            } else {
                setError((result.message as string) || 'Delete failed');
            }
        } catch (err: unknown) {
            const error = err as Error;
            setError(`Error: ${error.message}`);
        }
    };

    const handleImportKey = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        if (!importKeyContent && !importKeyFile) {
            setError("Enter key content or select a file");
            return;
        }
        clearMessages();
        setLoading(true);
        try {
            let result: ApiResponse;
            if (importKeyFile) {
                result = (await importKeyFromFile(importKeyFile, isPrivateKeyImport)) as ApiResponse;
            } else {
                result = (await importKey({
                    keyContent: importKeyContent,
                    isPrivateKey: isPrivateKeyImport
                })) as ApiResponse;
            }
            if ('success' in result && result.success) {
                setSuccess((result.message as string) || 'Key imported successfully');
                setImportKeyContent('');
                setImportKeyFile(null);
                await loadKeysAndStatus();
            } else {
                setError((result.message as string) || 'Import failed');
            }
        } catch (err: unknown) {
            const error = err as Error;
            setError(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSignText = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        if (!textToSign) {
            setError("Enter text to sign");
            return;
        }
        clearMessages();
        setLoading(true);
        try {
            const result = (await signText({ text: textToSign })) as ApiResponse & { signatureHex?: string };
            if ('signatureHex' in result) {
                setSignatureHex(result.signatureHex || '');
                setSuccess("Text signed successfully");
            } else {
                setError((result.message as string) || 'Signing failed');
            }
        } catch (err: unknown) {
            const error = err as Error;
            setError(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSignFile = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        if (!fileToSign) {
            setError("Select a file to sign");
            return;
        }
        clearMessages();
        setLoading(true);
        try {
            const result = (await signFile(fileToSign)) as ApiResponse & { signatureHex?: string };
            if ('signatureHex' in result) {
                setFileSignatureHex(result.signatureHex || '');
                setSuccess("File signed successfully");
            } else {
                setError((result.message as string) || 'File signing failed');
            }
        } catch (err: unknown) {
            const error = err as Error;
            setError(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyText = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        if (!textToVerify || !signatureHexToVerify) {
            setError("Enter text and signature to verify");
            return;
        }
        clearMessages();
        setLoading(true);
        try {
            const result = (await verifyText({
                text: textToVerify,
                signatureHex: signatureHexToVerify
            })) as ApiResponse & VerificationResult;
            if ('isValid' in result) {
                setVerificationResult(result);
                setSuccess(result.isValid ? "Signature is valid!" : "Signature is invalid!");
            } else {
                setError((result.message as string) || 'Verification failed');
            }
        } catch (err: unknown) {
            const error = err as Error;
            setError(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyFile = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        if (!fileToVerify || !fileSignatureHexToVerify) {
            setError("Select a file and enter signature to verify");
            return;
        }
        clearMessages();
        setLoading(true);
        try {
            const result = (await verifyFile(fileToVerify, fileSignatureHexToVerify)) as ApiResponse & VerificationResult;
            if ('isValid' in result) {
                setFileVerificationResult(result);
                setSuccess(result.isValid ? "File signature is valid!" : "File signature is invalid!");
            } else {
                setError((result.message as string) || 'Verification failed');
            }
        } catch (err: unknown) {
            const error = err as Error;
            setError(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string): void => {
        navigator.clipboard.writeText(text).then(() => {
            setSuccess("Copied to clipboard");
        });
    };

    return (
        <div className="labfive-page">
            <div className="labfive-header">
                <h1 className="labfive-title">Digital Signatures</h1>
            </div>

            <div className="tab-container">
                <button
                    className={`tab-button ${activeTab === 'keys' ? 'active' : ''}`}
                    onClick={() => setActiveTab('keys')}
                >
                    Key Management
                </button>
                <button
                    className={`tab-button ${activeTab === 'sign' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sign')}
                >
                    Sign
                </button>
                <button
                    className={`tab-button ${activeTab === 'verify' ? 'active' : ''}`}
                    onClick={() => setActiveTab('verify')}
                >
                    Verify
                </button>
            </div>

            {error && <div className="error-box">{error}</div>}
            {success && <div className="success-box">{success}</div>}

            {activeTab === 'keys' && (
                <div className="tab-content">
                    <div className="form-grid">
                        <div className="form-section">
                            <h3>Generate DSS Key Pair</h3>
                            <form onSubmit={handleGenerateKeys} className="labfive-form">
                                <label htmlFor="publicKeyFileName">Public Key File Name:</label>
                                <input
                                    id="publicKeyFileName"
                                    type="text"
                                    value={publicKeyFileName}
                                    onChange={(e) => setPublicKeyFileName(e.target.value)}
                                    className="labfive-input"
                                    placeholder="e.g., public_key.pem"
                                />
                                <label htmlFor="privateKeyFileName">Private Key File Name:</label>
                                <input
                                    id="privateKeyFileName"
                                    type="text"
                                    value={privateKeyFileName}
                                    onChange={(e) => setPrivateKeyFileName(e.target.value)}
                                    className="labfive-input"
                                    placeholder="e.g., private_key.pem"
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="labfive-btn primary"
                                >
                                    {loading ? "Generating..." : "Generate Keys"}
                                </button>
                            </form>
                        </div>

                        <div className="form-section">
                            <h3>Import Key</h3>
                            <form onSubmit={handleImportKey} className="labfive-form">
                                <label>
                                    <input
                                        type="radio"
                                        checked={!isPrivateKeyImport}
                                        onChange={() => setIsPrivateKeyImport(false)}
                                    />
                                    Public Key
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        checked={isPrivateKeyImport}
                                        onChange={() => setIsPrivateKeyImport(true)}
                                    />
                                    Private Key
                                </label>
                                <label htmlFor="importKeyContent">Key Content (PEM format):</label>
                                <textarea
                                    id="importKeyContent"
                                    value={importKeyContent}
                                    onChange={(e) => setImportKeyContent(e.target.value)}
                                    className="labfive-textarea"
                                    rows={6}
                                    placeholder="Paste key in PEM format or upload file below..."
                                />
                                <label htmlFor="importKeyFile">Or upload key file:</label>
                                <input
                                    id="importKeyFile"
                                    type="file"
                                    accept=".pem,.key"
                                    onChange={(e) => setImportKeyFile(e.target.files?.[0] || null)}
                                    className="labfive-file-input"
                                />
                                {importKeyFile && (
                                    <div className="file-info">
                                        <strong>File:</strong> {importKeyFile.name}
                                        <strong>Size:</strong> {(importKeyFile.size / 1024).toFixed(2)} KB
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="labfive-btn secondary"
                                >
                                    {loading ? "Importing..." : "Import Key"}
                                </button>
                            </form>
                        </div>

                        <div className="form-section">
                            <h3>Available Keys</h3>
                            <button
                                type="button"
                                onClick={loadKeysAndStatus}
                                className="labfive-btn secondary"
                                style={{ marginBottom: '16px' }}
                            >
                                Refresh Keys
                            </button>
                            {keysStatus && (
                                <div className="key-info">
                                    <strong>Public Key Loaded:</strong> {keysStatus.hasPublicKey ? '✓ Yes' : '✗ No'}
                                    <strong>Private Key Loaded:</strong> {keysStatus.hasPrivateKey ? '✓ Yes' : '✗ No'}
                                </div>
                            )}
                            <div className="keys-list">
                                <h4>Available Key Files:</h4>
                                {availableKeys.length > 0 ? (
                                    <ul className="key-list">
                                        {availableKeys.map((keyFile) => (
                                            <li key={keyFile} className="key-item">
                                                <span className="key-name">{keyFile}</span>
                                                <div className="key-actions">
                                                    <button
                                                        onClick={() => handleLoadKey(keyFile, keyFile.includes('private'))}
                                                        className="labfive-btn secondary"
                                                        style={{ fontSize: '0.9rem', padding: '4px 8px', minHeight: '2rem' }}
                                                    >
                                                        Load
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownloadKey(keyFile)}
                                                        className="download-btn"
                                                    >
                                                        Download
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteKey(keyFile)}
                                                        className="delete-btn"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="no-keys">No keys available</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'sign' && (
                <div className="tab-content">
                    <div className="form-grid">
                        <div className="form-section">
                            <h3>Sign Text</h3>
                            <form onSubmit={handleSignText} className="labfive-form">
                                <label htmlFor="textToSign">Text to sign:</label>
                                <textarea
                                    id="textToSign"
                                    value={textToSign}
                                    onChange={(e) => setTextToSign(e.target.value)}
                                    className="labfive-textarea"
                                    rows={6}
                                    placeholder="Enter text to sign..."
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="labfive-btn primary"
                                >
                                    {loading ? "Signing..." : "Sign Text"}
                                </button>
                            </form>
                            {signatureHex && (
                                <div className="result-section">
                                    <h4>Signature (HEX):</h4>
                                    <div className="result-with-copy">
                                        <textarea
                                            value={signatureHex}
                                            readOnly
                                            className="labfive-textarea readonly"
                                            rows={6}
                                        />
                                        <button
                                            onClick={() => copyToClipboard(signatureHex)}
                                            className="copy-btn"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="form-section">
                            <h3>Sign File</h3>
                            <form onSubmit={handleSignFile} className="labfive-form">
                                <label htmlFor="fileToSign">Select file to sign:</label>
                                <input
                                    id="fileToSign"
                                    type="file"
                                    onChange={(e) => setFileToSign(e.target.files?.[0] || null)}
                                    className="labfive-file-input"
                                    required
                                />
                                {fileToSign && (
                                    <div className="file-info">
                                        <strong>File:</strong> {fileToSign.name}
                                        <strong>Size:</strong> {(fileToSign.size / 1024).toFixed(2)} KB
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="labfive-btn primary"
                                >
                                    {loading ? "Signing..." : "Sign File"}
                                </button>
                            </form>
                            {fileSignatureHex && (
                                <div className="result-section">
                                    <h4>File Signature (HEX):</h4>
                                    <div className="result-with-copy">
                                        <textarea
                                            value={fileSignatureHex}
                                            readOnly
                                            className="labfive-textarea readonly"
                                            rows={6}
                                        />
                                        <button
                                            onClick={() => copyToClipboard(fileSignatureHex)}
                                            className="copy-btn"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'verify' && (
                <div className="tab-content">
                    <div className="form-grid">
                        <div className="form-section">
                            <h3>Verify Text Signature</h3>
                            <form onSubmit={handleVerifyText} className="labfive-form">
                                <label htmlFor="textToVerify">Text:</label>
                                <textarea
                                    id="textToVerify"
                                    value={textToVerify}
                                    onChange={(e) => setTextToVerify(e.target.value)}
                                    className="labfive-textarea"
                                    rows={4}
                                    placeholder="Enter text..."
                                    required
                                />
                                <label htmlFor="signatureHexToVerify">Signature (HEX):</label>
                                <textarea
                                    id="signatureHexToVerify"
                                    value={signatureHexToVerify}
                                    onChange={(e) => setSignatureHexToVerify(e.target.value)}
                                    className="labfive-textarea"
                                    rows={6}
                                    placeholder="Paste signature in HEX format..."
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="labfive-btn secondary"
                                >
                                    {loading ? "Verifying..." : "Verify Signature"}
                                </button>
                            </form>
                            {verificationResult && (
                                <div className={`result-section ${verificationResult.isValid ? 'valid' : 'invalid'}`}>
                                    <h4>{verificationResult.isValid ? '✓ Valid Signature' : '✗ Invalid Signature'}</h4>
                                </div>
                            )}
                        </div>

                        <div className="form-section">
                            <h3>Verify File Signature</h3>
                            <form onSubmit={handleVerifyFile} className="labfive-form">
                                <label htmlFor="fileToVerify">Select file:</label>
                                <input
                                    id="fileToVerify"
                                    type="file"
                                    onChange={(e) => setFileToVerify(e.target.files?.[0] || null)}
                                    className="labfive-file-input"
                                    required
                                />
                                {fileToVerify && (
                                    <div className="file-info">
                                        <strong>File:</strong> {fileToVerify.name}
                                        <strong>Size:</strong> {(fileToVerify.size / 1024).toFixed(2)} KB
                                    </div>
                                )}
                                <label htmlFor="fileSignatureHexToVerify">Signature (HEX):</label>
                                <textarea
                                    id="fileSignatureHexToVerify"
                                    value={fileSignatureHexToVerify}
                                    onChange={(e) => setFileSignatureHexToVerify(e.target.value)}
                                    className="labfive-textarea"
                                    rows={6}
                                    placeholder="Paste signature in HEX format..."
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="labfive-btn secondary"
                                >
                                    {loading ? "Verifying..." : "Verify File Signature"}
                                </button>
                            </form>
                            {fileVerificationResult && (
                                <div className={`result-section ${fileVerificationResult.isValid ? 'valid' : 'invalid'}`}>
                                    <h4>{fileVerificationResult.isValid ? '✓ Valid File Signature' : '✗ Invalid File Signature'}</h4>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};