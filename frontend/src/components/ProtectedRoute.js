import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-apple-gray-50 flex items-center justify-center">
        <div className="apple-card text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-apple-purple mx-auto mb-apple-lg"></div>
          <h2 className="apple-text-headline mb-apple-md">Yükleniyor...</h2>
          <p className="apple-text-body">Lütfen bekleyin</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Kullanıcıyı giriş sayfasına yönlendir ve geri dönmesi için mevcut sayfayı kaydet
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;