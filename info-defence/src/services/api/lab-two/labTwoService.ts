import axios from "axios";

const API_URL = "http://localhost:5000/api/";

interface LabOneParams {
    input?: string;
}

export async function fetchLabOneGet({ input}: LabOneParams) {
    const { data } = await axios.get(API_URL + "LabTwo/GetHash", {
        params: { input },
    });

    return data;
}

export async function fetchLabTwoHashFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await axios.post(API_URL + "LabTwo/HashFile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
}