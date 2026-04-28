import { jsx } from "@app/html-jsx"

export const YandexMapsScript = () => (
  <>
    <script src="https://api-maps.yandex.ru/2.1/?apikey=3e8e6276-8471-4559-b3b4-8c9947308b8c&lang=ru_RU" type="text/javascript"></script>
    <script>{`
      if (typeof ymaps !== 'undefined') {
        window.ymapsV2Ready = new Promise(function(resolve) {
          ymaps.ready(resolve);
        });
      }
    `}</script>
  </>
)

export const StylesHead = () => (
  <>
    {/* Critical CSS - inline for fast first paint */}
    <style>{`
      /* CLS Prevention - reserve space for dynamic content */
      .product-card,.story-ring,.banner-item{contain:layout style}
      .hero-block{contain:layout style}
      /* Always reserve space for images to prevent layout shift */
      img{max-width:100%;height:auto;aspect-ratio:attr(width)/attr(height)}
      /* Font display swap to prevent FOIT */
      @font-face{font-family:'TT Norms';font-display:swap}
      /* Fixed height containers to prevent CLS */
      .stories-bar{min-height:115px}
      .banner-container{min-height:80px}
      .greeting-card{min-height:160px}
    `}</style>
    
    {/* Preload critical fonts — only 2 most important */}
    <link rel="preload" href="https://sel.cdn-chatium.io/get/msk_zkJv8B3paZ.ttf" as="font" type="font/ttf" crossorigin="" />
    <link rel="preload" href="https://sel.cdn-chatium.io/get/msk_fbTfntSTUy.ttf" as="font" type="font/ttf" crossorigin="" />
    
    {/* FontAwesome — async non-blocking */}
    <link href="/s/static/lib/fontawesome/6.7.2/css/solid.min.css" rel="stylesheet" media="print" onload="this.media='all'" />
    <link href="/s/static/lib/fontawesome/6.7.2/css/fontawesome.min.css" rel="stylesheet" media="print" onload="this.media='all'" />
    <noscript>
      <link href="/s/static/lib/fontawesome/6.7.2/css/solid.min.css" rel="stylesheet" />
      <link href="/s/static/lib/fontawesome/6.7.2/css/fontawesome.min.css" rel="stylesheet" />
    </noscript>
    <style>{`
      @font-face {
        font-family: 'TEO Font';
        src: url('https://fs.chatium.ru/get/msk_Exd8OrqLyB.ttf') format('truetype');
        font-weight: 400;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'TT Norms';
        src: url('https://sel.cdn-chatium.io/get/msk_fbTfntSTUy.ttf') format('truetype');
        font-weight: 700;
        font-style: normal;
        font-display: swap;
      }
      @font-face {
        font-family: 'TT Norms';
        src: url('https://sel.cdn-chatium.io/get/msk_zkJv8B3paZ.ttf') format('truetype');
        font-weight: 400;
        font-style: normal;
        font-display: swap;
      }
      :root {
        --color-primary: #000000;
        --color-primary-dark: #2a2a2a;
        --color-secondary: #333333;
        --color-accent: #4a4a4a;
        --color-background: #FFFFFF;
        --color-surface: #e5e5e5;
        
        --color-text-dark: #000000;
        --color-text-soft: #000000;
        --color-text-muted: #3C3C3C;
        --color-text-light-gray: #9CA3AF;
        --color-text-medium-gray: #6B7280;
        --color-white: #FFFFFF;
        
        --color-light-bg: #FAFAFA;
        --color-footer-gradient-start: #f5f5f5;
        --color-placeholder-bg: #F5F5F5;
        --color-placeholder-text: #CCCCCC;
        --color-placeholder-light: #f0f0f0;
        
        --color-favorite-active: #ff6ba8;
        --color-favorite-hover: #ff4d96;
        --color-favorite-float: #C85B8A;
        --color-favorite-float-hover: #a8386a;
        --color-error: #e05b5b;
        --color-fav-icon-muted: #888;
        
        --color-border: rgba(0, 0, 0, 0.08);
        --color-border-light: rgba(0, 0, 0, 0.06);
        --color-border-medium: rgba(0, 0, 0, 0.10);
        --color-shadow: rgba(0, 0, 0, 0.10);
        --color-shadow-medium: rgba(0, 0, 0, 0.14);
        --color-shadow-dark: rgba(0, 0, 0, 0.30);
        --color-shadow-hover: rgba(60, 60, 60, 0.13);
        --color-shadow-card-hover-border: rgba(60, 60, 60, 0.22);
        --color-shadow-card: rgba(43, 34, 51, 0.06);
        --color-card-border: rgba(43, 34, 51, 0.08);
        --color-oos-bg: rgba(43, 34, 51, 0.72);
        
        --color-primary-hover-bg: rgba(0, 0, 0, 0.08);
        --color-primary-hover-bg-medium: rgba(0, 0, 0, 0.10);
        --color-primary-active-bg: rgba(0, 0, 0, 0.12);
        --color-primary-border-hover: rgba(0, 0, 0, 0.15);
        --color-primary-light-bg: rgba(0, 0, 0, 0.25);
        --color-primary-shadow: rgba(0, 0, 0, 0.25);
        --color-primary-shadow-strong: rgba(0, 0, 0, 0.40);
        --color-primary-shadow-stronger: rgba(0, 0, 0, 0.50);
        --color-primary-shadow-hover: rgba(0, 0, 0, 0.38);
        --color-primary-shadow-hover-strong: rgba(0, 0, 0, 0.45);
        --color-primary-bg-addon-hover: rgba(0, 0, 0, 0.4);
        --color-primary-bg-addon-selected: rgba(0, 0, 0, 0.15);
        --color-primary-bg-addon-shadow: rgba(0, 0, 0, 0.2);
        
        --color-overlay: rgba(15, 10, 20, 0.55);
        --color-modal-shadow: rgba(0, 0, 0, 0.22);
        --color-arrow-shadow: rgba(0, 0, 0, 0.15);
        --color-arrow-bg: rgba(255, 255, 255, 0.9);
        --color-fav-bg: rgba(255, 255, 255, 0.88);
        --color-fav-shadow: rgba(0, 0, 0, 0.12);
        --color-fav-mobile-color: rgba(255, 255, 255, 0.85);
        --color-close-btn-color: rgba(255, 255, 255, 0.85);
        --color-close-btn-shadow: rgba(0, 0, 0, 0.35);
        --color-desc-white: rgba(255, 255, 255, 0.82);
        
        --gradient-overlay-dark: rgba(30, 15, 40, 0.72);
        --gradient-overlay-transparent: rgba(30, 15, 40, 0);
        --gradient-stories-bg: rgba(0, 0, 0, 0.75);
        --gradient-caption-bg: rgba(0, 0, 0, 0.7);
        
        --color-viewer-bg: #000;
        --color-loading-bg: #111;
        --color-progress-track: rgba(255, 255, 255, 0.35);
        --color-stories-btn-bg: rgba(255, 255, 255, 0.95);
        --color-stories-btn-active-bg: rgba(215, 215, 215, 0.97);
        --color-stories-btn-active-shadow: rgba(0, 0, 0, 0.18);
        --color-stories-btn-shadow: rgba(0, 0, 0, 0.25);
        --color-stories-text-shadow: rgba(0, 0, 0, 0.5);
        --color-stories-caption-shadow: rgba(0, 0, 0, 0.6);
        --color-spinner-border: rgba(255, 255, 255, 0.2);
        
        --color-dot-inactive: rgba(43, 34, 51, 0.25);
        
        --color-toggle-off: rgba(0, 0, 0, 0.15);
        --color-overlay-light: rgba(0, 0, 0, 0.2);
        
        --color-footer-divider: rgba(0, 0, 0, 0.15);
        --color-footer-social-bg: rgba(0, 0, 0, 0.10);
        --color-footer-social-shadow: rgba(0, 0, 0, 0.30);
        
        --color-error-bg: rgba(224, 91, 91, 0.08);
        
        --color-header-bg: rgba(255, 255, 255, 0.98);
        
        --admin-primary: #A88BC8;
        --admin-primary-dark: #8E6FB2;
        --admin-accent-light: #DCCDEA;
        --admin-bg-light: #f7f3fb;
        --admin-bg-medium: #f0eaf7;
        --admin-text-dark: #2B2233;
        --admin-text-medium: #5F5568;
        --admin-text-soft: #6b7280;
        --admin-text-light: #9ca3af;
        --admin-text-label: #4b5563;
        --admin-text-toggle: #374151;
        --admin-border: #e5e7eb;
        --admin-border-dashed: #d1d5db;
        --admin-success: #16a34a;
        --admin-success-bg: #dcfce7;
        --admin-danger: #dc2626;
        --admin-danger-light: #EF4444;
        --admin-danger-bg: #fee2e2;
        --admin-danger-hover: #b91c1c;
        --admin-danger-border: #fecaca;
        --admin-inactive-bg: #f3f4f6;
        --admin-overlay: rgba(43, 34, 51, 0.45);
        --admin-overlay-strong: rgba(43, 34, 51, 0.5);
        --admin-shadow: rgba(43, 34, 51, 0.18);
        --admin-shadow-light: rgba(43, 34, 51, 0.06);
        --admin-shadow-medium: rgba(43, 34, 51, 0.08);
        --admin-shadow-hover: rgba(43, 34, 51, 0.12);
        --admin-shadow-modal: rgba(43, 34, 51, 0.2);
        --admin-shadow-delete: rgba(43, 34, 51, 0.4);
        --admin-photo-badge: rgba(168, 139, 200, 0.9);
        --admin-photo-remove: rgba(220, 38, 38, 0.85);
        --admin-toggle-thumb-shadow: rgba(0, 0, 0, 0.2);
        --admin-focus-shadow: rgba(168, 139, 200, 0.15);
        --admin-hero-border: rgba(43, 34, 51, 0.08);
        --admin-hero-close-bg: rgba(43, 34, 51, 0.06);
        --admin-hero-close-hover: rgba(43, 34, 51, 0.1);
        --admin-hero-input-border: rgba(43, 34, 51, 0.12);
        --admin-hero-upload-border: rgba(43, 34, 51, 0.15);
        --admin-hero-secondary-bg: rgba(43, 34, 51, 0.06);
        --admin-hero-secondary-hover: rgba(43, 34, 51, 0.1);
        --admin-hero-danger-bg: rgba(239, 68, 68, 0.1);
        --admin-hero-success-bg: rgba(22, 163, 74, 0.1);
        --admin-card-highlight: #faf7fd;
        --admin-edit-hint: #c4b5d9;
        --admin-stems-empty: #d1d5db;
        --admin-banner-placeholder-text: #d0d0d0;
        --admin-banner-remove-bg: rgba(0, 0, 0, 0.6);
        --admin-banner-remove-hover: rgba(0, 0, 0, 0.8);
        --admin-close-bg: #f5f5f5;
        --admin-close-hover: #e5e5e5;
        --admin-overlay-dark: rgba(0, 0, 0, 0.4);
        --admin-panel-shadow: rgba(0, 0, 0, 0.15);
        --admin-image-remove-bg: rgba(255, 255, 255, 0.9);
      }
      
      *, *::before, *::after {
        box-sizing: border-box;
      }
      html, body {
        margin: 0;
        padding: 0;
        max-width: 100vw;
        overflow-x: hidden;
        background: var(--color-background);
        font-family: 'TT Norms', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
    `}</style>
  </>
)
