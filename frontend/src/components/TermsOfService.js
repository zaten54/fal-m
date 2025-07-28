import React from 'react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-apple-gray-50 pt-apple-3xl pb-apple-xl">
      <div className="apple-container">
        <div className="max-w-4xl mx-auto">
          <div className="apple-card-elevated">
            {/* Header */}
            <div className="text-center mb-apple-xl">
              <h1 className="apple-text-display mb-apple-md">
                <span className="text-apple-purple text-apple-4xl mr-4">📜</span>
                <span className="bg-gradient-to-r from-apple-purple to-apple-pink bg-clip-text text-transparent">
                  Kullanıcı Sözleşmesi
                </span>
              </h1>
              <p className="apple-text-body text-apple-gray-600">
                falım Hizmet Kullanım Şartları ve Koşulları
              </p>
              <div className="w-16 h-1 bg-gradient-to-r from-apple-purple to-apple-pink mx-auto rounded-full mt-apple-md"></div>
            </div>

            {/* Content */}
            <div className="prose max-w-none">
              <div className="space-y-apple-lg apple-text-body">
                
                {/* 1. Genel Hükümler */}
                <section>
                  <h2 className="apple-text-display text-apple-purple mb-apple-md">1. Genel Hükümler</h2>
                  <div className="bg-apple-blue/5 border border-apple-blue/20 rounded-apple p-apple-md mb-apple-md">
                    <p className="mb-apple-sm">
                      Bu sözleşme, falım platformunu kullanan tüm kullanıcılar için geçerlidir. 
                      Platforma kayıt olarak bu şartları kabul etmiş sayılırsınız.
                    </p>
                  </div>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>falım, AI destekli eğlence amaçlı fal ve astroloji hizmetleri sunar</li>
                    <li>Tüm yorumlar ve analizler eğlence amaçlıdır, gerçek hayat kararlarınızda referans almamalısınız</li>
                    <li>18 yaş altı kullanıcılar ebeveyn izni ile kullanabilir</li>
                    <li>Hesabınızın güvenliğinden siz sorumlusunuz</li>
                  </ul>
                </section>

                {/* 2. Hizmet Kapsamı */}
                <section>
                  <h2 className="apple-text-display text-apple-purple mb-apple-md">2. Hizmet Kapsamı</h2>
                  <p className="mb-apple-md">falım aşağıdaki hizmetleri sunar:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-apple-md">
                    <div className="apple-card">
                      <h4 className="apple-text-headline text-apple-orange mb-2">☕ Kahve Falı</h4>
                      <p className="apple-text-sm">AI ile kahve telvesi analizi</p>
                    </div>
                    <div className="apple-card">
                      <h4 className="apple-text-headline text-apple-purple mb-2">🃏 Tarot</h4>
                      <p className="apple-text-sm">Sanal tarot kartı çekimi</p>
                    </div>
                    <div className="apple-card">
                      <h4 className="apple-text-headline text-apple-blue mb-2">🤚 El Falı</h4>
                      <p className="apple-text-sm">Palmistry analizi</p>
                    </div>
                    <div className="apple-card">
                      <h4 className="apple-text-headline text-apple-yellow mb-2">⭐ Astroloji</h4>
                      <p className="apple-text-sm">Doğum haritası ve burç analizi</p>
                    </div>
                  </div>
                </section>

                {/* 3. SORUMLULUK REDDİ - EN ÖNEMLİ BÖLÜM */}
                <section className="bg-red-50 border-2 border-red-200 rounded-apple-lg p-apple-lg">
                  <h2 className="apple-text-display text-red-600 mb-apple-md">⚠️ 3. SORUMLULUK REDDİ VE YASAL KORUMA</h2>
                  
                  <div className="bg-white border border-red-300 rounded-apple p-apple-md mb-apple-md">
                    <h3 className="apple-text-headline text-red-600 mb-apple-sm">3.1 Mutlak Sorumluluk Reddi</h3>
                    <p className="font-bold text-red-700 mb-apple-sm">
                      KULLANICI, FALIM VE SAHİPLERİNE KARŞI HİÇBİR ŞEKİLDE MADDİ VEYA MANEVİ TAZMINAT DAVASI AÇAMAYACAĞINI, 
                      YASAL SÜREÇ BAŞLATAMAYACAĞINI PEŞINEN KABUL VE BEYAN EDER.
                    </p>
                    <ul className="space-y-1 list-disc list-inside text-red-600">
                      <li>Tüm fal yorumları tamamen eğlence amaçlıdır</li>
                      <li>Hiçbir yorum gerçek hayat kararlarında referans alınmamalıdır</li>
                      <li>Platform sahipleri sonuçlardan sorumlu değildir</li>
                      <li>AI analizleri kesinlikle bilimsel değildir</li>
                    </ul>
                  </div>

                  <div className="bg-white border border-red-300 rounded-apple p-apple-md mb-apple-md">
                    <h3 className="apple-text-headline text-red-600 mb-apple-sm">3.2 Dava Açma Hakkından Feragat</h3>
                    <p className="font-bold text-red-700">
                      Kullanıcı, platformu kullanarak aşağıdaki haklarından feragat ettiğini beyan eder:
                    </p>
                    <ul className="space-y-1 list-disc list-inside text-red-600 mt-2">
                      <li>Maddi tazminat talep etme hakkı</li>
                      <li>Manevi tazminat talep etme hakkı</li>
                      <li>Dava açma ve yasal süreç başlatma hakkı</li>
                      <li>İcra takibi başlatma hakkı</li>
                      <li>Ceza davası açma hakkı</li>
                    </ul>
                  </div>

                  <div className="bg-white border border-red-300 rounded-apple p-apple-md">
                    <h3 className="apple-text-headline text-red-600 mb-apple-sm">3.3 Yasal Uyarı</h3>
                    <p className="text-red-700 font-semibold">
                      Bu platform sadece eğlence amaçlıdır. Fal yorumlarına dayanarak alınan kararlardan, 
                      yaşanan zararlardan, psikolojik etkilerden veya herhangi bir olumsuzluktan 
                      falım ve sahipleri hiçbir şekilde sorumlu tutulamaz.
                    </p>
                  </div>
                </section>

                {/* 4. Kullanıcı Yükümlülükleri */}
                <section>
                  <h2 className="apple-text-display text-apple-purple mb-apple-md">4. Kullanıcı Yükümlülükleri</h2>
                  <ul className="space-y-2 list-disc list-inside">
                    <li>Doğru ve güncel bilgiler sağlamak</li>
                    <li>Hesap güvenliğini korumak</li>
                    <li>Platformu kötüye kullanmamak</li>
                    <li>Telif hakları ve yasalara saygı göstermek</li>
                    <li>Diğer kullanıcıların haklarına saygı göstermek</li>
                  </ul>
                </section>

                {/* 5. Gizlilik */}
                <section>
                  <h2 className="apple-text-display text-apple-purple mb-apple-md">5. Gizlilik ve Veri Koruma</h2>
                  <div className="bg-apple-green/10 border border-apple-green/20 rounded-apple p-apple-md">
                    <ul className="space-y-2 list-disc list-inside">
                      <li>Kişisel verileriniz KVKK kapsamında korunur</li>
                      <li>Email adresiniz sadece doğrulama için kullanılır</li>
                      <li>Fal geçmişiniz hesabınızda saklanır</li>
                      <li>Verileriniz üçüncü kişilerle paylaşılmaz</li>
                      <li>İstediğiniz zaman hesabınızı silebilirsiniz</li>
                    </ul>
                  </div>
                </section>

                {/* 6. Yasal Çerçeve */}
                <section>
                  <h2 className="apple-text-display text-apple-purple mb-apple-md">6. Yasal Çerçeve ve Uyuşmazlıklar</h2>
                  <div className="bg-apple-blue/10 border border-apple-blue/20 rounded-apple p-apple-md">
                    <ul className="space-y-2 list-disc list-inside">
                      <li>Bu sözleşme Türkiye Cumhuriyeti yasalarına tabidir</li>
                      <li>Uyuşmazlıklar İstanbul mahkemelerinde çözülür</li>
                      <li>Ancak kullanıcı dava açma hakkından feragat etmiştir</li>
                      <li>Tüm anlaşmazlıklar önce dostane yolla çözülmeye çalışılır</li>
                    </ul>
                  </div>
                </section>

                {/* 7. Sözleşme Değişiklikleri */}
                <section>
                  <h2 className="apple-text-display text-apple-purple mb-apple-md">7. Sözleşme Değişiklikleri</h2>
                  <p>
                    falım bu sözleşmeyi istediği zaman değiştirme hakkını saklı tutar. 
                    Değişiklikler platforma yayınlandığı anda yürürlüğe girer. 
                    Platformu kullanmaya devam ederek değişiklikleri kabul etmiş sayılırsınız.
                  </p>
                </section>

                {/* Son Güncelleme */}
                <div className="text-center mt-apple-xl pt-apple-lg border-t border-apple-gray-200">
                  <p className="apple-text-caption text-apple-gray-500">
                    Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
                  </p>
                  <p className="apple-text-caption text-apple-gray-500 mt-2">
                    Bu sözleşmeyi okuduğunuzu ve kabul ettiğinizi beyan edersiniz.
                  </p>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <div className="text-center mt-apple-xl">
              <Link 
                to="/register"
                className="apple-button-primary px-apple-xl py-apple-md text-apple-lg apple-hover-lift inline-flex items-center space-x-2"
              >
                <span>🔙</span>
                <span>Kayıt Sayfasına Dön</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;