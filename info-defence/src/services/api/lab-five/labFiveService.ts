// src/services/api/lab-five/labFiveService.ts
import axios from "axios";

const API_URL = "http://localhost:5000/api/labfive/";

interface GenerateKeysRequestDto {
    publicKeyFileName?: string;
    privateKeyFileName?: string;
}

interface LoadKeyRequestDto {
    fileName: string;
    isPrivateKey: boolean;
}

interface KeyImportRequestDto {
    keyContent: string;
    isPrivateKey: boolean;
}

interface SignatureRequestDto {
    text: string;
}

interface VerifyRequestDto {
    text: string;
    signatureHex: string;
}

interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
}

interface KeysStatusResponse {
    hasPublicKey: boolean;
    hasPrivateKey: boolean;
}

interface ErrorResponse {
    success: boolean;
    message: string;
    error?: string;
}

export async function generateKeys(request?: GenerateKeysRequestDto): Promise<ApiResponse<any> | ErrorResponse> {
    try {
        const { data } = await axios.post<ApiResponse<any>>(
            API_URL + "generate-keys",
            request || {}
        );
        return data;
    } catch (error: any) {
        if (error.response?.data) {
            return error.response.data;
        }
        return {
            success: false,
            message: `Network error: ${error.message}`
        };
    }
}

export async function getAvailableKeys(): Promise<{ files: string[] } | ErrorResponse> {
    try {
        const { data } = await axios.get<{ files: string[] }>(
            API_URL + "available-keys"
        );
        return data;
    } catch (error: any) {
        if (error.response?.data) {
            return error.response.data;
        }
        return {
            success: false,
            message: `Network error: ${error.message}`
        };
    }
}

export async function downloadKey(fileName: string): Promise<{ success: boolean; message?: string; blob?: Blob; fileName?: string }> {
    try {
        const response = await axios.get(
            API_URL + `download-key/${encodeURIComponent(fileName)}`,
            {
                responseType: 'blob'
            }
        );

        return {
            success: true,
            blob: response.data,
            fileName: fileName
        };
    } catch (error: any) {
        if (error.response?.data instanceof Blob) {
            const text = await error.response.data.text();
            try {
                const errorData = JSON.parse(text);
                return {
                    success: false,
                    message: errorData.message || 'Error downloading key'
                };
            } catch {
                return {
                    success: false,
                    message: 'Error downloading key'
                };
            }
        }
        return {
            success: false,
            message: `Network error: ${error.message}`
        };
    }
}

export async function deleteKey(fileName: string): Promise<ApiResponse<any> | ErrorResponse> {
    try {
        const { data } = await axios.delete(
            API_URL + `delete-key/${encodeURIComponent(fileName)}`
        );
        return data;
    } catch (error: any) {
        if (error.response?.data) {
            return error.response.data;
        }
        return {
            success: false,
            message: `Network error: ${error.message}`
        };
    }
}

export async function getPublicKey(): Promise<{ publicKey: string } | ErrorResponse> {
    try {
        const { data } = await axios.get<{ publicKey: string }>(
            API_URL + "public-key"
        );
        return data;
    } catch (error: any) {
        if (error.response?.data) {
            return error.response.data;
        }
        return {
            success: false,
            message: `Network error: ${error.message}`
        };
    }
}

export async function getPrivateKey(): Promise<{ privateKey: string } | ErrorResponse> {
    try {
        const { data } = await axios.get<{ privateKey: string }>(
            API_URL + "private-key"
        );
        return data;
    } catch (error: any) {
        if (error.response?.data) {
            return error.response.data;
        }
        return {
            success: false,
            message: `Network error: ${error.message}`
        };
    }
}

export async function getKeysStatus(): Promise<KeysStatusResponse | ErrorResponse> {
    try {
        const { data } = await axios.get<KeysStatusResponse>(
            API_URL + "keys-status"
        );
        return data;
    } catch (error: any) {
        if (error.response?.data) {
            return error.response.data;
        }
        return {
            success: false,
            message: `Network error: ${error.message}`
        };
    }
}

export async function loadKeyFromServer(request: LoadKeyRequestDto): Promise<ApiResponse<any> | ErrorResponse> {
    try {
        const { data } = await axios.post<ApiResponse<any>>(
            API_URL + "load-key",
            request
        );
        return data;
    } catch (error: any) {
        if (error.response?.data) {
            return error.response.data;
        }
        return {
            success: false,
            message: `Network error: ${error.message}`
        };
    }
}

export async function importKey(request: KeyImportRequestDto): Promise<ApiResponse<any> | ErrorResponse> {
    try {
        const { data } = await axios.post<ApiResponse<any>>(
            API_URL + "import-key",
            request
        );
        return data;
    } catch (error: any) {
        if (error.response?.data) {
            return error.response.data;
        }
        return {
            success: false,
            message: `Network error: ${error.message}`
        };
    }
}

export async function importKeyFromFile(file: File, isPrivateKey: boolean): Promise<ApiResponse<any> | ErrorResponse> {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('isPrivateKey', String(isPrivateKey));

        const { data } = await axios.post<ApiResponse<any>>(
            API_URL + "import-key-file",
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        return data;
    } catch (error: any) {
        if (error.response?.data) {
            return error.response.data;
        }
        return {
            success: false,
            message: `Network error: ${error.message}`
        };
    }
}

export async function signText(request: SignatureRequestDto): Promise<{ signatureHex: string } | ErrorResponse> {
    try {
        const { data } = await axios.post<{ signatureHex: string }>(
            API_URL + "sign-text",
            request
        );
        return data;
    } catch (error: any) {
        if (error.response?.data) {
            return error.response.data;
        }
        return {
            success: false,
            message: `Network error: ${error.message}`
        };
    }
}

export async function signFile(file: File): Promise<{ signatureHex: string } | ErrorResponse> {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const { data } = await axios.post<{ signatureHex: string }>(
            API_URL + "sign-file",
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        return data;
    } catch (error: any) {
        if (error.response?.data) {
            return error.response.data;
        }
        return {
            success: false,
            message: `Network error: ${error.message}`
        };
    }
}

export async function verifyText(request: VerifyRequestDto): Promise<{ isValid: boolean } | ErrorResponse> {
    try {
        const { data } = await axios.post<{ isValid: boolean }>(
            API_URL + "verify-text",
            request
        );
        return data;
    } catch (error: any) {
        if (error.response?.data) {
            return error.response.data;
        }
        return {
            success: false,
            message: `Network error: ${error.message}`
        };
    }
}

export async function verifyFile(file: File, signatureHex: string): Promise<{ isValid: boolean } | ErrorResponse> {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('signatureHex', signatureHex);

        const { data } = await axios.post<{ isValid: boolean }>(
            API_URL + "verify-file",
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        return data;
    } catch (error: any) {
        if (error.response?.data) {
            return error.response.data;
        }
        return {
            success: false,
            message: `Network error: ${error.message}`
        };
    }
}

export function downloadBlob(blob: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}