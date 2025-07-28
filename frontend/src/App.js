import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import Home from "./components/Home";
import CoffeeReading from "./components/CoffeeReading";
import TarotReading from "./components/TarotReading";
import PalmReading from "./components/PalmReading";
import AstrologyReading from "./components/AstrologyReading";
import Navigation from "./components/Navigation";
import AppleBackground from "./components/AppleBackground";

function App() {
  return (
    <LanguageProvider>
      <div className="App relative min-h-screen">
        <AppleBackground />
        <BrowserRouter>
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/coffee-reading" element={<CoffeeReading />} />
            <Route path="/tarot-reading" element={<TarotReading />} />
            <Route path="/palm-reading" element={<PalmReading />} />
            <Route path="/astrology-reading" element={<AstrologyReading />} />
          </Routes>
        </BrowserRouter>
      </div>
    </LanguageProvider>
  );
}

export default App;