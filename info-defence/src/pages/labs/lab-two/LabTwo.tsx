import React, { useState, useRef } from "react";
import { fetchLabOneGet, fetchLabTwoHashFile } from "../../../services/api/lab-two/labTwoService";
import "../lab-one/labOne.css";

export const LabTwo = () => {
    const [input, setInput] = useState('');
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const hashFileInputRef = useRef<HTMLInputElement>(null);
    const [fileHashResult, setFileHashResult] = useState<string | null>(null);

    const handleFetch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = await fetchLabOneGet({ input });
            setResult(data.hash || data);
        } catch (err: any) {
            setError(err.message || String(err));
        } finally {
            setLoading(false);
        }
    };

    const handleFileButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleClear = () => {
        setInput('');
        setResult(null);
        setFileHashResult(null);
        setError(null);
    };

    const handleSaveToFile = async (text: string, defaultFilename: string) => {
        if ("showSaveFilePicker" in window) {
            try {
                // @ts-ignore
                const handle = await window.showSaveFilePicker({
                    suggestedName: defaultFilename,
                    types: [
                        {
                            description: "Text Files",
                            accept: { "text/plain": [".txt"] },
                        },
                    ],
                });
                const writable = await handle.createWritable();
                await writable.write(text);
                await writable.close();
            } catch (err) {
                console.log(err);
            }
        } else {
            const filename = window.prompt("Enter filename to save:", defaultFilename);
            if (!filename) return;
            const blob = new Blob([text], { type: "text/plain" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.click();
            URL.revokeObjectURL(link.href);
        }
    };

    const handleReadFromFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const arrayBuffer = event.target?.result as ArrayBuffer;
            const byteArray = new Uint8Array(arrayBuffer);
            setFileBytes(byteArray);
            const decodedText = new TextDecoder().decode(byteArray);
            setFileText(decodedText);
            setInput(decodedText);
        };
        reader.readAsArrayBuffer(file);
    };


    const handleHashFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setLoading(true);
        setError(null);
        setFileHashResult(null);
        try {
            const data = await fetchLabTwoHashFile(file);
            setFileHashResult(data.hash || data);
        } catch (err: any) {
            setError((err as any).message || String(err));
        } finally {
            setLoading(false);
            e.target.value = ""; // allow re-selecting the same file
        }
    };

    return (
        <div className="labone-page">
            <div className="labone-header-simple">
                <h1 className="labone-title-simple">MD5 Hash Generator</h1>
            </div>
            <form className="labone-form-simple" onSubmit={handleFetch} autoComplete="off">
                <label htmlFor="inputString">Input String:</label>
                <input
                    id="inputString"
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="labone-input"
                    placeholder="Enter any string (spaces allowed)"
                />
                <div className="labone-btn-row" style={{ marginTop: "12px" }}>
                    <button type="submit" disabled={loading} className="labone-btn">
                        {loading ? "Loading..." : "Generate MD5"}
                    </button>
                    <button
                        type="button"
                        className="labone-btn"
                        style={{ marginLeft: "8px" }}
                        onClick={handleFileButtonClick}
                    >
                        Load from File
                    </button>
                    <input
                        ref={fileInputRef}
                        id="file-upload"
                        type="file"
                        onChange={handleReadFromFile}
                        style={{ display: "none" }}
                    />
                    <button
                        className="labone-btn"
                        style={{ marginLeft: "8px" }}
                        onClick={() => result && handleSaveToFile(result, "md5-hash.txt")}
                        disabled={!result}
                        type="button"
                    >
                        Save Result to File
                    </button>
                    <button
                        className="labone-btn"
                        style={{ marginLeft: "8px", background: "#43a047" }}
                        onClick={() => hashFileInputRef.current?.click()}
                        disabled={loading}
                        type="button"
                    >
                        Hash File
                    </button>
                    <input
                        ref={hashFileInputRef}
                        type="file"
                        style={{ display: "none" }}
                        onChange={handleHashFileInputChange}
                    />
                    <button
                        className="labone-btn"
                        style={{ marginLeft: "8px", background: "#bdbdbd", color: "#222" }}
                        onClick={handleClear}
                        type="button"
                    >
                        Clear
                    </button>
                </div>
            </form>

            {error && <div className="error-box">{error}</div>}
            {result && (
                <div className="info-box">
                    <strong>MD5 Hash (Input String):</strong>
                    <div style={{ wordBreak: "break-all", fontSize: "1.2rem", marginTop: "8px" }}>
                        {result}
                    </div>
                </div>
            )}
            {fileHashResult && (
                <div className="info-box">
                    <strong>MD5 Hash (File):</strong>
                    <div style={{ wordBreak: "break-all", fontSize: "1.2rem", marginTop: "8px" }}>
                        {fileHashResult}
                    </div>
                </div>
            )}
        </div>
    );
};
