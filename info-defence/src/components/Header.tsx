import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";

export const Header = () => (
    <header className="app-header">
        <div className="app-header-title">
            <Link to="/" className="app-header-link">Info Defence Labs</Link>
        </div>
        <nav className="app-header-nav">
            <Link to="/labs/lab-one" className="app-header-link">Lab One</Link>
            <Link to="/labs/lab-two" className="app-header-link">Lab Two</Link>
            <Link to="/labs/lab-three" className="app-header-link">Lab Three</Link>
        </nav>
    </header>
);

