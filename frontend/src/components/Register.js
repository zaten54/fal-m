import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Register = () => {
  const { register: registerUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const password = watch('password', '');

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    setSuccess(false);

    const result = await registerUser(data.email, data.password, data.acceptTerms);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-apple-gray-50 flex items-center justify-center py-apple-3xl px-apple-md">
        <div className="max-w-md w-full apple-card-elevated text-center">
          <div className="text-apple-green text-6xl mb-apple-lg animate-float-subtle">
            ✅
          </div>
          
          <h1 className="apple-text-display mb-apple-md text-apple-green">
            Kayıt Başarılı!
          </h1>
          
          <p className="apple-text-body mb-apple-lg">
            Hesabınız başarıyla oluşturuldu. Email adresinize gönderilen doğrulama linkine tıklayarak hesabınızı aktifleştirin.
          </p>
          
          <div className="bg-apple-blue/5 border border-apple-blue/20 rounded-apple p-apple-lg mb-apple-lg">
            <h3 className="apple-text-headline text-apple-blue mb-apple-sm">
              Sonraki Adımlar:
            </h3>
            <ol className="text-left apple-text-body space-y-2">
              <li>1. Email kutunuzu kontrol edin</li>
              <li>2. Doğrulama linkine tıklayın</li>
              <li>3. Hesabınızla giriş yapın</li>
            </ol>
          </div>
          
          <Link 
            to="/login" 
            className="apple-button-primary px-apple-xl py-apple-md text-apple-lg apple-hover-lift inline-flex items-center space-x-2"
          >
            <span className="text-xl">🔓</span>
            <span>Giriş Sayfasına Git</span>
          </Link>
          
          <p className="apple-text-caption text-apple-gray-500 mt-apple-lg">
            Email gelmedi mi? Spam klasörünüzü kontrol etmeyi unutmayın.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-apple-gray-50 flex items-center justify-center py-apple-3xl px-apple-md">
      <div className="max-w-md w-full apple-card-elevated">
        {/* Header */}
        <div className="text-center mb-apple-xl">
          <h1 className="apple-text-display mb-apple-md">
            <span className="text-apple-purple text-apple-4xl mr-4 animate-float-subtle">🔮</span>
            <span className="bg-gradient-to-r from-apple-purple to-apple-pink bg-clip-text text-transparent">
              Kayıt Ol
            </span>
          </h1>
          <p className="apple-text-body">
            falım'a katılın ve mistik dünyaya adım atın
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
                  value: 8,
                  message: 'Parola en az 8 karakter olmalıdır'
                },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: 'Parola en az bir büyük harf, bir küçük harf ve bir rakam içermelidir'
                }
              })}
              className="apple-input"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-500 text-apple-sm mt-2">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-apple-purple font-apple font-semibold text-apple-lg mb-2">
              Parola Tekrarı
            </label>
            <input
              type="password"
              id="confirmPassword"
              {...register('confirmPassword', {
                required: 'Parola tekrarı gereklidir',
                validate: value => 
                  value === password || 'Parolalar eşleşmiyor'
              })}
              className="apple-input"
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-apple-sm mt-2">{errors.confirmPassword.message}</p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-apple p-apple-md">
              <p className="text-red-600 text-apple-sm">{error}</p>
            </div>
          )}

          {/* Password Requirements */}
          <div className="bg-apple-blue/5 border border-apple-blue/20 rounded-apple p-apple-md">
            <h4 className="apple-text-headline text-apple-blue mb-apple-sm">Parola Gereksinimleri:</h4>
            <ul className="text-apple-sm text-apple-gray-600 space-y-1">
              <li>• En az 8 karakter</li>
              <li>• En az bir büyük harf</li>
              <li>• En az bir küçük harf</li>
              <li>• En az bir rakam</li>
            </ul>
          </div>

          {/* Terms of Service Agreement */}
          <div className="bg-red-50 border-2 border-red-200 rounded-apple p-apple-md">
            <h4 className="apple-text-headline text-red-600 mb-apple-sm">📜 Kullanıcı Sözleşmesi</h4>
            
            <div className="flex items-start space-x-3 mb-apple-md">
              <input
                type="checkbox"
                id="acceptTerms"
                {...register('acceptTerms', {
                  required: 'Kullanıcı sözleşmesini kabul etmelisiniz'
                })}
                className="mt-1 w-5 h-5 text-apple-purple bg-gray-100 border-gray-300 rounded focus:ring-apple-purple focus:ring-2"
              />
              <label htmlFor="acceptTerms" className="text-apple-sm text-red-700 leading-relaxed">
                <span className="font-bold">Zorunlu:</span> falım Kullanıcı Sözleşmesi'ni okudum ve kabul ediyorum. 
                Bu platformun sadece eğlence amaçlı olduğunu, hiçbir şekilde maddi/manevi dava açamayacağımı 
                ve tüm sorumluluktan feragat ettiğimi beyan ederim.
              </label>
            </div>
            
            <Link 
              to="/terms-of-service"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-apple-blue hover:text-blue-600 font-apple font-semibold apple-transition text-apple-sm"
            >
              <span>📖</span>
              <span>Kullanıcı Sözleşmesini Oku</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
            
            {errors.acceptTerms && (
              <p className="text-red-500 text-apple-sm mt-2 font-semibold">{errors.acceptTerms.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="apple-button-primary w-full py-apple-md text-apple-lg apple-hover-lift disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Kayıt oluşturuluyor...</span>
              </>
            ) : (
              <>
                <span className="text-xl">✨</span>
                <span>Hesap Oluştur</span>
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center mt-apple-lg pt-apple-lg border-t border-apple-gray-200">
          <p className="apple-text-body">
            Zaten hesabınız var mı?{' '}
            <Link 
              to="/login" 
              className="text-apple-blue hover:text-blue-600 font-apple font-semibold apple-transition"
            >
              Giriş Yapın
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;