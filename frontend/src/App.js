import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import { AuthProvider } from "./context/AuthContext";
import Home from "./components/Home";
import CoffeeReading from "./components/CoffeeReading";
import TarotReading from "./components/TarotReading";
import PalmReading from "./components/PalmReading";
import AstrologyReading from "./components/AstrologyReading";
import FalnameReading from "./components/FalnameReading";
import Login from "./components/Login";
import Register from "./components/Register";
import VerifyEmail from "./components/VerifyEmail";
import TermsOfService from "./components/TermsOfService";
import Profile from "./components/Profile";
import Navigation from "./components/Navigation";
import AppleBackground from "./components/AppleBackground";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <div className="App relative min-h-screen">
          <AppleBackground />
          <BrowserRouter>
            <Navigation />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/coffee-reading" element={
                <ProtectedRoute>
                  <CoffeeReading />
                </ProtectedRoute>
              } />
              <Route path="/tarot-reading" element={
                <ProtectedRoute>
                  <TarotReading />
                </ProtectedRoute>
              } />
              <Route path="/palm-reading" element={
                <ProtectedRoute>
                  <PalmReading />
                </ProtectedRoute>
              } />
              <Route path="/astrology-reading" element={
                <ProtectedRoute>
                  <AstrologyReading />
                </ProtectedRoute>
              } />
              <Route path="/falname-reading" element={
                <ProtectedRoute>
                  <FalnameReading />
                </ProtectedRoute>
              } />
            </Routes>
          </BrowserRouter>
        </div>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;