-- ==============================================================================
-- Portfolio Applications & Demonstrations Seed Data
-- Migration: portfolio_seed.sql
-- ==============================================================================

-- 1. Insert 14 Verified Baseline Applications
INSERT INTO public.portfolio_apps (
  id, name, package_name, category, short_description, key_features,
  development_status, is_published, is_suspended, google_play_url, icon_url,
  is_open_source, open_source_repo_url, tech_stack, acquisition_available,
  asking_price, currency, pricing_type, private_negotiation_notes, sort_order
) VALUES
(
  'moonroot-seedlight', 'Moonroot: Seedlight', 'com.moonroot.seedlight',
  'Games & Interactive Entertainment',
  'Atmospheric bioluminescent puzzle adventure where players guide ancient seed spirits through forgotten subterranean ruins using light manipulation.',
  ARRAY['Bioluminescent light-reflection mechanics', 'Procedural environmental puzzle levels', 'Minimalist immersive ambient soundtrack', 'Optimized battery footprint & offline play'],
  'published', true, false,
  'https://play.google.com/store/apps/details?id=com.moonroot.seedlight',
  'https://play-lh.googleusercontent.com/PRYVPBGBub2TPBlnJj0IREm_AvvNBtLb1iwzizzVH6bDGSdtgJ4lr5f7bC8kfnz3ZQ3pwrpOAjOefL7ycLsr=s0-br30',
  true, 'https://github.com/remotasks/moonroot-seedlight',
  ARRAY['Kotlin', 'Godot / C#', 'Custom Shader GLSL', 'Android NDK'],
  true, 350000, 'INR', 'negotiable', 'Open to full IP acquisition or code buyout with asset rights.', 1
),
(
  'emberline-odyssey', 'Emberline Odyssey', 'com.lumentrail.emberlineodyssey',
  'Games & Interactive Entertainment',
  'Fast-paced kinetic arcade odyssey navigating glowing ember trails through dynamic obstacles and rhythm-driven challenges.',
  ARRAY['Fluid 60 FPS particle dynamics', 'Dynamic obstacle choreography', 'Haptic feedback vibration engine', 'Zero pay-to-win arcade progression'],
  'published', true, false,
  'https://play.google.com/store/apps/details?id=com.lumentrail.emberlineodyssey',
  'https://play-lh.googleusercontent.com/f_c7guX70aWQT_GfxdRYwoGto6d5jWQemSTo33C5YG8ig0gaeqym0jMfge0F0XyUHXa9cdRDlMFgtgoiz8HJSqU=s0-br30',
  true, 'https://github.com/remotasks/emberline-odyssey',
  ARRAY['Kotlin', 'Unity Engine', 'Universal Render Pipeline', 'Android Oboe Audio'],
  true, 420000, 'INR', 'negotiable', 'Direct asset transfer available.', 2
),
(
  'city-cat-runner', 'City Cat Runner', 'com.shezadgames.citycatrunner',
  'Games & Interactive Entertainment',
  'Urban feline parkour endless runner navigating rooftops, alleyways, and obstacles across vibrant cityscapes.',
  ARRAY['High-speed rooftop parkour gameplay', 'Custom feline avatars & cosmetic skins', 'Dynamic weather & day-night lighting transitions', 'Touch & accelerometer responsive controls'],
  'suspended', false, true,
  'https://play.google.com/store/apps/details?id=com.shezadgames.citycatrunner',
  'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=256&h=256&fit=crop&q=80',
  true, 'https://github.com/remotasks/city-cat-runner',
  ARRAY['Java', 'Kotlin', 'libGDX', 'Box2D Physics'],
  true, NULL, 'INR', 'on_request', 'Suspended by Google Play. Source code and IP available for purchase or rebranding by third-party publisher.', 3
),
(
  'gps-map-camera-geotagging', 'GPS Map Camera : Geo Tagging', 'com.homedesignia.geocamera',
  'Photography, Camera & Personalization',
  'Real-time GPS coordinate stamping, address overlay, timestamp watermark, and compass telemetry for high-precision field photography.',
  ARRAY['Real-time latitude/longitude and address overlay', 'Customizable stamp templates, fonts & company logos', 'Offline GPS location caching for remote sites', 'High-resolution RAW & JPEG capture support'],
  'published', true, false,
  'https://play.google.com/store/apps/details?id=com.homedesignia.geocamera',
  'https://play-lh.googleusercontent.com/AyGz6ROfnCYIBd7RzjbaWIP-5Fu4-sAJkAKiEkfOH0vE-Y8H8PUj92d7Zm0TOcwVsXx2LCrsTRpJXjzhYpr8=s0-br30',
  false, NULL,
  ARRAY['Kotlin', 'CameraX API', 'Google Play Services Location', 'ExifInterface'],
  true, 650000, 'INR', 'negotiable', 'Active enterprise user base in civil survey and field inspection.', 4
),
(
  'snapglow-insta-filters', 'SnapGlow Insta Filters', 'com.snapglow.app',
  'Photography, Camera & Personalization',
  'Trendy aesthetic color presets, vintage film grain, retro VHS effects, and portrait enhancements for social creators.',
  ARRAY['50+ curated aesthetic presets & color LUTs', 'Real-time GLSL hardware shader rendering', 'Granular film grain, light leak, and blur sliders', 'Lossless ultra-HD photo export without watermark'],
  'published', true, false,
  'https://play.google.com/store/apps/details?id=com.snapglow.app',
  'https://play-lh.googleusercontent.com/_35H9kmroCy-fMLXCkrHimEIIk1AgpN8Jn2EbFAIHafC1IUA8kTAyCW6yJDB1sYlXoEcDN9pdfSxaLDxtAQ=s0-br30',
  true, 'https://github.com/remotasks/snapglow-filters',
  ARRAY['Kotlin', 'OpenGL ES 3.0', 'GPUImage', 'RenderScript'],
  true, 500000, 'INR', 'fixed', 'Clean codebase with modular GPU shader effects.', 5
),
(
  'ai-edge-on-device-ai', 'AI Edge: On-Device AI', 'ai.offlinellm.assistant',
  'AI & Smart Utilities',
  'Private, local on-device LLM assistant running quantized neural models completely offline without cloud servers or telemetry.',
  ARRAY['100% offline inference utilizing on-device NPU/GPU', 'Complete data privacy — zero queries leave device', 'Markdown, code syntax highlighting, & math formatting', 'Support for GGUF / MediaPipe LLM models'],
  'published', true, false,
  'https://play.google.com/store/apps/details?id=ai.offlinellm.assistant',
  'https://play-lh.googleusercontent.com/vhX-l-eH1yp-WfQ9mzNBVheugJA1uMyaFPM_ja1kIynOocY2VSFVl3gPcpxDUGsPwsFGP13TyyPjAH7K5NoU8g4=s0-br30',
  true, 'https://github.com/remotasks/ai-edge-offline',
  ARRAY['Kotlin', 'MediaPipe LLM Inference', 'TensorFlow Lite', 'llama.cpp JNI'],
  true, 1200000, 'INR', 'negotiable', 'Cutting edge on-device inference architecture with zero backend server costs.', 6
),
(
  'speech-to-text-ai-voice', 'Speech-to-Text AI voice typing', 'wekk.app',
  'AI & Smart Utilities',
  'High-accuracy multilingual voice-to-text dictation engine powered by on-device and edge acoustic models for rapid transcription.',
  ARRAY['Real-time streaming speech recognition', 'Intelligent auto-punctuation & sentence capitalization', 'Support for 40+ international languages & accents', 'One-tap export to TXT, PDF, and system clipboard'],
  'published', true, false,
  'https://play.google.com/store/apps/details?id=wekk.app',
  'https://play-lh.googleusercontent.com/w236iv76s_9yxXIaL66uMNwyOkPFO5LARgS-qgw84NOyiW2_3bh0q1JUvLUvQDWmM3B4cGT6cbpHKBFD5QsYEw=s0-br30',
  false, NULL,
  ARRAY['Kotlin', 'Vosk Offline ASR', 'Whisper TFLite', 'Jetpack Compose'],
  true, 800000, 'INR', 'negotiable', 'Fast transcription engine with custom dictionary support.', 7
),
(
  'signflow-esign-pdf', 'SignFlow – eSign & PDF', 'com.shezad.signflow',
  'Productivity & Document Management',
  'Legally compliant digital signature creation, document annotation, and rapid PDF form filling on mobile devices.',
  ARRAY['Smooth biometric stylus & touch signature drawing', 'Tamper-evident cryptographic signature stamping', 'PDF form field autofill and date stamping', 'Offline document vault with biometric lock'],
  'published', true, false,
  'https://play.google.com/store/apps/details?id=com.shezad.signflow',
  'https://play-lh.googleusercontent.com/7ayU2M58QLgW_NoiUT-9xE049tZMliHaL8-rxpJH-lSggmq_56BayHTvH-bISgjrOVv3zml6-xiEqNqSjasl=s0-br30',
  true, 'https://github.com/remotasks/signflow-android',
  ARRAY['Kotlin', 'PdfBox-Android', 'Spongy Castle Crypto', 'BiometricPrompt'],
  true, 750000, 'INR', 'negotiable', 'Enterprise-grade e-signature compliance and cryptographic hashing.', 8
),
(
  'docuscan-opencv-smart-scanner', 'DocuScan: OpenCv Smart Scanner', 'io.docuscan.app',
  'Productivity & Document Management',
  'Ultra-fast document scanner utilizing computer vision perspective transformation, shadow removal, and contrast enhancement.',
  ARRAY['Automatic 4-point document corner & contour detection', 'Bilateral filter shadow elimination & black/white enhancement', 'Multi-page batch scanning with PDF reordering', 'Embedded fast OCR for text searchability'],
  'published', true, false,
  'https://play.google.com/store/apps/details?id=io.docuscan.app',
  'https://play-lh.googleusercontent.com/IZUKgcXldNgx3ztnsecrdVgYEhQp-d5NDNlHjJGi8RBvOcn5JG6W46HFiRL14g0oH6yI4zgdKeTZKGYQVG5dcg=s0-br30',
  true, 'https://github.com/remotasks/docuscan-opencv',
  ARRAY['Kotlin', 'OpenCV 4 Android SDK', 'C++ NDK Native', 'iText PDF'],
  true, 900000, 'INR', 'negotiable', 'Production-grade OpenCV pipeline with C++ JNI performance layer.', 9
),
(
  'pdf-scanner-ocr-pageray', 'PDF Scanner & OCR - PageRay', 'com.antigravity.scanner',
  'Productivity & Document Management',
  'High-speed document digitizer featuring offline Tesseract OCR text recognition, multi-language translation, and smart organization.',
  ARRAY['100+ language offline OCR text recognition', 'Searchable multi-page PDF generation', 'Smart category tagging & keyword full-text search', 'Direct cloud drive export (Google Drive, Dropbox)'],
  'published', true, false,
  'https://play.google.com/store/apps/details?id=com.antigravity.scanner',
  'https://play-lh.googleusercontent.com/D4BVIPssNDYGV1xJe2VK9mr9hwQt_lCyKhdW22ddGHrIAr5ZwKJ_pvXvxHCN8sAS1RCPOYX5TrTqWb6u4QnZprI=s0-br30',
  false, NULL,
  ARRAY['Kotlin', 'Tesseract OCR / Tess-Two', 'Room SQLite', 'Coroutines'],
  true, 850000, 'INR', 'negotiable', 'Optimized multi-lingual OCR pipeline.', 10
),
(
  'insomnia-better-sleep', 'insomnia: better sleep', 'com.insomania.bettersleep',
  'Health & Wellness',
  'Science-backed sleep companion offering binaural beats, pink noise, delta brainwave soundscapes, and gentle circadian sleep timers.',
  ARRAY['Binaural delta/theta wave sleep induction frequencies', 'Multi-layered ambient soundscape mixer (rain, forest, waves)', 'Automated gentle volume fading sleep timer', 'Nighttime OLED dark theme with zero blue-light strain'],
  'published', true, false,
  'https://play.google.com/store/apps/details?id=com.insomania.bettersleep',
  'https://play-lh.googleusercontent.com/Fg3w9iW3mDoWAXBgEyElCosgVoaBJ0s9OiO64a2pjpS8nibMbAjmfDOTXRF3AkYF_DOuqkuyQr9VMrWGbbltZQ=s0-br30',
  true, 'https://github.com/remotasks/insomnia-sleep',
  ARRAY['Kotlin', 'ExoPlayer / Media3', 'Audio Synthesizer DSP', 'Jetpack Compose'],
  true, 550000, 'INR', 'negotiable', 'High retention health and wellbeing app with loyal user base.', 11
),
(
  'cyclecare-period-tracker', 'CycleCare: Period Tracker', 'com.cyclecare.tracker',
  'Health & Wellness',
  'Privacy-first menstrual cycle, ovulation, and symptom prediction tracker with encrypted local device storage.',
  ARRAY['100% on-device encrypted cycle calculations', 'Ovulation window & fertility probability forecasts', 'Comprehensive symptom, mood, and water intake logs', 'Zero third-party trackers or health data broker sharing'],
  'published', true, false,
  'https://play.google.com/store/apps/details?id=com.cyclecare.tracker',
  'https://play-lh.googleusercontent.com/MI1swiXfyll_6dyulJMZsXontLgOuvABljLXsEA7ISHFu07ZI1VNSTT8eTybMU_98I0J9vpzpcmj29pHQLtYM_Q=s0-br30',
  true, 'https://github.com/remotasks/cyclecare-tracker',
  ARRAY['Kotlin', 'SQLCipher Encrypted DB', 'Material 3 Design', 'WorkManager'],
  true, 600000, 'INR', 'negotiable', 'Privacy-first medical & fertility compliance architecture.', 12
),
(
  'upi-alert-voice-soundbox', 'UPI Alert: Voice Soundbox', 'com.alertpay.alertpay',
  'Finance & Payments',
  'Instant voice announcement soundbox for merchant UPI payments, SMS notification parsing, and daily transaction summaries.',
  ARRAY['Instant voice notification broadcast in 8+ regional languages', 'Background SMS & notification listener for BHIM, PhonePe, GooglePay, Paytm', 'Consolidated end-of-day sales summary & audio statement', 'Operates seamlessly on any Android phone without physical soundbox hardware'],
  'published', true, false,
  'https://play.google.com/store/apps/details?id=com.alertpay.alertpay',
  'https://play-lh.googleusercontent.com/KRpyMvPMw_OO-4ejyIDYAdym-JYRXBKRWAEI8-vo-sqgLGWmWaB5vg0cHOFvaGmyqUs3pAUUGmoBvl5D1X_N=s0-br30',
  false, NULL,
  ARRAY['Kotlin', 'Android TextToSpeech TTS Engine', 'NotificationListenerService', 'Room'],
  true, 1100000, 'INR', 'negotiable', 'Massive utility for small-to-medium retail vendors across India.', 13
),
(
  'homedesignia', 'HomeDesignia', 'com.homedesignia.app',
  'Home & Lifestyle',
  'Interior design inspiration and architectural concept visualizer for modern home renovations, decor schemes, and room layouts.',
  ARRAY['Curated high-res interior design lookbooks & style guides', 'Interactive 2D room layout sketchpad and dimension notes', 'Color harmony palette generator & material finish explorer', 'Exportable moodboards for client and contractor presentations'],
  'published', true, false,
  'https://play.google.com/store/apps/details?id=com.homedesignia.app',
  'https://play-lh.googleusercontent.com/Lv06rXbPxbClXeQR1wiKshubsAkve1U-2NROuXQVJh5qjcsWlZFWSHh3sCErGl7Cw1pbgQ-AGl4pGdX0T53K=s0-br30',
  false, NULL,
  ARRAY['Kotlin', 'Jetpack Compose', 'Coil Image Loader', 'Room Database'],
  true, 450000, 'INR', 'negotiable', 'Clean architecture with high visual aesthetics.', 14
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  short_description = EXCLUDED.short_description,
  google_play_url = EXCLUDED.google_play_url,
  icon_url = EXCLUDED.icon_url,
  asking_price = EXCLUDED.asking_price,
  pricing_type = EXCLUDED.pricing_type,
  updated_at = timezone('utc'::text, now());

