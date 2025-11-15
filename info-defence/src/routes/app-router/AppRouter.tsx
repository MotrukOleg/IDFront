import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from "../../components/Header";
import { Home } from "../../pages/home-page/HopePage"; 
import { LabOne } from '../../pages/labs/lab-one/LabOne';
import { LabTwo } from "../../pages/labs/lab-two/LabTwo";
import { LabThree } from '../../pages/labs/lab-three/LabThree';
import { LabFour } from '../../pages/labs/lab-four/LabFour';


export const AppRouter = () => (
    <BrowserRouter>
        < Header />
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/labs/lab-one" element={<LabOne />} />
            <Route path="/labs/lab-two" element={<LabTwo />} />
            <Route path="/labs/lab-three" element={<LabThree />} />
            <Route path="/labs/lab-four" element={<LabFour />} />
        </Routes>
    </BrowserRouter>

);
