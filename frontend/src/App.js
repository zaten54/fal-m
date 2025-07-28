import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import CoffeeReading from "./components/CoffeeReading";
import Navigation from "./components/Navigation";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/coffee-reading" element={<CoffeeReading />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;