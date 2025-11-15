import React from "react";
import "./HomePage.css"
import { Link } from "react-router-dom";

export const Home = () => (
    <div className="home-page-container">
        <h1 className="home-page-title">Welcome to Info Defence Labs</h1>
        <p className="home-page-description">
            This is the home page. Use the navigation above to access different labs and features.
        </p>
        <div className="home-page-nav">
            <Link to="/labs/lab-one" className="home-page-link">Lab One</Link>
            <Link to="/labs/lab-two" className="home-page-link">Lab Two</Link>
            <Link to="/labs/lab-three" className="home-page-link">Lab Three</Link>
            <Link to="/labs/lab-four" className="home-page-link">Lab Four</Link>
        </div>
    </div>

);
