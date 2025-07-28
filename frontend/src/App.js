import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import Home from "./components/Home";
import CoffeeReading from "./components/CoffeeReading";
import TarotReading from "./components/TarotReading";
import Navigation from "./components/Navigation";
import FuturisticBackground from "./components/FuturisticBackground";

function App() {
  return (
    <LanguageProvider>
      <div className="App relative min-h-screen overflow-hidden">
        <FuturisticBackground />
        <BrowserRouter>
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/coffee-reading" element={<CoffeeReading />} />
            <Route path="/tarot-reading" element={<TarotReading />} />
          </Routes>
        </BrowserRouter>
      </div>
    </LanguageProvider>
  );
}

export default App;

export default App;