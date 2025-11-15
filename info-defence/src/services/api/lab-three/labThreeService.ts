import axios from "axios";

const API_URL = "http://localhost:5000/api/LabThree/";

interface EncryptRequestDto {
    data: string;
    password: string;
    keySize: number;
}

interface DecryptRequestDto {
    encryptedData: string;
    password: string;
    keySize: number;
}

interface EncryptionResponseDto {
    success: boolean;
    message: string;
    encryptedData?: string;
    iv?: string;
    keySize?: number;
}

interface DecryptionResponseDto {
    success: boolean;
    message: string;
    decryptedData?: string;
}

interface FileOperationResponse {
    success: boolean;
    message: string;
}

export async function encryptText(request: EncryptRequestDto): Promise<EncryptionResponseDto> {
    try {
        const { data } = await axios.post<EncryptionResponseDto>(
            API_URL + "encrypt",
            request,
            {
                headers: {
                    'Content-Type': 'application/json'
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
            message: `Помилка мережі: ${error.message}`
        };
    }
}

export async function decryptText(request: DecryptRequestDto): Promise<DecryptionResponseDto> {
    try {
        const { data } = await axios.post<DecryptionResponseDto>(
            API_URL + "decrypt",
            request,
            {
                headers: {
                    'Content-Type': 'application/json'
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
            message: `Помилка мережі: ${error.message}`
        };
    }
}

export async function encryptFile(
    file: File,
    password: string,
    keySize: number
): Promise<{ success: boolean; message?: string; blob?: Blob; fileName?: string }> {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('password', password);
        formData.append('keySize', keySize.toString());

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
        let fileName = `${file.name.split('.')[0]}.rc5encrypted`;
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
                    message: errorData.message || 'Помилка шифрування файлу'
                };
            } catch {
                return {
                    success: false,
                    message: 'Помилка шифрування файлу'
                };
            }
        }
        return {
            success: false,
            message: `Помилка мережі: ${error.message}`
        };
    }
}

export async function decryptFile(
    encryptedFile: File,
    password: string,
    keySize: number
): Promise<{ success: boolean; message?: string; blob?: Blob; fileName?: string }> {
    try {
        const formData = new FormData();
        formData.append('encryptedFile', encryptedFile);
        formData.append('password', password);
        formData.append('keySize', keySize.toString());

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
                    message: errorData.message || 'Помилка дешифрування файлу'
                };
            } catch {
                return {
                    success: false,
                    message: 'Помилка дешифрування файлу'
                };
            }
        }
        return {
            success: false,
            message: `Помилка мережі: ${error.message}`
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
