import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const { login, resendVerification } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResendOption, setShowResendOption] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const { register, handleSubmit, formState: { errors }, getValues } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    setShowResendOption(false);

    const result = await login(data.email, data.password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
      // Email doğrulama hatası ise resend seçeneğini göster
      if (result.error.includes('email') || result.error.includes('doğrula')) {
        setShowResendOption(true);
      }
    }

    setIsLoading(false);
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setResendMessage('');
    
    const { email, password } = getValues();
    const result = await resendVerification(email, password);
    
    if (result.success) {
      setResendMessage('Doğrulama emaili tekrar gönderildi. Lütfen email adresinizi kontrol edin.');
    } else {
      setResendMessage(`Hata: ${result.error}`);
    }
    
    setResendLoading(false);
  };

  return (
    <div className="min-h-screen bg-apple-gray-50 flex items-center justify-center py-apple-3xl px-apple-md">
      <div className="max-w-md w-full apple-card-elevated">
        {/* Header */}
        <div className="text-center mb-apple-xl">
          <h1 className="apple-text-display mb-apple-md">
            <span className="text-apple-purple text-apple-4xl mr-4 animate-float-subtle">🔮</span>
            <span className="bg-gradient-to-r from-apple-purple to-apple-pink bg-clip-text text-transparent">
              Giriş Yap
            </span>
          </h1>
          <p className="apple-text-body">
            falım hesabınıza giriş yapın
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-apple-lg">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-apple-purple font-apple font-semibold text-apple-lg mb-2">
              Email Adresi
            </label>
            <input
              type="email"
              id="email"
              {...register('email', {
                required: 'Email adresi gereklidir',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Geçerli bir email adresi girin'
                }
              })}
              className="apple-input"
              placeholder="ornek@email.com"
            />
            {errors.email && (
              <p className="text-red-500 text-apple-sm mt-2">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-apple-purple font-apple font-semibold text-apple-lg mb-2">
              Parola
            </label>
            <input
              type="password"
              id="password"
              {...register('password', {
                required: 'Parola gereklidir',
                minLength: {
                  value: 6,
                  message: 'Parola en az 6 karakter olmalıdır'
                }
              })}
              className="apple-input"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-500 text-apple-sm mt-2">{errors.password.message}</p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-apple p-apple-md">
              <p className="text-red-600 text-apple-sm">{error}</p>
            </div>
          )}

          {/* Resend Verification */}
          {showResendOption && (
            <div className="bg-apple-blue/5 border border-apple-blue/20 rounded-apple p-apple-md">
              <p className="text-apple-blue text-apple-sm mb-apple-sm">
                Email adresinizi doğrulamanız gerekiyor.
              </p>
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="apple-button-secondary text-apple-sm px-apple-md py-apple-sm"
              >
                {resendLoading ? 'Gönderiliyor...' : 'Doğrulama Emaili Tekrar Gönder'}
              </button>
              {resendMessage && (
                <p className={`text-apple-sm mt-2 ${resendMessage.includes('Hata') ? 'text-red-600' : 'text-apple-green'}`}>
                  {resendMessage}
                </p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="apple-button-primary w-full py-apple-md text-apple-lg apple-hover-lift disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Giriş yapılıyor...</span>
              </>
            ) : (
              <>
                <span className="text-xl">🔓</span>
                <span>Giriş Yap</span>
              </>
            )}
          </button>
        </form>

        {/* Register Link */}
        <div className="text-center mt-apple-lg pt-apple-lg border-t border-apple-gray-200">
          <p className="apple-text-body">
            Hesabınız yok mu?{' '}
            <Link 
              to="/register" 
              className="text-apple-blue hover:text-blue-600 font-apple font-semibold apple-transition"
            >
              Kayıt Olun
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;