import axios from "axios";

const API_URL = "http://localhost:5000/api/";

interface LabOneParams {
    m: number;
    a: number;
    c: number;
    x0: number;
    n: number;
}

export async function fetchLabOneGet({ m, a, c, x0, n }: LabOneParams) {
    const { data } = await axios.get(API_URL + "LabOne", {
        params: { m, a, c, x0, n },
    });
    return data;
}