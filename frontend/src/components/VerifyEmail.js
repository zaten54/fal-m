import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const { verifyEmail } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setError('Doğrulama token\'ı bulunamadı');
        setIsLoading(false);
        return;
      }

      const result = await verifyEmail(token);

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error);
      }

      setIsLoading(false);
    };

    verifyToken();
  }, [searchParams, verifyEmail]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-apple-gray-50 flex items-center justify-center py-apple-3xl px-apple-md">
        <div className="max-w-md w-full apple-card-elevated text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-apple-purple mx-auto mb-apple-lg"></div>
          <h1 className="apple-text-display mb-apple-md">
            Email Doğrulanıyor...
          </h1>
          <p className="apple-text-body">
            Lütfen bekleyin, email adresiniz doğrulanıyor.
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-apple-gray-50 flex items-center justify-center py-apple-3xl px-apple-md">
        <div className="max-w-md w-full apple-card-elevated text-center">
          <div className="text-apple-green text-6xl mb-apple-lg animate-float-subtle">
            ✅
          </div>
          
          <h1 className="apple-text-display mb-apple-md text-apple-green">
            Email Doğrulandı!
          </h1>
          
          <p className="apple-text-body mb-apple-xl">
            Tebrikler! Email adresiniz başarıyla doğrulandı. Artık hesabınızla giriş yapabilir ve tüm fal özelliklerimizi kullanabilirsiniz.
          </p>
          
          <div className="space-y-apple-md">
            <Link 
              to="/login" 
              className="apple-button-primary px-apple-xl py-apple-md text-apple-lg apple-hover-lift inline-flex items-center space-x-2 w-full justify-center"
            >
              <span className="text-xl">🔓</span>
              <span>Giriş Yap</span>
            </Link>
            
            <Link 
              to="/" 
              className="apple-button-secondary px-apple-xl py-apple-md text-apple-lg apple-hover-lift inline-flex items-center space-x-2 w-full justify-center"
            >
              <span className="text-xl">🏠</span>
              <span>Ana Sayfa</span>
            </Link>
          </div>
          
          <div className="mt-apple-xl bg-apple-blue/5 border border-apple-blue/20 rounded-apple p-apple-lg">
            <h3 className="apple-text-headline text-apple-blue mb-apple-sm">
              Şimdi Neler Yapabilirsiniz:
            </h3>
            <ul className="text-left apple-text-body space-y-1">
              <li>☕ Kahve falı okutabilirsiniz</li>
              <li>🃏 Tarot kartları çekebilirsiniz</li>
              <li>🤚 El falı bakabilirsiniz</li>
              <li>⭐ Astroloji haritanızı oluşturabilirsiniz</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-apple-gray-50 flex items-center justify-center py-apple-3xl px-apple-md">
      <div className="max-w-md w-full apple-card-elevated text-center">
        <div className="text-red-500 text-6xl mb-apple-lg">
          ❌
        </div>
        
        <h1 className="apple-text-display mb-apple-md text-red-600">
          Doğrulama Hatası
        </h1>
        
        <p className="apple-text-body mb-apple-lg">
          {error}
        </p>
        
        <div className="bg-red-50 border border-red-200 rounded-apple p-apple-lg mb-apple-lg">
          <h3 className="apple-text-headline text-red-600 mb-apple-sm">
            Olası Nedenler:
          </h3>
          <ul className="text-left apple-text-body text-red-600 space-y-1">
            <li>• Token süresi dolmuş olabilir</li>
            <li>• Link daha önce kullanılmış olabilir</li>
            <li>• Geçersiz veya bozuk link</li>
          </ul>
        </div>
        
        <div className="space-y-apple-md">
          <Link 
            to="/register" 
            className="apple-button-primary px-apple-xl py-apple-md text-apple-lg apple-hover-lift inline-flex items-center space-x-2 w-full justify-center"
          >
            <span className="text-xl">🔄</span>
            <span>Tekrar Kayıt Ol</span>
          </Link>
          
          <Link 
            to="/login" 
            className="apple-button-secondary px-apple-xl py-apple-md text-apple-lg apple-hover-lift inline-flex items-center space-x-2 w-full justify-center"
          >
            <span className="text-xl">🔓</span>
            <span>Giriş Yap</span>
          </Link>
        </div>
        
        <p className="apple-text-caption text-apple-gray-500 mt-apple-lg">
          Giriş yaparken "Doğrulama Emaili Tekrar Gönder" seçeneğini kullanabilirsiniz.
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;