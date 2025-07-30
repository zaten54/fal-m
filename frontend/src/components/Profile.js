import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Profile = () => {
  const { user, token, updateUser } = useAuth();
  const [selectedZodiac, setSelectedZodiac] = useState(user?.favorite_zodiac_sign || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");
  const [horoscopeHistory, setHoroscopeHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const zodiacSigns = {
    aries: { name: "Koç", icon: "♈", dates: "21 Mart - 19 Nisan", element: "Ateş", color: "apple-red" },
    taurus: { name: "Boğa", icon: "♉", dates: "20 Nisan - 20 Mayıs", element: "Toprak", color: "apple-green" },
    gemini: { name: "İkizler", icon: "♊", dates: "21 Mayıs - 20 Haziran", element: "Hava", color: "apple-yellow" },
    cancer: { name: "Yengeç", icon: "♋", dates: "21 Haziran - 22 Temmuz", element: "Su", color: "apple-blue" },
    leo: { name: "Aslan", icon: "♌", dates: "23 Temmuz - 22 Ağustos", element: "Ateş", color: "apple-orange" },
    virgo: { name: "Başak", icon: "♍", dates: "23 Ağustos - 22 Eylül", element: "Toprak", color: "apple-green" },
    libra: { name: "Terazi", icon: "♎", dates: "23 Eylül - 22 Ekim", element: "Hava", color: "apple-pink" },
    scorpio: { name: "Akrep", icon: "♏", dates: "23 Ekim - 21 Kasım", element: "Su", color: "apple-purple" },
    sagittarius: { name: "Yay", icon: "♐", dates: "22 Kasım - 21 Aralık", element: "Ateş", color: "apple-orange" },
    capricorn: { name: "Oğlak", icon: "♑", dates: "22 Aralık - 19 Ocak", element: "Toprak", color: "apple-gray" },
    aquarius: { name: "Kova", icon: "♒", dates: "20 Ocak - 18 Şubat", element: "Hava", color: "apple-blue" },
    pisces: { name: "Balık", icon: "♓", dates: "19 Şubat - 20 Mart", element: "Su", color: "apple-teal" }
  };

  // Profil güncelleme
  const updateProfile = async () => {
    if (!selectedZodiac) {
      setUpdateMessage("Lütfen bir burç seçin");
      return;
    }

    try {
      setIsUpdating(true);
      setUpdateMessage("");

      const response = await axios.put(
        `${API}/auth/profile`,
        { favorite_zodiac_sign: selectedZodiac },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Kullanıcı bilgilerini güncelle
      updateUser(response.data);
      setUpdateMessage("✅ Favori burcunuz başarıyla güncellendi!");
      
      // Burç geçmişini getir
      fetchHoroscopeHistory();

    } catch (error) {
      console.error("Profile update error:", error);
      setUpdateMessage("❌ Güncelleme hatası: " + (error.response?.data?.detail || error.message));
    } finally {
      setIsUpdating(false);
    }
  };

  // Burç geçmişini getir
  const fetchHoroscopeHistory = async () => {
    if (!selectedZodiac) return;

    try {
      setIsLoadingHistory(true);
      const response = await axios.get(
        `${API}/daily-horoscope/history/${selectedZodiac}?language=tr&limit=7`
      );
      setHoroscopeHistory(response.data);
    } catch (error) {
      console.error("Error fetching horoscope history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (selectedZodiac && selectedZodiac === user?.favorite_zodiac_sign) {
      fetchHoroscopeHistory();
    }
  }, [selectedZodiac, user]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  return (
    <div className="min-h-screen bg-apple-gray-50 pt-apple-3xl pb-apple-2xl">
      <div className="apple-container max-w-4xl">
        {/* Header */}
        <div className="text-center mb-apple-2xl">
          <h1 className="apple-text-display mb-apple-md">
            👤 Profil Ayarları
          </h1>
          <p className="apple-text-headline text-apple-gray-600">
            Kişisel bilgilerinizi yönetin ve favori burcunuzu seçin
          </p>
        </div>

        {/* User Info */}
        <div className="apple-card mb-apple-xl">
          <div className="flex items-center mb-apple-lg">
            <div className="w-16 h-16 bg-apple-blue/10 rounded-full flex items-center justify-center mr-apple-md">
              <span className="text-2xl">👤</span>
            </div>
            <div>
              <h2 className="apple-text-headline">
                {user?.email?.split('@')[0] || 'Kullanıcı'}
              </h2>
              <p className="apple-text-body text-apple-gray-600">
                {user?.email}
              </p>
              <div className="flex items-center mt-2 space-x-4">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-apple font-medium ${
                  user?.is_verified 
                    ? 'bg-apple-green/10 text-apple-green' 
                    : 'bg-apple-orange/10 text-apple-orange'
                }`}>
                  {user?.is_verified ? '✅ Doğrulandı' : '⚠️ Doğrulanmadı'}
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-apple font-medium bg-apple-blue/10 text-apple-blue">
                  📅 {formatDate(user?.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Zodiac Selection */}
        <div className="apple-card mb-apple-xl">
          <h3 className="apple-text-headline mb-apple-lg flex items-center">
            <span className="mr-3">⭐</span>
            Favori Burcunuzu Seçin
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-apple-sm mb-apple-lg">
            {Object.entries(zodiacSigns).map(([key, zodiac]) => (
              <button
                key={key}
                onClick={() => setSelectedZodiac(key)}
                className={`p-apple-md rounded-apple-lg border-2 apple-transition text-left apple-hover-lift ${
                  selectedZodiac === key
                    ? `border-${zodiac.color} bg-${zodiac.color}/5`
                    : 'border-apple-gray-200 hover:border-apple-gray-300'
                }`}
              >
                <div className="flex items-center mb-2">
                  <span className={`text-2xl mr-3 text-${zodiac.color}`}>
                    {zodiac.icon}
                  </span>
                  <div>
                    <h4 className="apple-text-subheadline font-semibold">
                      {zodiac.name}
                    </h4>
                    <p className="apple-text-caption text-apple-gray-500">
                      {zodiac.dates}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-apple-caption text-apple-gray-600">
                  <span className="mr-2">🔥</span>
                  <span>{zodiac.element}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Update Button */}
          <div className="flex items-center justify-between">
            <div>
              {updateMessage && (
                <p className={`apple-text-caption ${
                  updateMessage.includes('✅') ? 'text-apple-green' : 'text-apple-red'
                }`}>
                  {updateMessage}
                </p>
              )}
            </div>
            <button
              onClick={updateProfile}
              disabled={isUpdating || !selectedZodiac}
              className={`apple-button-primary ${
                isUpdating ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isUpdating ? 'Güncelleniyor...' : 'Güncelle'}
            </button>
          </div>
        </div>

        {/* Horoscope History */}
        {user?.favorite_zodiac_sign && (
          <div className="apple-card">
            <h3 className="apple-text-headline mb-apple-lg flex items-center">
              <span className="mr-3">📅</span>
              {zodiacSigns[user.favorite_zodiac_sign]?.name} Burcu Geçmişi
            </h3>

            {isLoadingHistory ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="flex items-center mb-2">
                      <div className="w-4 h-4 bg-apple-gray-200 rounded mr-3"></div>
                      <div className="h-4 bg-apple-gray-200 rounded w-32"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-apple-gray-200 rounded"></div>
                      <div className="h-3 bg-apple-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-apple-md">
                {horoscopeHistory.map((horoscope, index) => (
                  <div key={horoscope.id} className="border-l-4 border-apple-purple/20 pl-apple-md py-apple-sm">
                    <div className="flex items-center mb-2">
                      <span className={`text-lg mr-2 text-${zodiacSigns[horoscope.zodiac_sign]?.color}`}>
                        {zodiacSigns[horoscope.zodiac_sign]?.icon}
                      </span>
                      <span className="apple-text-subheadline font-semibold text-apple-gray-700">
                        {formatDate(horoscope.date)}
                      </span>
                    </div>
                    <p className="apple-text-body text-apple-gray-600 leading-relaxed">
                      {horoscope.content}
                    </p>
                  </div>
                ))}
                
                {horoscopeHistory.length === 0 && (
                  <div className="text-center py-apple-xl text-apple-gray-500">
                    <span className="text-4xl mb-apple-md block">📝</span>
                    <p className="apple-text-body">
                      Henüz burç yorumu geçmişi bulunmuyor
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;