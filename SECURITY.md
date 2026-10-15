# Security / Güvenlik

Supported version: current main / Desteklenen sürüm: güncel main.

Never post credentials or exploit details in a public issue. Use GitHub **Security → Report a vulnerability** if available; otherwise open a minimal issue requesting a private contact without sensitive details. No response-time guarantee. Token exposure: reset in Developer Portal immediately, stop the bot, replace private configuration using setup and restart. Review affected hosting and Git history separately; gitignore is not history cleanup.

Public issue'ya token veya istismar ayrıntısı yazmayın. Varsa GitHub **Security → Report a vulnerability** kullanın; yoksa hassas ayrıntı vermeden özel iletişim talep eden kısa issue açın. Yanıt süresi garanti edilmez. Token sızarsa Portal'da hemen sıfırlayın, botu durdurun, kurulum yardımcısıyla özel yapılandırmayı yenileyin ve başlatın. Etkilenen host ve Git geçmişini ayrıca inceleyin; gitignore geçmişi temizlemez.

Safety boundaries: Guilds only, View/Send only, bot Administrator rejected, member-owned previews, fresh REST checks, bounded RAM/cooldowns, no retries and sanitized errors. Human permission changes can race sends; nonce is short-lived. Mocked tests and known-pattern scans are not a security certification. Dependencies must be pinned/reviewed and updated with tests; never disable checks to publish.

Güvenlik sınırları: yalnızca Guilds, View/Send, bot Administrator reddi, kullanıcıya bağlı önizleme, güncel REST kontrolleri, sınırlı RAM/cooldown, tekrarsız gönderim ve gizli hata ayrıntıları. İzin değişiklikleri gönderimle yarışabilir; nonce kısa ömürlüdür. Taklit testler ve bilinen pattern taraması güvenlik sertifikası değildir. Bağımlılıkları sabitleyip testlerle güncelleyin; yayımlamak için kontrolleri kapatmayın.
