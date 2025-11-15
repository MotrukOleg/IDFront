import React, { useState } from "react";
import { fetchLabOneGet } from "../../../services/api/lab-one/labOneService";
import "./labOne.css";

interface SequenceListProps {
    items: number[];
    x0: string;
    startIndex: number;
}

interface SaveFilePickerOptions {
    suggestedName?: string;
    types?: Array<{ description: string; accept: Record<string, string[]> }>;
}

const SequenceList: React.FC<SequenceListProps> = React.memo(({ items, x0, startIndex }) => (
    <div className="sequence-list">
        {items.map((num, idx) => (
            <React.Fragment key={startIndex + idx}>
                <span className={num === Number(x0) ? "highlight-seed" : ""}>
                    {num}
                </span>
                {idx < items.length - 1 && <span>{", "}</span>}
            </React.Fragment>
        ))}
    </div>
));

export const LabOne = () => {
    const [m, setM] = useState('');
    const [a, setA] = useState('');
    const [c, setC] = useState('');
    const [x0, setX0] = useState('');
    const [n, setN] = useState('');
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSequence, setShowSequence] = useState(true);
    const [fade, setFade] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    const isValid = () => {
        const values = [m, a, c, x0, n];
        if (values.some(v => v === "")) return false;
        if (Number(n) < 2) return false;
        return true;
    };

    const handleFetch = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setResult(null);
        setCurrentPage(1);

        if (!isValid()) {
            setError("All fields are required and must be valid integers (n ≥ 2).");
            return;
        }

        setLoading(true);
        try {
            const data = await fetchLabOneGet({
                m: Number(m),
                a: Number(a),
                c: Number(c),
                x0: Number(x0),
                n: Number(n)
            });
            setResult(data);
        } catch (err: any) {
            setError(err.message || String(err));
        } finally {
            setLoading(false);
        }
    };

    const handleSaveSequence = async () => {
        if (!result?.seq) return;

        // Prepare metrics and sequence content
        const metrics = [
            `m: ${m}`,
            `a: ${a}`,
            `c: ${c}`,
            `x0: ${x0}`,
            `n: ${n}`
        ].join('\n');
        const sequence = result.seq.join(", ");
        const content = `${metrics}\n\nSequence:\n${sequence}`;

        try {
            if ("showSaveFilePicker" in globalThis) {
                const options: SaveFilePickerOptions = {
                    suggestedName: "generated-sequence.txt",
                    types: [{ description: "Text file", accept: { "text/plain": [".txt"] } }]
                };
                const handle = await (globalThis as any).showSaveFilePicker(options);
                const writable = await handle.createWritable();
                await writable.write(content);
                await writable.close();
            } else {
                const blob = new Blob([content], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "generated-sequence.txt";
                a.click();
                URL.revokeObjectURL(url);
            }
        } catch {
            setError("File save was cancelled or failed.");
        }
    };


    const handlePageChange = (newPage: number) => {
        setFade(false);
        setTimeout(() => {
            setCurrentPage(newPage);
            setFade(true);
        }, 200); // Duration matches CSS transition
    };

    const totalPages = result?.seq ? Math.ceil(result.seq.length / itemsPerPage) : 0;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = result?.seq?.slice(startIndex, startIndex + itemsPerPage) || [];

    return (
        <div className="labone-page">
            <div className="labone-header-simple">
                <h1 className="labone-title-simple">Pseudo Number Generator</h1>
            </div>
            <form className="labone-form-simple" onSubmit={handleFetch} autoComplete="off">
                <label htmlFor="modulus">Modulus (m):</label>
                <input
                    id="modulus"
                    type="number"
                    value={m}
                    onChange={e => setM(e.target.value)}
                    className="labone-input"
                    required
                />

                <label htmlFor="multiplier">Multiplier (a):</label>
                <input
                    id="multiplier"
                    type="number"
                    value={a}
                    onChange={e => setA(e.target.value)}
                    className="labone-input"
                    required
                />

                <label htmlFor="increment">Increment (c):</label>
                <input
                    id="increment"
                    type="number"
                    value={c}
                    onChange={e => setC(e.target.value)}
                    className="labone-input"
                    required
                />

                <label htmlFor="seed">Seed (x0):</label>
                <input
                    id="seed"
                    type="number"
                    value={x0}
                    onChange={e => setX0(e.target.value)}
                    className="labone-input"
                    required
                />

                <label htmlFor="count">Sequence Length (n):</label>
                <input
                    id="count"
                    type="number"
                    value={n}
                    onChange={e => setN(e.target.value)}
                    className="labone-input"
                    required
                />
                <div className="labone-btn-row">
                    <button type="submit" disabled={loading} className="labone-btn">
                        {loading ? "Loading..." : "Generate"}
                    </button>
                    <button
                        type="button"
                        className="labone-btn"
                        style={{ marginLeft: "16px" }}
                        onClick={handleSaveSequence}
                        disabled={!result || !result.seq}
                    >
                        Save to file
                    </button>
                </div>
            </form>

            {error && <div className="error-box">{error}</div>}
            {result && (
                <>
                    <div className="info-box">
                        <strong>Sequence estimation:</strong>
                        <div>Period = {result.period}</div>
                        <div>Actual value: {result.cesaroRatio}</div>
                        <div>Theoretical value: 3,141592653589793</div>
                    </div>
                    <div className="info-box">
                        <strong>Random sequence estimation:</strong>
                        <div>Period = {result.periodRandom}</div>
                        <div>Actual value: {result.cesaroRandomRatio}</div>
                        <div>Theoretical value: 3,141592653589793</div>
                    </div>
                    <div className="sequence-header">
                        <h2 className="sequence-title">Generated Sequence</h2>
                        <label className="sequence-toggle">
                            <input
                                type="checkbox"
                                checked={showSequence}
                                onChange={() => setShowSequence((v) => !v)}
                            />
                            Show
                        </label>
                    </div>
                    {showSequence && (
                        <div>
                            <div className={`fade-sequence${fade ? " in" : ""}`}>
                                <SequenceList items={currentItems} x0={x0} startIndex={startIndex} />
                            </div>
                            <div className="pagination-controls" style={{ marginTop: "16px", display: "flex", alignItems: "center", flexWrap: "wrap" }}>
                                <button
                                    className="labone-btn pagination-btn"
                                    onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                                    disabled={currentPage === 1}
                                    style={{ marginRight: 8 }}
                                >
                                    Previous
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(pageNum =>
                                        pageNum === 1 ||
                                        pageNum === totalPages ||
                                        (pageNum >= currentPage - 2 && pageNum <= currentPage + 2)
                                    )
                                    .map((pageNum, idx, arr) => {
                                        const prevPage = arr[idx - 1];
                                        return (
                                            <React.Fragment key={pageNum}>
                                                {prevPage && pageNum - prevPage > 1 && <span style={{ margin: "0 4px" }}>...</span>}
                                                <button
                                                    className={`labone-btn pagination-btn${currentPage === pageNum ? " active" : ""}`}
                                                    style={{
                                                        marginRight: 4,
                                                        minWidth: 24,
                                                        fontSize: "0.95rem",
                                                    }}
                                                    onClick={() => handlePageChange(pageNum)}
                                                    disabled={currentPage === pageNum}
                                                >
                                                    {pageNum}
                                                </button>
                                            </React.Fragment>
                                        );
                                    })}
                                <button
                                    className="labone-btn pagination-btn"
                                    onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    style={{ marginLeft: 8 }}
                                >
                                    Next
                                </button>

                            </div>

                        </div>
                    )}
                </>
            )}
        </div>
    );
};
