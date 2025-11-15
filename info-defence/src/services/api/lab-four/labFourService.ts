import axios from "axios";

const API_URL = "http://localhost:5000/api/LabFour/";

interface RsaKeyDto {
    pemKey: string;
}

interface GenerateKeysResponse {
    success: boolean;
    message: string;
    publicKey: {
        pemKey: string;
    };
    privateKeyPath: string;
    publicKeyPath: string;
}

interface ListKeysResponse {
    publicKeys: string[];
    privateKeys: string[];
}

interface EncryptionTextResponse {
    success: boolean;
    message: string;
    encryptedText: string;
    processingTimeMs: number;
}

interface DecryptionTextResponse {
    success: boolean;
    message: string;
    decryptedText: string;
}

interface ErrorResponse {
    success: boolean;
    message: string;
    error?: string;
}

export async function generateKeys(keySize: number = 2048): Promise<GenerateKeysResponse | ErrorResponse> {
    try {
        const { data } = await axios.post<GenerateKeysResponse>(
            API_URL + "generate-keys",
            null,
            {
                params: { keySize }
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

export async function getPublicKey(filename: string): Promise<RsaKeyDto | ErrorResponse> {
    try {
        const { data } = await axios.get<RsaKeyDto>(
            API_URL + `public-key/${filename}`
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

export async function downloadPublicKey(filename: string): Promise<{ success: boolean; message?: string; blob?: Blob; fileName?: string }> {
    try {
        const response = await axios.get(
            API_URL + `download-public-key/${filename}`,
            {
                responseType: 'blob'
            }
        );

        return {
            success: true,
            blob: response.data,
            fileName: filename
        };
    } catch (error: any) {
        if (error.response?.data instanceof Blob) {
            const text = await error.response.data.text();
            try {
                const errorData = JSON.parse(text);
                return {
                    success: false,
                    message: errorData.message || 'Error downloading public key'
                };
            } catch {
                return {
                    success: false,
                    message: 'Error downloading public key'
                };
            }
        }
        return {
            success: false,
            message: `Network error: ${error.message}`
        };
    }
}

export async function downloadPrivateKey(filename: string): Promise<{ success: boolean; message?: string; blob?: Blob; fileName?: string }> {
    try {
        const response = await axios.get(
            API_URL + `download-private-key/${filename}`,
            {
                responseType: 'blob'
            }
        );

        return {
            success: true,
            blob: response.data,
            fileName: filename
        };
    } catch (error: any) {
        if (error.response?.data instanceof Blob) {
            const text = await error.response.data.text();
            try {
                const errorData = JSON.parse(text);
                return {
                    success: false,
                    message: errorData.message || 'Error downloading private key'
                };
            } catch {
                return {
                    success: false,
                    message: 'Error downloading private key'
                };
            }
        }
        return {
            success: false,
            message: `Network error: ${error.message}`
        };
    }
}

export async function listKeys(): Promise<ListKeysResponse | ErrorResponse> {
    try {
        const { data } = await axios.get<ListKeysResponse>(
            API_URL + "keys"
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

export async function deleteKey(filename: string): Promise<{ success: boolean; message: string } | ErrorResponse> {
    try {
        const { data } = await axios.delete(
            API_URL + `delete-key/${filename}`
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

export async function encryptFile(
    file: File,
    publicKeyFilename?: string,
    publicKeyFile?: File,
    publicKeyPem?: string
): Promise<{ success: boolean; message?: string; blob?: Blob; fileName?: string }> {
    try {
        const formData = new FormData();
        formData.append('file', file);

        if (publicKeyFilename) {
            formData.append('publicKeyFilename', publicKeyFilename);
        }

        if (publicKeyFile) {
            formData.append('publicKeyFile', publicKeyFile);
        }

        if (publicKeyPem) {
            formData.append('publicKeyPem', publicKeyPem);
        }

        const response = await axios.post(
            API_URL + "encrypt-file",
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                responseType: 'blob'
            }
        );

        const contentDisposition = response.headers['content-disposition'];
        let fileName = `${file.name.split('.')[0]}_encrypted.dat`;
        if (contentDisposition) {
            const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
            if (fileNameMatch) {
                fileName = fileNameMatch[1];
            }
        }

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
                    message: errorData.message || 'File encryption error'
                };
            } catch {
                return {
                    success: false,
                    message: 'File encryption error'
                };
            }
        }
        return {
            success: false,
            message: `Network error: ${error.message}`
        };
    }
}

export async function decryptFile(
    encryptedFile: File,
    privateKeyFilename?: string,
    privateKeyFile?: File,
    privateKeyPem?: string
): Promise<{ success: boolean; message?: string; blob?: Blob; fileName?: string }> {
    try {
        const formData = new FormData();
        formData.append('file', encryptedFile);

        if (privateKeyFilename) {
            formData.append('privateKeyFilename', privateKeyFilename);
        }

        if (privateKeyFile) {
            formData.append('privateKeyFile', privateKeyFile);
        }

        if (privateKeyPem) {
            formData.append('privateKeyPem', privateKeyPem);
        }

        const response = await axios.post(
            API_URL + "decrypt-file",
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                responseType: 'blob'
            }
        );

        const contentDisposition = response.headers['content-disposition'];
        let fileName = 'decrypted-file';
        if (contentDisposition) {
            const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
            if (fileNameMatch) {
                fileName = fileNameMatch[1];
            }
        }

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
                    message: errorData.message || 'File decryption error'
                };
            } catch {
                return {
                    success: false,
                    message: 'File decryption error'
                };
            }
        }
        return {
            success: false,
            message: `Network error: ${error.message}`
        };
    }
}


export async function encryptText(
    text: string,
    publicKeyPem?: string,
    publicKeyFile?: File
): Promise<EncryptionTextResponse | ErrorResponse> {
    try {
        const formData = new FormData();
        formData.append('text', text);

        if (publicKeyPem) {
            formData.append('publicKeyPem', publicKeyPem);
        }

        if (publicKeyFile) {
            formData.append('publicKeyFile', publicKeyFile);
        }

        const { data } = await axios.post<EncryptionTextResponse>(
            API_URL + "encrypt-text",
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

export async function decryptText(
    encryptedText: string,
    privateKeyPem?: string,
    privateKeyFile?: File
): Promise<DecryptionTextResponse | ErrorResponse> {
    try {
        const formData = new FormData();
        formData.append('text', encryptedText);

        if (privateKeyPem) {
            formData.append('privateKeyPem', privateKeyPem);
        }

        if (privateKeyFile) {
            formData.append('privateKeyFile', privateKeyFile);
        }

        const { data } = await axios.post<DecryptionTextResponse>(
            API_URL + "decrypt-text",
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
