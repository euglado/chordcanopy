# ChordCanopy

Türkçe aşağıda; [English instructions](#english).

## Türkçe

### Amaç

ChordCanopy, Discord müzik ve prova topluluklarında **kullanıcının girdiği akor sembollerini** başka bir perdeye taşır. Örneğin `C Am F G7/B` dizisini iki yarım ses yükseltmek `D Bm G A7/C#` sonucunu verir. Gerçek bir Discord botudur: slash komutu ve tıklanabilir özel önizlemeyle çalışır; GitHub Actions yalnızca kodu denetler. Depoyu indirmek botu çevrimiçi yapmaz.

### Özellikler ve sınırlar

- 1–24 akor, -11…+11 tam sayı yarım ses, diyez veya bemol çıktısı. `0` aynı perdeyi seçilen yazıma dönüştürür; `B#` → `C`, `Cb` → `B` gibi enharmonikler sadeleşir.
- Kök notaları `A B C D E F G`; isteğe bağlı **ASCII** `#` veya `b`. Sonda tek bir slash bası kullanılabilir: `Dm7/F`. Hem kök hem bas aynı miktarda taşınır.
- Desteklenen ekler: boş (majör), `m`, `maj7`, `m7`, `7`, `6`, `m6`, `9`, `m9`, `maj9`, `11`, `13`, `sus2`, `sus4`, `dim`, `dim7`, `aug`, `add9`, `5`. Büyük/küçük harf anlamlıdır. `Cmaj`, `Cm7b5`, çift diyez/bemol, `♯`/`♭`, bar çizgisi ve virgül kabul edilmez. Akorları boşlukla ayırın; form en çok 400 karakterdir.
- Türkçe/İngilizce özel sonuç; **Bu kanala paylaş / Vazgeç** düğmeleri. Paylaşım girdiyi ve sonucu görünür yapar; yalnızca Sunucuyu Yönet iznine sahip kişiler paylaşabilir. Üyeler özel hesaplama yapabilir.
- Beş dakikalık tek kullanımlık onay, güncel izin kontrolleri, mention/bağlantı önizlemesi bastırma; aynı üyeden özel istekler arasında 5 saniye ve kanalda paylaşım denemeleri arasında 60 saniye bekleme.

Bot akor bulmaz, parçaları aramaz, söz/nota dosyası almaz, müzik çalmaz, ses kanalına girmez, kayıt veya yayın indirmez. Mesajları okumaz, DM göndermez, rol/kanal değiştirmez, moderasyon yapmaz. Telifli sözleri veya dosyaları bu bota göndermeyin. Yalnızca düz akor sembolleri işlenir; ekler aynen korunur. Tonaliteye göre doğru enharmonik yazım, akorun müzikal bağlamı, enstrüman aralığı, capo veya çalınabilirlik hesaplanmaz. Standart Batı kromatik 12 perde sınıfını kullanır; mikrotonal sistemleri desteklemez. Sayı/açıklama hatası yerine desteklenmeyen semboller reddedilir.

### Gereksinimler

Node.js **24 LTS, en az 24.13**, npm (Node ile gelir), internet bağlantısı ve bot ekleyebildiğiniz bir Discord sunucusu. Kaynak kodu düzenlemek gerekmez. Bir bot uygulaması/tokenı ve sürekli açık kalan **tek** Node süreci gerekir. Veritabanı, web sunucusu, gelen port veya ücretli API yoktur. Kurulum indirme yapar. Tokenı özel tutun; GitHub deposu barındırma hizmeti değildir.

### Kurulum: Developer Portal'dan ilk komuta

1. [Node.js](https://nodejs.org/en/download) üzerinden 24 LTS kurun. Yeni terminalde `node --version` çıktısının `v24` ile başladığını doğrulayın.
2. Bu depoda **Code → Download ZIP** seçin ve arşivi tamamen çıkartın. Bulutla senkronize edilmeyen, yalnızca sizin eriştiğiniz bir klasör tercih edin. Alternatif: `git clone https://github.com/euglado/chordcanopy.git`.
3. [Discord Developer Portal](https://discord.com/developers/applications) içinde **New Application** ile size ait yeni bir uygulama açın. **General Information → Application ID** değerini kopyalayın. İsterseniz başkalarının botunuzu eklemesini engellemek için **Bot → Public Bot** seçeneğini kapatın.
4. **Bot → Reset Token** ile bot tokenını alın. Token şifredir; kimseyle paylaşmayın, issue/chat/ekran görüntüsü/terminal komutuna koymayın. Üç **Privileged Gateway Intents** anahtarı da kapalı kalsın: Presence, Server Members, Message Content. **Interactions Endpoint URL** boş kalsın; bot Gateway bağlantısıyla çalışır.
5. Discord'da **User Settings → Advanced → Developer Mode** açın. Sunucu simgesine sağ tıklayıp **Copy Server ID** seçin. Kanal veya kullanıcı ID'si kullanmayın.
6. Windows'ta çıkarttığınız klasörde `setup.cmd` dosyasını açın. macOS/Linux'ta aynı klasörde terminal açıp `bash setup.sh` çalıştırın. Yardımcı bağımlılıkları `npm ci --ignore-scripts` ile kurar; uygulama/sunucu ID'lerini ve **ekrana yazılmayan** tokenı sorar. Token alanı görünmez, yapıştırıp Enter'a basın. Gerçek terminal kullanın; IDE'nin salt okunur çıktı penceresi uygun değildir.
7. Yardımcının verdiği **tıklanabilir davet bağlantısını** tarayıcıda açın; doğru sunucuyu seçip onaylayın. Yalnızca **View Channel + Send Messages** gerekir (`3072`); **Administrator vermeyin**. Alternatif: Portal → OAuth2 URL Generator → `bot` ve `applications.commands` kapsamları, bu iki izin. Installation ayarlarında yalnızca **Guild Install** kullanın; User Install gerekmez.
8. Botun kullanılacağı normal metin kanalında bu iki bot iznini kontrol edin. Kanal yaş kısıtsız ve yavaş modu `0` olmalı; thread/forum/duyuru/ses kanalı desteklenmez. Üyeler View Channel, Send Messages ve Use Application Commands izinlerine sahip olmalı. Paylaşan kişide ayrıca **Manage Server / Sunucuyu Yönet** gerekir. Özel bir metin kanalı da olabilir; paylaşımlar kanalın mevcut izleyicilerine görünürdür.
9. Windows: `register.cmd`; macOS/Linux: `bash register.sh`. Başarılı mesajını bekleyin. Bu yalnızca yapılandırılan sunucuya `/chordcanopy` kaydeder; diğer komutları topluca silmez. Her açılışta kayıt gerekmez; komut değişince tekrar çalıştırın.
10. Windows: `start.cmd`; macOS/Linux: `bash start.sh`. **ChordCanopy ready / hazır** görünce Discord'da `/chordcanopy` yazın. Bu terminal açık ve bilgisayar uyanık kalmalıdır. Durdurmak için Ctrl+C.

Komut satırı alternatifi: bu klasörde `npm ci --ignore-scripts`, `npm run setup`, `npm run register`, `npm start`. Gerekli üç değer kurulum yardımcısıyla `.env` içine yazılır: `DISCORD_TOKEN`, `DISCORD_APPLICATION_ID`, `DISCORD_GUILD_ID`. Dosya zaten varsa kurulum onu **üzerine yazmaz**; kod dosyası düzenlenmez. `.env.example` yalnızca boş alanları gösterir. Tek sunucu/tek süreç desteklenir.

### Kullanım ve önizleme

1. `/chordcanopy chords:C Am F G7/B semitones:2 spelling:sharps language:tr` kullanın. Discord arayüzündeki seçenek kutularını doldurabilirsiniz; `spelling` verilmezse diyez, `language` verilmezse Discord diliniz Türkçeyse Türkçe, aksi halde İngilizce kullanılır.
2. Yalnızca sizin gördüğünüz önizlemede girdi, sonuç, kaydırma ve yazımı kontrol edin. Sonucun aynı kanala gönderileceğini ve girdinin de görüneceğini okuyun.
3. **Bu kanala paylaş** yalnızca yönetici izniyle tek mesaj gönderir; **Vazgeç** RAM taslağını siler. Süre dolarsa, bot yeniden başlarsa veya onay kullanılmışsa yeni komut açın. Sonuç metni sade ve renklerden bağımsızdır; ekran okuyucu/mobil kullanım canlı olarak ayrıca denenmelidir.

Örneğin `Bbmaj7 F/A Gm7`, `semitones:-2`, `spelling:flats` → `Abmaj7 Eb/G Fm7`. Desteklenmeyen ekler için sade bir sembol seçin; bot yanlış tahmin yapmaz.

### İzinler, güvenlik ve gizlilik

Bot yalnızca **Guilds** Gateway intentini ister. Mesaj/üye olay aboneliği, geçmiş mesaj okuma ve ses izni yoktur. Özel hesaplama ve paylaşım öncesi REST ile sunucu/roller/kanal ve yalnızca ilgili kullanıcı ile botun güncel üyeliği kontrol edilir; toplu üye listesi çekilmez. Botta Administrator varsa işlem reddedilir. Tarama/bekleme durumundaki veya timeout almış üyeler, belirsiz izin metaverisi ve erişilemeyen kanallar reddedilir. İnsanların izin değiştirmesiyle API gönderimi arasında küçük bir yarış aralığı kalabilir.

En çok 100 taslak; taslakta akor girdi/sonucu, dil, son kullanım zamanı ve kullanıcı/sunucu/kanal/özel mesaj ID'leri RAM'de en çok beş dakika tutulur. Tüketilen taslak hemen silinir; süresi dolanlar erişimde veya 30 saniyelik temizlikte kaldırılır. Her istek kapısı en çok 100 eşzamanlı işlem ve 1000 geçici bekleme kaydı tutar. İlgili üyelik/rol metaverisi REST kontrollerinde geçici işlenir. Mesaj/üye önbellekleri kapalıdır; Guilds intenti nedeniyle Discord.js sunucu/kanal/rol metaverisini süreç boyunca önbelleğe alabilir. Kalıcı veritabanı, analitik, dönüşüm geçmişi veya içerik logları yoktur. Discord ve sunucu operatörü kendi saklama kurallarına sahiptir; özel önizleme uçtan uca şifreleme değildir. Ayrıntı: [PRIVACY.md](PRIVACY.md).

Onay kullanıcıya, sunucuya, kanala ve özel mesaja bağlıdır; kullanıldıktan sonra başarı veya hata halinde tekrar göndermez. Ağ hatasında veya limitte otomatik tekrar yoktur; gönderim onaylanamazsa **yeniden denemeden önce kanalı kontrol edin**. Discord nonce deduplikasyonu kısa süreli ek korumadır; kalıcı tam-bir-kez garantisi değildir. Paylaşılmış mesajlar restart/iptal/taslak süresi dolmasıyla silinmez. Bot onları geri toplamaz; gerektiğinde sunucu yetkilisi Discord'dan kaldırır. Mention ve embed önizlemeleri bastırılır, fakat kullanıcıların normal kanal bildirimleri oluşabilir.

`.env` Git tarafından dışlanır; POSIX'te yeni dosya `0600` ile oluşturulur, Windows'ta klasör ACL'leri geçerlidir. Dosyayı bulut, paylaşılan disk veya yedekle istemeden paylaşmayın. Token sızarsa önce Portal'da **Reset Token**, botu durdurun, eski `.env` dosyasını özel olarak silin, yardımcısını yeniden çalıştırın ve botu başlatın. Gitignore eski commit'teki sırrı silmez. Tokenı destek isteğine eklemeyin. Güvenlik bildirimi: [SECURITY.md](SECURITY.md).

### Botu çalışır tutma

Geliştirmede açık terminal yeterlidir. Sürekli kullanımda kendi güvendiğiniz bilgisayar/VPS/Node barındırıcısı üzerinde Node 24 çalıştırın; bot klasörünü çalışma dizini ve `npm start` komutunu kullanın, gizli üç değeri hizmetin secret alanında veya özel `.env` dosyasında tutun. Harici secret alanı kullanırken `.env` oluşturmadan `node src/main.ts` çalıştırabilirsiniz. Hizmet durunca bot çevrimdışı olur; uyku modunu kapatın. Restart bütün bekleyen önizlemeleri ve yerel cooldown'ları sıfırlar; kötüye kullanımın sürekli restart ile aşılmaması için tek süreç çalıştırın ve sunucu komut izinlerini daraltın. CI hosting sağlamaz. Bu proje üretim servisini kurmaz veya değiştirmez.

### Sorun giderme

- **node bulunamadı / v24 değil:** Node 24 LTS kurun, terminali yeniden açın. ZIP'i çıkartın; arşivin içinden çalıştırmayın.
- **.env zaten var:** güvenli dosya korundu; normal kullanımda register/start çalıştırın. Token yenileme için yukarıdaki adımları izleyin.
- **Gizli token girişi çalışmıyor:** gerçek Terminal/PowerShell kullanın. Token görünmez; ekran çıktısına kopyalamayın.
- **Komut görünmüyor:** doğru application/server ID, doğru davet kapsamları, botun sunucuda üyeliği ve register başarı mesajını kontrol edin. Discord istemcisini yenileyin. Integration komut izinleri komutu gizleyebilir.
- **İşlem yapılamadı:** botun Administrator iznini kaldırın; View Channel/Send Messages kanal izinlerini kontrol edin. Yaş kısıtı, slowmode, thread/forum, screening veya timeout varsa normal bir kanal/uygun üye kullanın. Paylaşım ayrıca Manage Server gerektirir. Ağ/API hataları da aynı güvenli mesajı kullanır.
- **Girdi geçersiz:** kök büyük harf, `#`/`b` ASCII ve desteklenen ek olmalı; akorları boşlukla ayırın. Aralık -11…+11, en çok 24 sembol.
- **Süre dolmuş/kullanılmış:** yeni komut açın; başka kişinin veya başka mesajın düğmesi kullanılamaz.
- **İstek sınırı:** 5/60 saniye bekleyin; yetki kontrolünü geçmiş başarısız paylaşım da bekleme süresini kullanır. Çok yüksek yükte RAM kapasitesi dolarsa yeni önizlemeler reddedilir; süresi dolanları bekleyin.
- **Paylaşım doğrulanamadı:** önce kanalı kontrol edin; yeni önizleme açıp tekrar göndermek kopya oluşturabilir.
- **Bot çevrimdışı:** terminal/host açık mı, bağlantı ve token geçerli mi? Tokenı göstermeden kontrol edin. Aynı tokenla birden çok kopya çalıştırmayın.
- **Test özel env dosyası uyarısı:** geliştirici kontrollerinden önce özel `.env` dosyasını checkout dışındaki güvenli yere taşıyın; sonra geri koyun. Testler gerçek Discord tokenı istemez.

### Testler ve doğrulama kapsamı

Temiz kaynakta `npm ci --ignore-scripts`, `npm run check`, `npm audit --audit-level=low`. `check`: Node testleri, önerilen Biome kuralları/biçim, strict TypeScript (bağımlılık tipleri dahil), bağımlılık lisansı/registry/SHA-512/install-script metaverisi ve kaynak credential-pattern taraması. Lisanslar MIT, Apache-2.0, 0BSD ve gözden geçirilmiş MIT OR Apache-2.0 ile sınırlıdır. Bu taramalar tüm güvenlik açıklarının/sırların yokluğunu kanıtlamaz; npm audit kayıt veritabanının o andaki sonucudur.

CI Ubuntu, Windows ve macOS 15 Intel üzerinde aynı kontrolleri, Node/Bash yardımcı sözdizimini ve temiz diff'i çalıştırır; yalnızca `contents: read`, sabit action commitleri ve Node 24 kullanır. Testler tüm 12 kök/bas, 19 ek, 23 kaydırma ve iki yazımı; geçersiz girdi, güncel izinler, eşzamanlı tıklama, kimlik bağlama, expiry, cooldown, belirsiz gönderim ve gerçek REST kütüphanesinin tek-istek hata davranışını kapsar. Discord etkileşimleri ve HTTP taşıması taklittir; canlı sunucu/token/VDS kullanılmadı. Gerçek davet/komut/özel token girişi, mobil/ekran okuyucu ve kesintisiz hosting operatör tarafından ayrıca doğrulanmalıdır.

### Katkı ve lisans

Hata bildirimine token, özel ID veya özel akor içeriği eklemeyin; uydurma örnek ve beklenen/gerçek sonucu yazın. Yeni ekler için kapsamı, kuralları ve dönüşüm testlerini birlikte önerin. [CONTRIBUTING.md](CONTRIBUTING.md). Kod **MIT**: [LICENSE](LICENSE). Discord/Node/dependency markaları ilgili sahiplerinindir; proje Discord tarafından desteklendiğini iddia etmez.

## English

### Purpose

ChordCanopy transposes **user-entered chord symbols** inside Discord music and rehearsal communities. Shifting `C Am F G7/B` up two semitones produces `D Bm G A7/C#`. It is a real Gateway-connected Discord bot with a slash command and clickable private preview. GitHub Actions checks the source; downloading or publishing the repository does not run the bot.

### Features and limits

- 1–24 space-separated symbols, integer shifts from -11 through +11, sharp or flat output. Zero normalizes the spelling without changing pitch. Enharmonics such as `B#` and `Cb` become `C` and `B`.
- Roots `A B C D E F G`, optional ASCII `#`/`b`, and one optional slash bass (`Dm7/F`). Root and bass move together.
- Exact supported suffixes: empty (major), `m`, `maj7`, `m7`, `7`, `6`, `m6`, `9`, `m9`, `maj9`, `11`, `13`, `sus2`, `sus4`, `dim`, `dim7`, `aug`, `add9`, `5`. Case matters. `Cmaj`, `Cm7b5`, double accidentals, Unicode `♯`/`♭`, bars and commas are rejected. Maximum input: 400 characters.
- Turkish/English private result with **Share in this channel / Discard** buttons. Sharing exposes both input and output and requires Manage Server; ordinary members can calculate privately.
- Five-minute single-use confirmations, fresh access checks, suppressed mentions/embeds, five-second member request cooldown and 60-second channel share-attempt cooldown.

No chord/song lookup, lyrics, scores, files, audio, voice connections, recording, streaming downloads, DMs, message reading, role/channel changes or moderation. Do not submit copyrighted lyrics/files; only chord symbols are accepted. Suffixes remain unchanged. This uses the standard Western chromatic 12 pitch classes, with no microtonal support, key-aware enharmonic spelling, context analysis, instrument-range/capo calculation or playability evaluation. It rejects unsupported notation instead of guessing.

### Requirements

Node.js **24 LTS, 24.13 or later**, bundled npm, internet access and a Discord server where you can install a bot. No source editing required. You need your own bot application/token and **one continuously running Node process**. No database, web server, inbound ports or paid API. Setup downloads dependencies. GitHub is not bot hosting.

### Installation: Developer Portal to first command

1. Install Node 24 LTS from [Node.js](https://nodejs.org/en/download). In a new terminal, `node --version` must start with `v24`.
2. Choose **Code → Download ZIP** here, fully extract it into a private, preferably non-synced directory. Alternatively run `git clone https://github.com/euglado/chordcanopy.git`.
3. In the [Developer Portal](https://discord.com/developers/applications), select **New Application**, then copy **General Information → Application ID**. Optionally disable **Bot → Public Bot** to prevent other people installing your instance.
4. Open **Bot → Reset Token** and copy the token privately. It is a password: never paste it in an issue, chat, screenshot or terminal command. Keep all **Privileged Gateway Intents** off: Presence, Server Members and Message Content. Leave **Interactions Endpoint URL** empty; this bot uses the Gateway.
5. In Discord enable **User Settings → Advanced → Developer Mode**. Right-click your server icon and select **Copy Server ID**; do not use a channel/user ID.
6. Windows: open `setup.cmd` in the extracted folder. macOS/Linux: open a terminal there and run `bash setup.sh`. The helper installs with `npm ci --ignore-scripts`, asks for application/server IDs and a **hidden** token. Paste the token and press Enter; nothing echoes. Use a real terminal rather than a read-only IDE output pane.
7. Open the helper's **clickable invite URL**, confirm the intended server and authorize only **View Channel + Send Messages** (`3072`). Do not grant Administrator. Alternatively use Portal → OAuth2 URL Generator with `bot` and `applications.commands` scopes and those two permissions. Use **Guild Install** only in Installation settings; User Install is unnecessary.
8. Choose an ordinary, non-age-restricted text channel with slowmode `0`. Threads, forums, announcement and voice channels are unsupported. Check the bot's two channel permissions. Members need View Channel, Send Messages and Use Application Commands; sharing additionally requires **Manage Server**. A private text channel is supported; posts are visible to its existing audience.
9. Windows: `register.cmd`; macOS/Linux: `bash register.sh`. Wait for success. This creates/updates only `/chordcanopy` in the configured server and preserves other commands. Register once and after command changes, rather than every start.
10. Windows: `start.cmd`; macOS/Linux: `bash start.sh`. Wait for **ChordCanopy ready / hazır**, then use `/chordcanopy` in Discord. Keep the terminal open and machine awake. Stop with Ctrl+C.

Terminal alternative, from this folder: `npm ci --ignore-scripts`, `npm run setup`, `npm run register`, `npm start`. Setup writes `DISCORD_TOKEN`, `DISCORD_APPLICATION_ID`, `DISCORD_GUILD_ID` into private `.env`; it refuses to overwrite an existing file. No code editing. `.env.example` contains empty examples only. One server and one process per installation are supported.

### Usage and preview

1. Use `/chordcanopy chords:C Am F G7/B semitones:2 spelling:sharps language:en`, or fill the option boxes in Discord. Spelling defaults to sharps; language defaults to Turkish for Turkish Discord locales, otherwise English.
2. Inspect the private input, output, shift and spelling. The preview explicitly states that sharing exposes **both input and result** in the current channel.
3. Select **Share in this channel** to post one text result with Manage Server permission, or **Discard** to remove the RAM draft. Expiry, restart and consumed confirmations require a new command. Text does not rely on color; mobile/screen-reader use still requires live validation.

Example: `Bbmaj7 F/A Gm7`, shift `-2`, flats → `Abmaj7 Eb/G Fm7`. Use the supported spelling and suffixes; unsupported symbols are rejected.

### Permissions, security and privacy

Only the **Guilds** Gateway intent. No message/member event subscriptions, message-history or voice permission. Before calculation/sharing, fresh REST requests check guild, roles, channel and only the requesting member and bot membership; no bulk member list is fetched. Bot Administrator is rejected. Screening-pending/timed-out members, ambiguous permission metadata and inaccessible channels are rejected. Human permission changes can still race the final API call.

Up to 100 drafts hold chord input/output, language, expiry and user/guild/channel/private-message IDs in RAM for five minutes. Consumption removes the draft immediately; expiry is pruned on access or within the 30-second sweep. Each request gate caps 100 in-flight operations and 1000 temporary cooldown records. Membership/role metadata is processed transiently; message/member caches are disabled. Discord.js may cache guild/channel/role metadata while connected through Guilds. No database, analytics, conversion history or content logs. Discord and server operators have their own retention rules; ephemeral previews are not end-to-end encryption. See [PRIVACY.md](PRIVACY.md).

Confirmations bind user, server, channel and private message. Success or failure consumes them. Network failures/rate limits are never automatically retried; if delivery is uncertain, **inspect the channel before retrying**. Discord nonce deduplication is extra short-lived protection, not a durable exactly-once guarantee. Shared posts survive restart/discard/expiry and are not recalled; an authorized server moderator can remove them manually. Mentions and embeds are suppressed, but normal channel notifications remain possible.

Git ignores `.env`; newly created files use `0600` on POSIX and inherited directory ACLs on Windows. Avoid accidental cloud/shared-disk/backup disclosure. For a leaked token: **Reset Token** in the Portal first, stop the bot, privately delete old `.env`, rerun setup and start. Gitignore cannot remove secrets from old commits. Never include tokens in support requests. See [SECURITY.md](SECURITY.md).

### Keeping the bot running

An open terminal is enough for development. For continuous use, choose your trusted computer/VPS/Node host with Node 24, use the bot folder as working directory and `npm start`, and keep the three secrets in a private `.env` or host secret fields. With host-provided environment variables, use `node src/main.ts` without an `.env` file. Sleeping/offline hosts stop the bot. Restart clears previews and local cooldowns; run a single process and restrict server command permissions so repeated restarts cannot bypass your operating policy. CI does not host the bot; this project does not install or change production services.

### Troubleshooting

- **Missing node/wrong version:** install Node 24 LTS, reopen the terminal and extract the ZIP completely.
- **Existing .env:** preserved deliberately; run register/start for normal use, or follow token rotation above.
- **Hidden input unavailable:** use Terminal/PowerShell; no token characters should appear.
- **Missing slash command:** verify application/server IDs, invite scopes, bot membership and successful registration. Refresh Discord and check Integration command permissions.
- **Cannot continue:** remove bot Administrator; check channel View/Send permissions, age restriction, slowmode, unsupported channel type, screening or timeout. Sharing also needs Manage Server. Network/API failures use the same sanitized message.
- **Invalid input:** uppercase root, ASCII accidentals, supported suffix, space-separated symbols, shift -11…+11 and at most 24 chords.
- **Expired/used preview:** run a new command; another user's/message's button cannot authorize a post.
- **Request limit:** wait 5/60 seconds. Failed authorized share attempts count too; at RAM capacity, wait for previews to expire.
- **Unconfirmed sharing:** inspect the channel first; creating another preview can otherwise duplicate a delivered post.
- **Offline bot:** check the terminal/host, internet and token privately. Do not run multiple instances with one token.
- **Private env warning in checks:** temporarily move private `.env` outside the checkout into a safe location, then restore it afterward. Tests need no Discord token.

### Tests and verification scope

On a clean checkout: `npm ci --ignore-scripts`, `npm run check`, `npm audit --audit-level=low`. `check` runs Node tests, recommended Biome lint/format, strict TypeScript including dependency types, dependency license/registry/SHA-512/install-script metadata review and source credential-pattern scanning. Approved licenses: MIT, Apache-2.0, 0BSD and reviewed MIT OR Apache-2.0. Pattern/metadata checks cannot prove the absence of every secret or vulnerability; audit reflects the registry database at execution time.

CI repeats checks on Ubuntu, Windows and macOS 15 Intel, verifies Node/Bash helper syntax and clean diff, with only `contents: read`, pinned action commits and Node 24. Tests cover all 12 roots/basses, 19 suffixes, 23 shifts, both spellings, invalid input, fresh permissions, concurrent clicks, binding, expiry, cooldowns, uncertain delivery and the real REST library's one-request failure behavior. Discord interactions and HTTP transport are mocked. No real token/server/VDS was used. Operators must separately verify live installation, hidden-token entry, actual commands, mobile/screen-reader behavior and continuous hosting.

### Contributing and license

Use fictional inputs and expected/actual output in reports; omit tokens, private IDs and private chord content. Propose notation changes together with explicit scope and transposition tests. [CONTRIBUTING.md](CONTRIBUTING.md). **MIT**: [LICENSE](LICENSE). Discord/Node/dependency trademarks belong to their owners; no Discord endorsement is claimed.

### Official references / Resmî kaynaklar

[Discord interactions](https://docs.discord.com/developers/interactions/receiving-and-responding), [application commands](https://docs.discord.com/developers/interactions/application-commands), [Gateway](https://docs.discord.com/developers/events/gateway), [permissions](https://docs.discord.com/developers/topics/permissions), [messages and nonce](https://docs.discord.com/developers/resources/message), [Developer Policy](https://support-dev.discord.com/hc/en-us/articles/8563934450327-Discord-Developer-Policy), [discord.js](https://discord.js.org/docs/packages/discord.js/main).
