-- ==============================================================================
-- Portfolio Applications & Demonstrations Seed Data
-- Migration: portfolio_seed.sql
-- ==============================================================================

-- 1. Insert 14 Verified Baseline Applications (Price on Request, Verified Public Info)
INSERT INTO public.portfolio_apps (
  id, name, package_name, category, short_description, key_features,
  development_status, is_published, is_suspended, google_play_url, icon_url,
  is_open_source, open_source_repo_url, tech_stack, acquisition_available,
  asking_price, currency, pricing_type, private_negotiation_notes, sort_order
) VALUES
(
  'moonroot-seedlight', 'Moonroot: Seedlight', 'com.moonroot.seedlight',
  'Games & Interactive Entertainment',
  'Interactive Android game by Moonroot Studio available on Google Play. Features atmospheric puzzle and adventure gameplay.',
  ARRAY['Interactive mobile gameplay', 'Optimized for Android devices', 'Offline play support', 'Regular updates and feature enhancements'],
  'published', true, false,
  'https://play.google.com/store/apps/details?id=com.moonroot.seedlight',
  'https://play-lh.googleusercontent.com/PRYVPBGBub2TPBlnJj0IREm_AvvNBtLb1iwzizzVH6bDGSdtgJ4lr5f7bC8kfnz3ZQ3pwrpOAjOefL7ycLsr=s0-br30',
  false, NULL,
  ARRAY['Android'],
  true, NULL, 'INR', 'on_request', NULL, 1
),
(
  'emberline-odyssey', 'Emberline Odyssey', 'com.lumentrail.emberlineodyssey',
  'Games & Interactive Entertainment',
  'Dynamic arcade adventure game published under Lumen Trail on Google Play. Designed for responsive touch-screen gameplay.',
  ARRAY['Dynamic obstacle gameplay', 'Touch-responsive controls', 'Progressive game levels', 'Performance optimized for Android'],
  'published', true, false,
  'https://play.google.com/store/apps/details?id=com.lumentrail.emberlineodyssey',
  'https://play-lh.googleusercontent.com/f_c7guX70aWQT_GfxdRYwoGto6d5jWQemSTo33C5YG8ig0gaeqym0jMfge0F0XyUHXa9cdRDlMFgtgoiz8HJSqU=s0-br30',
  false, NULL,
  ARRAY['Android'],
  true, NULL, 'INR', 'on_request', NULL, 2
),
(
  'city-cat-runner', 'City Cat Runner', 'com.shezadgames.citycatrunner',
  'Games & Interactive Entertainment',
  'Runner game formerly listed on Google Play. Currently suspended by Google Play and unavailable for public testing until reinstated.',
  ARRAY['Urban runner gameplay mechanics', 'Interactive obstacle avoidance', 'Currently suspended on Google Play', 'Available for acquisition and code transfer discussions'],
  'suspended', false, true,
  'https://play.google.com/store/apps/details?id=com.shezadgames.citycatrunner',
  'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=256&h=256&fit=crop&q=80',
  false, NULL,
  ARRAY['Android'],
  true, NULL, 'INR', 'on_request', 'Suspended by Google Play. Source code and assets available for acquisition discussions.', 3
),
(
  'gps-map-camera-geotagging', 'GPS Map Camera : Geo Tagging', 'com.homedesignia.geocamera',
  'Photography, Camera & Personalization',
  'Camera application that adds real-time GPS location tags, coordinates, and address watermarks onto captured photos.',
  ARRAY['GPS geotagging on photos', 'Timestamp and address overlays', 'Camera capture with location stamps', 'Sharing and gallery integration'],
  'published', true, false,
  'https://play.google.com/store/apps/details?id=com.homedesignia.geocamera',
  'https://play-lh.googleusercontent.com/AyGz6ROfnCYIBd7RzjbaWIP-5Fu4-sAJkAKiEkfOH0vE-Y8H8PUj92d7Zm0TOcwVsXx2LCrsTRpJXjzhYpr8=s0-br30',
  false, NULL,
  ARRAY['Android'],
  true, NULL, 'INR', 'on_request', NULL, 4
),
(
  'snapglow-insta-filters', 'SnapGlow Insta Filters', 'com.snapglow.app',
  'Photography, Camera & Personalization',
  'Photo filter and enhancement utility providing creative filters, aesthetic effects, and image presets for mobile photography.',
  ARRAY['Variety of photo filters and effects', 'Quick photo editing and enhancements', 'High-resolution image export', 'Easy social sharing options'],
  'published', true, false,
  'https://play.google.com/store/apps/details?id=com.snapglow.app',
  'https://play-lh.googleusercontent.com/_35H9kmroCy-fMLXCkrHimEIIk1AgpN8Jn2EbFAIHafC1IUA8kTAyCW6yJDB1sYlXoEcDN9pdfSxaLDxtAQ=s0-br30',
  false, NULL,
  ARRAY['Android'],
  true, NULL, 'INR', 'on_request', NULL, 5
),
(
  'ai-edge-on-device-ai', 'AI Edge: On-Device AI', 'ai.offlinellm.assistant',
  'AI & Smart Utilities',
  'On-device artificial intelligence assistant running locally on compatible Android devices for private offline queries and assistance.',
  ARRAY['Local on-device AI model execution', 'Offline text processing and assistance', 'Private data processing without mandatory cloud upload', 'Clean conversational user interface'],
  'published', true, false,
  'https://play.google.com/store/apps/details?id=ai.offlinellm.assistant',
  'https://play-lh.googleusercontent.com/vhX-l-eH1yp-WfQ9mzNBVheugJA1uMyaFPM_ja1kIynOocY2VSFVl3gPcpxDUGsPwsFGP13TyyPjAH7K5NoU8g4=s0-br30',
  false, NULL,
  ARRAY['Android'],
  true, NULL, 'INR', 'on_request', NULL, 6
),
(
  'speech-to-text-ai-voice', 'Speech-to-Text AI voice typing', 'wekk.app',
  'AI & Smart Utilities',
  'Voice typing and dictation application that converts spoken voice into text in real time with multi-language recognition.',
  ARRAY['Voice-to-text dictation', 'Real-time transcription display', 'Export text or copy to clipboard', 'Multilingual voice recognition support'],
  'published', true, false,
  'https://play.google.com/store/apps/details?id=wekk.app',
  'https://play-lh.googleusercontent.com/w236iv76s_9yxXIaL66uMNwyOkPFO5LARgS-qgw84NOyiW2_3bh0q1JUvLUvQDWmM3B4cGT6cbpHKBFD5QsYEw=s0-br30',
  false, NULL,
  ARRAY['Android'],
  true, NULL, 'INR', 'on_request', NULL, 7
),
(
  'signflow-esign-pdf', 'SignFlow – eSign & PDF', 'com.shezad.signflow',
  'Productivity & Document Management',
  'Document signing and PDF utility allowing users to sign, fill, and annotate PDF documents directly on their mobile device.',
  ARRAY['Digital electronic signatures', 'PDF document viewing and filling', 'Export and share signed documents', 'Local document management'],
  'published', true, false,
  'https://play.google.com/store/apps/details?id=com.shezad.signflow',
  'https://play-lh.googleusercontent.com/7ayU2M58QLgW_NoiUT-9xE049tZMliHaL8-rxpJH-lSggmq_56BayHTvH-bISgjrOVv3zml6-xiEqNqSjasl=s0-br30',
  false, NULL,
  ARRAY['Android'],
  true, NULL, 'INR', 'on_request', NULL, 8
),
(
  'docuscan-opencv-smart-scanner', 'DocuScan: OpenCv Smart Scanner', 'io.docuscan.app',
  'Productivity & Document Management',
  'Mobile document scanner app using computer vision edge detection to scan receipts, notes, and multi-page documents to PDF.',
  ARRAY['Automatic document corner detection', 'Color filter and contrast enhancement', 'Multi-page scanning into PDF', 'Local image-to-document processing'],
  'published', true, false,
  'https://play.google.com/store/apps/details?id=io.docuscan.app',
  'https://play-lh.googleusercontent.com/IZUKgcXldNgx3ztnsecrdVgYEhQp-d5NDNlHjJGi8RBvOcn5JG6W46HFiRL14g0oH6yI4zgdKeTZKGYQVG5dcg=s0-br30',
  false, NULL,
  ARRAY['Android'],
  true, NULL, 'INR', 'on_request', NULL, 9
),
(
  'pdf-scanner-ocr-pageray', 'PDF Scanner & OCR - PageRay', 'com.antigravity.scanner',
  'Productivity & Document Management',
  'Document scanner with Optical Character Recognition (OCR) to extract text from images and create searchable PDF files.',
  ARRAY['Camera scan to PDF conversion', 'OCR text extraction from scanned pages', 'Document organizing and folders', 'Export to PDF and text formats'],
  'published', true, false,
  'https://play.google.com/store/apps/details?id=com.antigravity.scanner',
  'https://play-lh.googleusercontent.com/D4BVIPssNDYGV1xJe2VK9mr9hwQt_lCyKhdW22ddGHrIAr5ZwKJ_pvXvxHCN8sAS1RCPOYX5TrTqWb6u4QnZprI=s0-br30',
  false, NULL,
  ARRAY['Android'],
  true, NULL, 'INR', 'on_request', NULL, 10
),
(
  'insomnia-better-sleep', 'insomnia: better sleep', 'com.insomania.bettersleep',
  'Health & Wellness',
  'Sleep aid application featuring ambient sounds, relaxing audio tracks, and gentle timers to assist users with falling asleep.',
  ARRAY['Calming ambient soundscapes', 'Sleep timer with auto shut-off', 'Night mode friendly interface', 'Offline audio playback'],
  'published', true, false,
  'https://play.google.com/store/apps/details?id=com.insomania.bettersleep',
  'https://play-lh.googleusercontent.com/Fg3w9iW3mDoWAXBgEyElCosgVoaBJ0s9OiO64a2pjpS8nibMbAjmfDOTXRF3AkYF_DOuqkuyQr9VMrWGbbltZQ=s0-br30',
  false, NULL,
  ARRAY['Android'],
  true, NULL, 'INR', 'on_request', NULL, 11
),
(
  'cyclecare-period-tracker', 'CycleCare: Period Tracker', 'com.cyclecare.tracker',
  'Health & Wellness',
  'Menstrual cycle and health symptom tracking application with calendar logging, reminder notifications, and private local data storage.',
  ARRAY['Period and cycle logging calendar', 'Cycle prediction estimates', 'Symptom and daily note tracking', 'Private on-device storage'],
  'published', true, false,
  'https://play.google.com/store/apps/details?id=com.cyclecare.tracker',
  'https://play-lh.googleusercontent.com/MI1swiXfyll_6dyulJMZsXontLgOuvABljLXsEA7ISHFu07ZI1VNSTT8eTybMU_98I0J9vpzpcmj29pHQLtYM_Q=s0-br30',
  false, NULL,
  ARRAY['Android'],
  true, NULL, 'INR', 'on_request', NULL, 12
),
(
  'upi-alert-voice-soundbox', 'UPI Alert: Voice Soundbox', 'com.alertpay.alertpay',
  'Finance & Payments',
  'Audio alert soundbox utility that provides voice notifications for incoming digital payments received on the merchant device.',
  ARRAY['Spoken voice notifications for received payments', 'Multi-language voice alert settings', 'Transaction history view', 'Operates directly on standard Android smartphones'],
  'published', true, false,
  'https://play.google.com/store/apps/details?id=com.alertpay.alertpay',
  'https://play-lh.googleusercontent.com/KRpyMvPMw_OO-4ejyIDYAdym-JYRXBKRWAEI8-vo-sqgLGWmWaB5vg0cHOFvaGmyqUs3pAUUGmoBvl5D1X_N=s0-br30',
  false, NULL,
  ARRAY['Android'],
  true, NULL, 'INR', 'on_request', NULL, 13
),
(
  'homedesignia', 'HomeDesignia', 'com.homedesignia.app',
  'Home & Lifestyle',
  'Home decor and room design idea visualizer providing inspirational layouts, color ideas, and interior styling collections.',
  ARRAY['Curated interior design photo galleries', 'Categorized by room type (Living, Bedroom, Kitchen)', 'Bookmark favorite styles and ideas', 'Share design collections with others'],
  'published', true, false,
  'https://play.google.com/store/apps/details?id=com.homedesignia.app',
  'https://play-lh.googleusercontent.com/Lv06rXbPxbClXeQR1wiKshubsAkve1U-2NROuXQVJh5qjcsWlZFWSHh3sCErGl7Cw1pbgQ-AGl4pGdX0T53K=s0-br30',
  false, NULL,
  ARRAY['Android'],
  true, NULL, 'INR', 'on_request', NULL, 14
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  package_name = EXCLUDED.package_name,
  category = EXCLUDED.category,
  short_description = EXCLUDED.short_description,
  key_features = EXCLUDED.key_features,
  development_status = EXCLUDED.development_status,
  is_published = EXCLUDED.is_published,
  is_suspended = EXCLUDED.is_suspended,
  google_play_url = EXCLUDED.google_play_url,
  icon_url = EXCLUDED.icon_url,
  is_open_source = EXCLUDED.is_open_source,
  tech_stack = EXCLUDED.tech_stack,
  acquisition_available = EXCLUDED.acquisition_available,
  asking_price = EXCLUDED.asking_price,
  pricing_type = EXCLUDED.pricing_type,
  updated_at = NOW();
