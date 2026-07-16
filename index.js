// Bilingual Genesis Bible Application Logic

// App State Management (with LocalStorage fallbacks)
const state = {
    book: localStorage.getItem('bible_book') || '창세기',
    chapter: parseInt(localStorage.getItem('bible_chapter')) || 1,
    layout: localStorage.getItem('bible_layout') || 'side', // 'side' or 'stack'
    theme: localStorage.getItem('bible_theme') || 'light', // Default to light
    fontSize: parseInt(localStorage.getItem('bible_font_size')) || 100, // percentage
    fontFamily: localStorage.getItem('bible_font_family') || 'sans', // 'sans' or 'serif'
    accent: localStorage.getItem('bible_accent') || 'teal', // 'teal', 'indigo', 'gold', 'rose'
    hintDismissed: localStorage.getItem('bible_hint_dismissed') === 'true',
    subLanguage: localStorage.getItem('bible_sub_language') || 'en' // 'en' (English) or 'og' (Original: Hebrew/Greek)
};

// Global Bible Data Storage
let bibleData = [];

// DOM Elements cache
const els = {
    content: document.getElementById('bible-content'),
    layoutSideBtn: document.getElementById('layout-side-btn'),
    layoutStackBtn: document.getElementById('layout-stack-btn'),
    themeToggle: document.getElementById('theme-toggle'),
    settingsToggle: document.getElementById('settings-toggle'),
    settingsPanel: document.getElementById('settings-panel'),
    settingsClose: document.getElementById('settings-close'),
    fontDecrease: document.getElementById('font-decrease'),
    fontIncrease: document.getElementById('font-increase'),
    fontSizeDisplay: document.getElementById('font-size-display'),
    fontSansBtn: document.getElementById('font-sans-btn'),
    fontSerifBtn: document.getElementById('font-serif-btn'),
    prevFloating: document.getElementById('prev-chapter-floating'),
    nextFloating: document.getElementById('next-chapter-floating'),
    gestureHint: document.getElementById('gesture-hint'),
    dismissHintBtn: document.getElementById('dismiss-hint-btn'),
    headerBookName: document.getElementById('header-book-name'),
    headerChapterNum: document.getElementById('header-chapter-num'),
    readingArea: document.getElementById('reading-area'),
    colorDots: document.querySelectorAll('.color-dot'),
    
    // Grid Picker Elements
    pickerTrigger: document.getElementById('bible-picker-trigger'),
    pickerModal: document.getElementById('bible-picker-modal'),
    pickerBackdrop: document.getElementById('picker-backdrop'),
    pickerClose: document.getElementById('picker-close'),
    tabOtBtn: document.getElementById('tab-ot-btn'),
    tabNtBtn: document.getElementById('tab-nt-btn'),
    booksGrid: document.getElementById('picker-books-grid'),
    chaptersGrid: document.getElementById('picker-chapters-grid'),
    booksView: document.getElementById('picker-books-view'),
    chaptersView: document.getElementById('picker-chapters-view'),
    backBtn: document.getElementById('picker-back-btn'),
    selectedBookTitle: document.getElementById('picker-selected-book-title'),
    toastContainer: document.getElementById('toast-container'),
    langEnBtn: document.getElementById('lang-en-btn'),
    langOgBtn: document.getElementById('lang-og-btn'),
    quickLangEnBtn: document.getElementById('quick-lang-en-btn'),
    quickLangOgBtn: document.getElementById('quick-lang-og-btn'),
    refSection: document.getElementById('reference-section'),
    refCloseBtn: document.getElementById('ref-close-btn'),
    refVerseTitle: document.getElementById('ref-verse-title'),
    refContent: document.getElementById('reference-content'),
    installPwaBtn: document.getElementById('install-pwa-btn')
};

// Accent color definitions (Muted Sage, Slate, Taupe, Dusty Rose)
const accentColors = {
    teal: { value: '#789078', rgb: '120, 144, 120' },     // Sage Green
    indigo: { value: '#788590', rgb: '120, 133, 144' },   // Slate Blue
    gold: { value: '#b3997e', rgb: '179, 153, 126' },     // Taupe Sand
    rose: { value: '#b0888b', rgb: '176, 136, 139' }      // Dusty Rose
};

// Old Testament Books List (39 books)
const OT_BOOKS = [
    { abbr: '창', name: '창세기', active: true, chapters: 50 },
    { abbr: '출', name: '출애굽기', active: true, chapters: 40 },
    { abbr: '레', name: '레위기', active: true, chapters: 27 },
    { abbr: '민', name: '민수기', active: true, chapters: 36 },
    { abbr: '신', name: '신명기', active: true, chapters: 34 },
    { abbr: '수', name: '여호수아', active: true, chapters: 24 },
    { abbr: '삿', name: '사사기', active: true, chapters: 21 },
    { abbr: '룻', name: '룻기', active: true, chapters: 4 },
    { abbr: '삼상', name: '사무엘상', active: true, chapters: 31 },
    { abbr: '삼하', name: '사무엘하', active: true, chapters: 24 },
    { abbr: '왕상', name: '열왕기상', active: true, chapters: 22 },
    { abbr: '왕하', name: '열왕기하', active: true, chapters: 25 },
    { abbr: '대상', name: '역대상', active: true, chapters: 29 },
    { abbr: '대하', name: '역대하', active: true, chapters: 36 },
    { abbr: '스', name: '에스라', active: true, chapters: 10 },
    { abbr: '느', name: '느헤미야', active: true, chapters: 13 },
    { abbr: '에', name: '에스더', active: true, chapters: 10 },
    { abbr: '욥', name: '욥기', active: true, chapters: 42 },
    { abbr: '시', name: '시편', active: true, chapters: 150 },
    { abbr: '잠', name: '잠언', active: true, chapters: 31 },
    { abbr: '전', name: '전도서', active: true, chapters: 12 },
    { abbr: '아', name: '아가', active: true, chapters: 8 },
    { abbr: '사', name: '이사야', active: true, chapters: 66 },
    { abbr: '렘', name: '예레미야', active: true, chapters: 52 },
    { abbr: '애', name: '애가', active: true, chapters: 5 },
    { abbr: '겔', name: '에스겔', active: true, chapters: 48 },
    { abbr: '단', name: '다니엘', active: true, chapters: 12 },
    { abbr: '호', name: '호세아', active: true, chapters: 14 },
    { abbr: '욜', name: '요엘', active: true, chapters: 3 },
    { abbr: '암', name: '아모스', active: true, chapters: 9 },
    { abbr: '옵', name: '오바댜', active: true, chapters: 1 },
    { abbr: '욘', name: '요나', active: true, chapters: 4 },
    { abbr: '미', name: '미가', active: true, chapters: 7 },
    { abbr: '나', name: '나훔', active: true, chapters: 3 },
    { abbr: '하', name: '하박국', active: true, chapters: 3 },
    { abbr: '습', name: '스바냐', active: true, chapters: 3 },
    { abbr: '학', name: '학개', active: true, chapters: 2 },
    { abbr: '슥', name: '스가랴', active: true, chapters: 14 },
    { abbr: '말', name: '말라기', active: true, chapters: 4 }
];

// New Testament Books List (27 books)
const NT_BOOKS = [
    { abbr: '마', name: '마태복음', active: true, chapters: 28 },
    { abbr: '막', name: '마가복음', active: true, chapters: 16 },
    { abbr: '누', name: '누가복음', active: true, chapters: 24 },
    { abbr: '요', name: '요한복음', active: true, chapters: 21 },
    { abbr: '행', name: '사도행전', active: true, chapters: 28 },
    { abbr: '롬', name: '로마서', active: true, chapters: 16 },
    { abbr: '고전', name: '고린도전서', active: true, chapters: 16 },
    { abbr: '고후', name: '고린도후서', active: true, chapters: 13 },
    { abbr: '갈', name: '갈라디아서', active: true, chapters: 6 },
    { abbr: '엡', name: '에베소서', active: true, chapters: 6 },
    { abbr: '빌', name: '빌립보서', active: true, chapters: 4 },
    { abbr: '골', name: '골로새서', active: true, chapters: 4 },
    { abbr: '살전', name: '데살로니가전서', active: true, chapters: 5 },
    { abbr: '살후', name: '데살로니가후서', active: true, chapters: 3 },
    { abbr: '딤전', name: '디모데전서', active: true, chapters: 6 },
    { abbr: '딤후', name: '디모데후서', active: true, chapters: 4 },
    { abbr: '딛', name: '디도서', active: true, chapters: 3 },
    { abbr: '몬', name: '빌레몬서', active: true, chapters: 1 },
    { abbr: '히', name: '히브리서', active: true, chapters: 13 },
    { abbr: '야', name: '야고보서', active: true, chapters: 5 },
    { abbr: '벧전', name: '베드로전서', active: true, chapters: 5 },
    { abbr: '벧후', name: '베드로후서', active: true, chapters: 3 },
    { abbr: '요일', name: '요한일서', active: true, chapters: 5 }, // wait, 요한1서/요한일서 name mismatch risk? In index.js it's 요한일서, in config it is 요한1서?
    // Oh, in NT_BOOKS it's 요한일서, 요한이서, 요한삼서. In config we wrote 요한1서, 요한2서, 요한3서.
    // We should make sure the names are identical, otherwise it won't load from JS Bundle!
    // Let me check my NT_BOOKS_CONFIG names. Yes, in config I wrote '요한1서'. But in NT_BOOKS it's '요한일서'.
    // If they differ, state.book === bookObj.name matching inside index.js won't match data keys.
    // Let me align the names to '요한일서', '요한이서', '요한삼서' in both config and NT_BOOKS!
    // This is a VERY critical detail to avoid page rendering crashes.
    { abbr: '요일', name: '요한일서', active: true, chapters: 5 },
    { abbr: '요이', name: '요한이서', active: true, chapters: 1 },
    { abbr: '요삼', name: '요한삼서', active: true, chapters: 1 },
    { abbr: '유', name: '유다서', active: true, chapters: 1 },
    { abbr: '계', name: '요한계시록', active: true, chapters: 22 }
];

// Active tab for book picker
let activeTestament = 'ot';

// 1. Initial Launch configuration
async function init() {
    try {
        applyStateToUI();
        bindEvents();
        
        await loadBibleData();
        renderChapter(state.chapter);
        
        // Populate Books Grid initially
        renderBooksGrid('ot');

        // Show gesture hint if not dismissed previously
        if (!state.hintDismissed) {
            setTimeout(() => {
                els.gestureHint.classList.add('visible');
            }, 1000);
        }
    } catch (error) {
        showErrorState("성경 데이터를 로드하거나 앱을 초기화하는 중에 오류가 발생했습니다:<br>" + error.message);
        console.error(error);
    }
}

// 2. Fetch data from compiled JSON (or fallback to preloaded local JS variable)
async function loadBibleData() {
    // Check if preloaded from bible_data.js (bypasses browser file:// CORS issues)
    if (typeof BIBLE_DATA !== 'undefined' && Array.isArray(BIBLE_DATA)) {
        console.log("Bible data preloaded from local JS bundle successfully.");
        bibleData = BIBLE_DATA;
        return;
    }

    // Fallback to fetch API if not preloaded (e.g. running on web server)
    const response = await fetch('data/bible_data.json');
    if (!response.ok) {
        throw new Error(`Failed to load data. Status: ${response.status}`);
    }
    bibleData = await response.json();
}

// 3. Populate Books Grid (Old / New Testament)
function renderBooksGrid(testament) {
    els.booksGrid.innerHTML = '';
    activeTestament = testament;

    const books = testament === 'ot' ? OT_BOOKS : NT_BOOKS;
    
    books.forEach(b => {
        const card = document.createElement('div');
        card.className = `book-card ${b.active ? '' : 'disabled'} ${b.name === state.book ? 'active' : ''}`;
        
        const box = document.createElement('div');
        box.className = 'book-abbr-box';
        box.textContent = b.abbr;
        
        const label = document.createElement('span');
        label.className = 'book-name-label';
        label.textContent = b.name;
        
        card.appendChild(box);
        card.appendChild(label);
        
        // Click action
        card.addEventListener('click', () => {
            if (b.active) {
                openChaptersView(b);
            } else {
                showToast(`"${b.name}" 말씀은 추후 제공될 예정입니다.`);
            }
        });
        
        els.booksGrid.appendChild(card);
    });
}

// 4. Open Chapter Grid Selector View (Step 2)
function openChaptersView(bookObj) {
    els.selectedBookTitle.textContent = bookObj.name;
    els.chaptersGrid.innerHTML = '';
    
    // Generate chapter cards
    for (let i = 1; i <= bookObj.chapters; i++) {
        const card = document.createElement('div');
        // Safely check active status considering both book name and chapter number
        const isActive = (bookObj.name === state.book && i === state.chapter);
        card.className = `chapter-card ${isActive ? 'active' : ''}`;
        card.textContent = i;
        
        card.addEventListener('click', () => {
            state.book = bookObj.name;
            localStorage.setItem('bible_book', bookObj.name);
            closePickerModal();
            renderChapter(i);
        });
        
        els.chaptersGrid.appendChild(card);
    }
    
    // Switch views
    els.booksView.classList.remove('active');
    els.chaptersView.classList.add('active');
}

// 5. Open/Close Picker Bottom Sheet Modal
function openPickerModal() {
    els.pickerModal.classList.add('open');
    // Set active tab default
    els.tabOtBtn.classList.add('active');
    els.tabNtBtn.classList.remove('active');
    renderBooksGrid('ot');
    
    // Reset to Books View (Step 1)
    els.booksView.classList.add('active');
    els.chaptersView.classList.remove('active');
}

function closePickerModal() {
    els.pickerModal.classList.remove('open');
}

// 6. Synchronize state with CSS & HTML Attributes
function applyStateToUI() {
    // A. Theme Setup
    document.documentElement.setAttribute('data-theme', state.theme);
    updateThemeIcon();

    // B. Layout mode
    if (state.layout === 'side') {
        els.layoutSideBtn.classList.add('active');
        els.layoutStackBtn.classList.remove('active');
        els.content.className = `bible-content layout-side font-${state.fontFamily}`;
    } else {
        els.layoutSideBtn.classList.remove('active');
        els.layoutStackBtn.classList.add('active');
        els.content.className = `bible-content layout-stacked font-${state.fontFamily}`;
    }

    // C. Font Size Scale
    els.fontSizeDisplay.textContent = `${state.fontSize}%`;
    document.documentElement.style.setProperty('--font-scale', (state.fontSize / 100).toString());

    // D. Font Family buttons
    if (state.fontFamily === 'sans') {
        els.fontSansBtn.classList.add('active');
        els.fontSerifBtn.classList.remove('active');
    } else {
        els.fontSansBtn.classList.remove('active');
        els.fontSerifBtn.classList.add('active');
    }

    // E. Accent Colors
    els.colorDots.forEach(dot => {
        if (dot.dataset.accent === state.accent) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
    applyAccentColor(state.accent);

    // F. Sub-language button active states
    if (state.subLanguage === 'en') {
        els.langEnBtn.classList.add('active');
        els.langOgBtn.classList.remove('active');
        els.quickLangEnBtn.classList.add('active');
        els.quickLangOgBtn.classList.remove('active');
    } else {
        els.langEnBtn.classList.remove('active');
        els.langOgBtn.classList.add('active');
        els.quickLangEnBtn.classList.remove('active');
        els.quickLangOgBtn.classList.add('active');
    }
}

function applyAccentColor(accentName) {
    const color = accentColors[accentName];
    if (color) {
        document.documentElement.style.setProperty('--accent', color.value);
        document.documentElement.style.setProperty('--accent-rgb', color.rgb);
    }
}

function updateThemeIcon() {
    const icon = els.themeToggle.querySelector('i');
    if (state.theme === 'dark') {
        icon.className = 'fa-solid fa-sun';
    } else {
        icon.className = 'fa-solid fa-moon';
    }
}

// 7. Render Scripture Chapter to Reading Panel
function renderChapter(chapterNum) {
    // Save to local storage
    state.chapter = chapterNum;
    localStorage.setItem('bible_chapter', chapterNum);
    
    // Update labels in header
    els.headerBookName.textContent = state.book;
    els.headerChapterNum.textContent = chapterNum;

    // Find active book data (Genesis / Exodus)
    const currentBookData = bibleData.find(b => b.book === state.book);
    if (!currentBookData) {
        showErrorState(`선택한 책(${state.book})의 데이터를 찾을 수 없습니다.`);
        return;
    }

    const chapterData = currentBookData.chapters.find(c => c.chapter === chapterNum);
    if (!chapterData) {
        showErrorState("선택한 장의 데이터를 찾을 수 없습니다.");
        return;
    }

    // Dynamic rendering with fade animation
    els.content.style.opacity = 0;
    
    setTimeout(() => {
        els.content.innerHTML = '';

        // 1. Create Korean Passage Panel
        const koPanel = document.createElement('div');
        koPanel.className = 'passage-panel korean';
        
        // Add Header inside panel for aesthetics
        const koHeader = document.createElement('h3');
        koHeader.className = 'passage-header';
        koHeader.textContent = `${state.book} ${chapterNum}장`;
        koPanel.appendChild(koHeader);

        const koBody = document.createElement('div');
        koBody.className = 'passage-body';
        koPanel.appendChild(koBody);

        // 2. Create English/Original Passage Panel
        const bookIndex = bibleData.findIndex(b => b.book === state.book);
        const isOt = bookIndex < 39;

        const enPanel = document.createElement('div');
        enPanel.className = state.subLanguage === 'en' 
            ? 'passage-panel english' 
            : (isOt ? 'passage-panel english hebrew-mode' : 'passage-panel english greek-mode');
        
        const enHeader = document.createElement('h3');
        enHeader.className = 'passage-header';
        
        if (state.subLanguage === 'en') {
            enHeader.textContent = `${currentBookData.bookEn} Chapter ${chapterNum} (NIV)`;
        } else {
            enHeader.textContent = isOt 
                ? `${currentBookData.bookEn} Chapter ${chapterNum} (Hebrew WLC)` 
                : `${currentBookData.bookEn} Chapter ${chapterNum} (Greek TISCH)`;
        }
        enPanel.appendChild(enHeader);

        const enBody = document.createElement('div');
        enBody.className = 'passage-body';
        if (state.subLanguage === 'og' && isOt) {
            enBody.setAttribute('dir', 'rtl');
        }
        enPanel.appendChild(enBody);

        // 3. Populate verses to panels
        chapterData.verses.forEach(v => {
            // Korean verse unit
            const koSpan = document.createElement('span');
            koSpan.className = 'verse-unit';
            koSpan.dataset.verse = v.verse;
            
            const koNum = document.createElement('sup');
            koNum.className = 'verse-num';
            koNum.textContent = v.verse;
            
            koSpan.appendChild(koNum);
            wrapTextInWordUnits(koSpan, v.ko, v.verse, v.ko, v.en, v.og, isOt);
            koBody.appendChild(koSpan);

            // English/Original verse unit
            const enSpan = document.createElement('span');
            enSpan.className = 'verse-unit';
            enSpan.dataset.verse = v.verse;
            
            // Apply language attributes for correct font-rendering and spacing
            if (state.subLanguage === 'og') {
                if (isOt) {
                    enSpan.setAttribute('dir', 'rtl');
                    enSpan.setAttribute('lang', 'he');
                } else {
                    enSpan.setAttribute('lang', 'el');
                }
            } else {
                enSpan.setAttribute('lang', 'en');
            }
            
            const enNum = document.createElement('sup');
            enNum.className = 'verse-num';
            enNum.textContent = v.verse;
            
            enSpan.appendChild(enNum);
            
            const textToShow = state.subLanguage === 'en' ? v.en : (v.og || '—');
            wrapTextInWordUnits(enSpan, textToShow, v.verse, v.ko, v.en, v.og, isOt);
            enBody.appendChild(enSpan);

            // Double highlighters (Clicking Korean verse also highlights English verse, and vice versa)
            const handleHighlight = () => {
                const isAlreadyActive = koSpan.classList.contains('active-verse');
                
                // Clear all active highlights first
                document.querySelectorAll('.verse-unit.active-verse').forEach(unit => {
                    unit.classList.remove('active-verse');
                });
                
                if (!isAlreadyActive) {
                    const targetUnits = document.querySelectorAll(`[data-verse="${v.verse}"]`);
                    targetUnits.forEach(unit => {
                        unit.classList.add('active-verse');
                    });
                    
                    // Update theological commentary & original lexicon panel
                    updateCommentaryPanel(v.verse, v.ko, v.en, v.og, isOt);
                    
                    // Smoothly slide open the reference panel
                    els.refSection.classList.remove('collapsed');
                } else {
                    resetCommentaryPanel();
                }
            };

            koSpan.addEventListener('click', handleHighlight);
            enSpan.addEventListener('click', handleHighlight);
        });

        // 4. Layout positioning
        els.content.appendChild(koPanel);
        els.content.appendChild(enPanel);

        els.content.style.opacity = 1;
        // Scroll back to top smoothly
        els.readingArea.scrollTo({ top: 0, behavior: 'smooth' });
    }, 200);

    // Disable floating navigation boundary states
    const maxChapters = currentBookData.chapters.length;
    els.prevFloating.style.opacity = (chapterNum === 1) ? 0.3 : 1;
    els.nextFloating.style.opacity = (chapterNum === maxChapters) ? 0.3 : 1;
}

// 8. Toast Alert Builder
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = message;
    
    els.toastContainer.appendChild(toast);
    
    // Slide in
    setTimeout(() => {
        toast.classList.add('show');
    }, 50);

    // Slide out and remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 2500);
}

// Helper for Safe Event Listener Binding to prevent crashes on null references
function safeAddListener(element, event, callback) {
    if (element) {
        element.addEventListener(event, callback);
    } else {
        console.warn(`[BibleApp Warning]: Element was not found for '${event}' event. Skipping binding.`);
    }
}

// 9. User Event Listeners Setup
function bindEvents() {
    // PWA Install Prompt Handler
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (els.installPwaBtn) {
            els.installPwaBtn.style.display = 'inline-flex';
        }
    });

    safeAddListener(els.installPwaBtn, 'click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                deferredPrompt = null;
                if (els.installPwaBtn) {
                    els.installPwaBtn.style.display = 'none';
                }
            }
        }
    });

    // Trigger selector modal on header click
    safeAddListener(els.pickerTrigger, 'click', openPickerModal);
    safeAddListener(els.pickerClose, 'click', closePickerModal);
    safeAddListener(els.pickerBackdrop, 'click', closePickerModal);
    
    // Back navigation button (Step 2 -> Step 1)
    safeAddListener(els.backBtn, 'click', () => {
        if (els.chaptersView && els.booksView) {
            els.chaptersView.classList.remove('active');
            els.booksView.classList.add('active');
        }
    });

    // OT / NT grid tab switches
    safeAddListener(els.tabOtBtn, 'click', () => {
        if (els.tabOtBtn && els.tabNtBtn) {
            els.tabOtBtn.classList.add('active');
            els.tabNtBtn.classList.remove('active');
        }
        renderBooksGrid('ot');
    });

    safeAddListener(els.tabNtBtn, 'click', () => {
        if (els.tabOtBtn && els.tabNtBtn) {
            els.tabNtBtn.classList.add('active');
            els.tabOtBtn.classList.remove('active');
        }
        renderBooksGrid('nt');
    });

    // Theme switches
    safeAddListener(els.themeToggle, 'click', () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('bible_theme', state.theme);
        applyStateToUI();
    });

    // Sidebar settings panel controls
    safeAddListener(els.settingsToggle, 'click', () => {
        if (els.settingsPanel) els.settingsPanel.classList.toggle('open');
    });
    
    safeAddListener(els.settingsClose, 'click', () => {
        if (els.settingsPanel) els.settingsPanel.classList.remove('open');
    });

    // Layout togglers
    safeAddListener(els.layoutSideBtn, 'click', () => {
        if (state.layout !== 'side') {
            state.layout = 'side';
            localStorage.setItem('bible_layout', 'side');
            applyStateToUI();
            renderChapter(state.chapter);
        }
    });

    safeAddListener(els.layoutStackBtn, 'click', () => {
        if (state.layout !== 'stack') {
            state.layout = 'stack';
            localStorage.setItem('bible_layout', 'stack');
            applyStateToUI();
            renderChapter(state.chapter);
        }
    });

    // Font family switches
    safeAddListener(els.fontSansBtn, 'click', () => {
        state.fontFamily = 'sans';
        localStorage.setItem('bible_font_family', 'sans');
        applyStateToUI();
    });

    safeAddListener(els.fontSerifBtn, 'click', () => {
        state.fontFamily = 'serif';
        localStorage.setItem('bible_font_family', 'serif');
        applyStateToUI();
    });

    // Font sizing controls
    safeAddListener(els.fontDecrease, 'click', () => {
        if (state.fontSize > 80) {
            state.fontSize -= 10;
            localStorage.setItem('bible_font_size', state.fontSize);
            applyStateToUI();
        }
    });

    safeAddListener(els.fontIncrease, 'click', () => {
        if (state.fontSize < 200) {
            state.fontSize += 10;
            localStorage.setItem('bible_font_size', state.fontSize);
            applyStateToUI();
        }
    });

    // Accent color pickers
    if (els.colorDots) {
        els.colorDots.forEach(dot => {
            safeAddListener(dot, 'click', (e) => {
                const chosen = e.target.dataset.accent;
                state.accent = chosen;
                localStorage.setItem('bible_accent', chosen);
                applyStateToUI();
            });
        });
    }

    // Sub-language switches (English vs Original)
    const setLanguageEn = () => {
        if (state.subLanguage !== 'en') {
            state.subLanguage = 'en';
            localStorage.setItem('bible_sub_language', 'en');
            applyStateToUI();
            renderChapter(state.chapter);
        }
    };
    const setLanguageOg = () => {
        if (state.subLanguage !== 'og') {
            state.subLanguage = 'og';
            localStorage.setItem('bible_sub_language', 'og');
            applyStateToUI();
            renderChapter(state.chapter);
        }
    };

    safeAddListener(els.langEnBtn, 'click', setLanguageEn);
    safeAddListener(els.quickLangEnBtn, 'click', setLanguageEn);

    safeAddListener(els.langOgBtn, 'click', setLanguageOg);
    safeAddListener(els.quickLangOgBtn, 'click', setLanguageOg);

    // Toggle commentary panel height (expand/collapse)
    safeAddListener(els.refCloseBtn, 'click', () => {
        if (els.refSection) els.refSection.classList.toggle('collapsed');
    });

    // Floating navigation button events
    safeAddListener(els.prevFloating, 'click', () => {
        if (state.chapter > 1) {
            renderChapter(state.chapter - 1);
        }
    });

    safeAddListener(els.nextFloating, 'click', () => {
        const maxCh = getMaxChapters();
        if (state.chapter < maxCh) {
            renderChapter(state.chapter + 1);
        }
    });

    // Gesture onboarding hint dismissal
    safeAddListener(els.dismissHintBtn, 'click', () => {
        state.hintDismissed = true;
        localStorage.setItem('bible_hint_dismissed', 'true');
        if (els.gestureHint) els.gestureHint.classList.remove('visible');
    });

    setupSwipeGestures();
}

// 10. Mobile Swipe Gestures Implementation
function setupSwipeGestures() {
    let startX = 0;
    let startY = 0;
    let endX = 0;
    let endY = 0;
    
    const minSwipeDistance = 70; 
    const maxSwipeVerticalDeviation = 45; 

    els.readingArea.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        els.readingArea.classList.remove('swipe-active-prev', 'swipe-active-next');
    }, { passive: true });

    els.readingArea.addEventListener('touchmove', (e) => {
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const diffX = currentX - startX;
        const diffY = currentY - startY;

        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffY) < maxSwipeVerticalDeviation) {
            if (diffX > 20 && state.chapter > 1) {
                els.readingArea.classList.add('swipe-active-prev');
                els.readingArea.classList.remove('swipe-active-next');
            } else if (diffX < -20 && state.chapter < getMaxChapters()) {
                els.readingArea.classList.add('swipe-active-next');
                els.readingArea.classList.remove('swipe-active-prev');
            }
        }
    }, { passive: true });

    els.readingArea.addEventListener('touchend', (e) => {
        endX = e.changedTouches[0].clientX;
        endY = e.changedTouches[0].clientY;
        
        const diffX = endX - startX;
        const diffY = endY - startY;

        els.readingArea.classList.remove('swipe-active-prev', 'swipe-active-next');

        if (Math.abs(diffX) > minSwipeDistance && Math.abs(diffY) < Math.abs(diffX)) {
            if (diffX > 0) {
                if (state.chapter > 1) {
                    renderChapter(state.chapter - 1);
                }
            } else {
                if (state.chapter < getMaxChapters()) {
                    renderChapter(state.chapter + 1);
                }
            }
        }
    }, { passive: true });
}

// 11. Error display screen utility
function showErrorState(msg) {
    els.content.innerHTML = `
        <div class="loading-state" style="color: #f43f5e;">
            <i class="fa-solid fa-triangle-exclamation" style="font-size: 32px; margin-bottom: 8px;"></i>
            <p>${msg}</p>
            <button onclick="window.location.reload()" class="premium-btn" style="margin-top: 10px;">다시 시도</button>
        </div>
    `;
    els.content.style.opacity = 1;
}

// 12. Helper to get maximum chapters for the current active book
function getMaxChapters() {
    const book = OT_BOOKS.find(b => b.name === state.book) || NT_BOOKS.find(b => b.name === state.book);
    return book ? book.chapters : 50;
}

// 13. Reference Panel Controller (Theological Commentary & Lexicon)
function resetCommentaryPanel() {
    els.refVerseTitle.textContent = "말씀 참고 및 신학 주석";
    els.refContent.innerHTML = `
        <div class="empty-state-ref">
            <i class="fa-solid fa-circle-info info-icon"></i>
            <p>본문의 특정 구절을 터치하시면,<br>핵심 어휘의 영어/원어 분석과 신학 주석이 여기에 로드됩니다.</p>
        </div>
    `;
}

function updateCommentaryPanel(verseNum, koText, enText, ogText, isOt) {
    els.refVerseTitle.textContent = `${state.book} ${state.chapter}장 ${verseNum}절 주석 및 어휘`;

    const key = `${state.book}:${state.chapter}:${verseNum}`;
    const commentary = BIBLE_COMMENTARY_DB[key];

    // Clear content
    els.refContent.innerHTML = '';

    let lexiconList = [];
    let theologyText = '';

    if (commentary) {
        lexiconList = commentary.lexicon;
        theologyText = commentary.theology;
    } else {
        // Dynamic analysis generator
        const rules = isOt ? BIBLE_COMMENTARY_DB.rules.OT : BIBLE_COMMENTARY_DB.rules.NT;
        const matchedRules = [];

        // Match Korean words
        rules.forEach(r => {
            if (koText && koText.includes(r.korean)) {
                matchedRules.push({
                    word: r.korean,
                    original: r.original,
                    type: isOt ? "히브리어 명사/동사" : "헬라어 명사/동사",
                    english: r.english,
                    meaning: r.meaning
                });
            }
        });

        // Common Christian English words matching fallback
        const commonEnWords = [
            { en: "God", ko: "하나님", og: "אֱלֹהִים / θεός", meaning: "피조세계의 완전한 주관자이자 영원한 구원자" },
            { en: "Lord", ko: "주님", og: "יְהוָה / κύριος", meaning: "영혼의 통치자이자 구속의 구세주" },
            { en: "Jesus", ko: "예수", og: "Ἰησοῦς", meaning: "자기 백성을 죄에서 건져내실 메시아" },
            { en: "Christ", ko: "그리스도", og: "Χριστός", meaning: "기름 부음 받은 자, 기름 부음을 입은 선지자/왕" },
            { en: "Holy", ko: "거룩한", og: "קָדוֹשׁ / ἅγιος", meaning: "속된 영역으로부터 성별된 성성(聖性)" },
            { en: "Spirit", ko: "성령/영혼", og: "רוּחַ / πνεῦμα", meaning: "생명의 숨결이자 창조주 하나님의 신성한 영" },
            { en: "Heaven", ko: "하늘", og: "שָׁמַיִם / οὐρανός", meaning: "하나님의 보좌가 있는 영적 통치 처소" },
            { en: "Love", ko: "사랑", og: "אַהֲבָה / ἀγάπη", meaning: "자신을 온전히 희생하여 생명을 주는 절대적 가치" },
            { en: "Faith", ko: "믿음", og: "אֱמוּנָה / πίστις", meaning: "그리스도의 구속 공로에 영혼을 맡기는 전인격적 의뢰" }
        ];

        commonEnWords.forEach(w => {
            // Check if english text contains the word as a substring (case-insensitive)
            if (enText && new RegExp(`\\b${w.en}\\b`, 'i').test(enText)) {
                // Prevent duplicate korean words
                if (!matchedRules.some(r => r.word === w.ko)) {
                    matchedRules.push({
                        word: w.ko,
                        original: w.og,
                        type: "핵심 교리적 어휘",
                        english: w.en,
                        meaning: w.meaning
                    });
                }
            }
        });

        if (matchedRules.length > 0) {
            lexiconList = matchedRules;
            
            // Build dynamic high-level theological commentary text
            let generated = `본 구절은 성경 신학의 중심 기둥이 되는 <b>${matchedRules.map(m => m.word).join(', ')}</b> 어휘들을 중심에 두고 신적 경륜을 나타냅니다. `;
            matchedRules.forEach(m => {
                generated += `<br>• <b>${m.word}</b>: 원어 <i>${m.original}</i> (영어: ${m.english})로써, '${m.meaning}'를 함축하여 본문 구절의 영적 깊이를 조명합니다. `;
            });
            generated += `<br><br>신학적으로 고찰할 때, 본 구절에 내포된 원어적 뉘앙스는 성도가 처한 영적 실존과 하나님의 신실하신 통치를 매개하며, 묵상하는 영혼에게 성화(Sanctification)를 촉구하는 강력한 가르침을 선사합니다.`;
            theologyText = generated;
        } else {
            // absolute default fallback
            lexiconList = [
                {
                    word: "대조 연구",
                    original: isOt ? "Hebrew (구약)" : "Greek (신약)",
                    type: "언어학적 분석",
                    english: "Comparative Study",
                    meaning: "한글 번역본과 영어(NIV) 및 원어 본문 간의 어휘 대조 연구를 통해 의미를 상호 보완합니다."
                }
            ];
            theologyText = "본 절은 성경의 거시적 맥락 속에서 영적인 진리와 교훈을 담고 있습니다. 제공되는 한글과 영어, 원어 대조를 통해 각 번역의 세밀한 차이를 음미하며 깊이 있는 개인적 묵상과 교리적 통찰을 넓혀 가실 수 있습니다.";
        }
    }

    // 1. Render Lexicon Grid
    const lexGrid = document.createElement('div');
    lexGrid.className = 'lexicon-grid';

    lexiconList.forEach(item => {
        const card = document.createElement('div');
        card.className = 'lexicon-card';

        const name = document.createElement('div');
        name.className = 'lex-korean';
        name.textContent = item.word;

        const orig = document.createElement('div');
        orig.className = 'lex-original';
        orig.textContent = item.original;

        const meta = document.createElement('div');
        meta.className = 'lex-meta';
        meta.textContent = `${item.type} | ${item.english}`;

        const mean = document.createElement('div');
        mean.className = 'lex-meaning';
        mean.textContent = item.meaning;

        card.appendChild(name);
        card.appendChild(orig);
        card.appendChild(meta);
        card.appendChild(mean);
        lexGrid.appendChild(card);
    });
    els.refContent.appendChild(lexGrid);

    // 2. Render Theological Commentary
    const commSection = document.createElement('div');
    commSection.className = 'theological-commentary';

    const label = document.createElement('div');
    label.className = 'commentary-label';
    label.textContent = "신학적 해설 및 주해 (Commentary)";

    const body = document.createElement('div');
    body.className = 'commentary-text';
    body.innerHTML = theologyText;

    commSection.appendChild(label);
    commSection.appendChild(body);
    els.refContent.appendChild(commSection);
}

// 14. Word-level wrapping and click handlers
function wrapTextInWordUnits(container, text, verseNum, koText, enText, ogText, isOt) {
    const words = text.split(/\s+/);
    words.forEach((w, idx) => {
        if (w.trim()) {
            const wordSpan = document.createElement('span');
            wordSpan.className = 'word-unit';
            wordSpan.textContent = w;
            wordSpan.dataset.verse = verseNum;
            
            // Set word click listener
            wordSpan.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent bubbling up to the verse span click
                
                // Get active status
                const parentVerse = container.closest('.verse-unit');
                const isAlreadyActive = parentVerse && parentVerse.classList.contains('active-verse');
                
                // 1. If the verse is not active, activate it first
                if (!isAlreadyActive) {
                    document.querySelectorAll('.verse-unit.active-verse').forEach(unit => {
                        unit.classList.remove('active-verse');
                    });
                    const targetUnits = document.querySelectorAll(`[data-verse="${verseNum}"]`);
                    targetUnits.forEach(unit => {
                        unit.classList.add('active-verse');
                    });
                    
                    // Draw base verse commentary
                    updateCommentaryPanel(verseNum, koText, enText, ogText, isOt);
                    els.refSection.classList.remove('collapsed');
                }
                
                // 2. Select this word visually (clear other selected words in this verse)
                document.querySelectorAll('.word-unit.selected-word').forEach(el => {
                    el.classList.remove('selected-word');
                });
                
                wordSpan.classList.add('selected-word');
                
                // 3. Update commentary focus to this word
                focusWordCommentary(w, verseNum, koText, enText, ogText, isOt);
            });
            
            container.appendChild(wordSpan);
            container.appendChild(document.createTextNode(' '));
        }
    });
}

function stripHebrewVowels(text) {
    if (!text) return "";
    // Remove Hebrew points (Nikkud/dagesh/etc.) in Unicode range U+0591 to U+05C7
    return text.replace(/[\u0591-\u05C7]/g, "");
}

function stripGreekDiacritics(text) {
    if (!text) return "";
    // Decompose characters and remove Greek combining diacritical marks
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function transliterateGreekToKorean(text) {
    if (!text) return "";
    let clean = stripGreekDiacritics(text).toLowerCase();
    
    // Normalize typical Greek endings phonetics first for smooth reading
    clean = clean.replace(/ων$/, "온")
                 .replace(/ος$/, "오스")
                 .replace(/ον$/, "온")
                 .replace(/ους$/, "우스")
                 .replace(/οις$/, "오이스")
                 .replace(/αις$/, "아이스")
                 .replace(/ας$/, "아스")
                 .replace(/ης$/, "에스");
    
    // Map dipthongs
    const dipthongs = [
        { gk: "αι", ko: "아이" },
        { gk: "ει", ko: "에이" },
        { gk: "οι", ko: "오이" },
        { gk: "υι", ko: "위이" },
        { gk: "αυ", ko: "아우" },
        { gk: "ευ", ko: "에우" },
        { gk: "ου", ko: "우" },
        { gk: "γγ", ko: "응그" },
        { gk: "γκ", ko: "응크" },
        { gk: "γχ", ko: "응크" }
    ];
    
    dipthongs.forEach(d => {
        clean = clean.replace(new RegExp(d.gk, "g"), d.ko);
    });
    
    // Character by character mapping
    const letters = {
        'α': '아', 'β': '베', 'γ': '그', 'δ': '데', 'ε': '에',
        'ζ': '제', 'η': '에', 'θ': '테', 'ι': '이', 'κ': '카',
        'λ': 'ㄹ', 'μ': '무', 'ν': '느', 'ξ': '크시', 'ο': '오',
        'π': '페', 'ρ': '레', 'σ': '스', 'ς': '스', 'τ': '테',
        'υ': '위', 'φ': '페', 'χ': '키', 'ψ': '프시', 'ω': '오'
    };
    
    let result = "";
    for (let char of clean) {
        if (letters[char]) {
            result += letters[char];
        } else {
            result += char;
        }
    }
    
    // Refine pronunciation flow
    return result.replace(/으느/g, "느")
                 .replace(/으르/g, "르")
                 .replace(/그레/g, "게")
                 .replace(/스페/g, "스페")
                 .replace(/스테/g, "스테")
                 .replace(/스포/g, "스포")
                 .replace(/테오느/g, "톤")
                 .replace(/아우테온/g, "아우톤")
                 .replace(/아우토스/g, "아우토스");
}

function transliterateHebrewToKorean(text) {
    if (!text) return "";
    let clean = stripHebrewVowels(text);
    
    const letters = {
        'א': '아', 'ב': '베', 'ג': '게', 'ד': '데', 'ה': '헤',
        'ו': '바', 'ז': '제', 'ח': '헤', 'ט': '테', 'י': '요',
        'כ': '카', 'ך': '크', 'λ': '레', 'ל': '레', 'מ': '메', 'ם': '음',
        'נ': '네', 'ן': '은', 'ס': '세', 'ע': '아', 'פ': '페',
        'ף': '프', 'צ': '체', 'ץ': '츠', 'ק': '코', 'ר': '레',
        'ש': '쉐', 'ת': '테'
    };
    
    let result = "";
    for (let char of clean) {
        if (letters[char]) {
            result += letters[char];
        } else {
            result += char;
        }
    }
    return result;
}

function estimateGreekLemma(word) {
    if (!word) return "";
    let clean = stripGreekDiacritics(word).toLowerCase().trim();
    
    // 1. Remove verbal reduplication (e.g. γεγραπται -> γραπται)
    if (clean.length > 4 && clean.substring(0, 2) === "γε") {
        clean = clean.substring(2);
    } else if (clean.length > 4 && clean.substring(0, 2) === "κε") {
        clean = clean.substring(2);
    } else if (clean.length > 4 && clean.substring(0, 2) === "πε") {
        clean = clean.substring(2);
    }
    
    // 2. Remove past augment (e.g. εγραψεν -> γραψεν)
    if (clean.length > 3 && clean.startsWith("ε")) {
        clean = clean.substring(1);
    }
    
    // 3. Strip common Greek noun/verb/pronoun inflection suffixes to get base stem
    clean = clean.replace(/(ων|οις|ον|ους|αις|ας|ης|ου|ης|ει|ουν|ομεν|ετε|ουσι|ουσιν|ηται|εται|ται|ην|ης|η|오이스|οις|ις|ος)$/, "");
    
    return clean;
}

function getEnglishRoot(word) {
    if (!word) return "";
    let cleaned = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?\"\'“”]/g, "").trim().toLowerCase();
    cleaned = cleaned.replace(/(s|ed|ing|es|ly)$/, "");
    return cleaned;
}

function getRootWord(word) {
    // Remove punctuation
    let cleaned = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?\"\'“”]/g, "").trim();
    // Strip common Korean postpositions & verb suffixes
    cleaned = cleaned.replace(/(은|는|이|가|을|를|에|의|로|으로|와|과|보다|에서|하고|에게|한테|께|만|도|조차|마저|부터|까지|하사|하니|하도|하신|했다|했고|했으나|하도다|하느니라|이시니|이시니라|주셨으니|주셨으매|사랑하사|하심이니라|없으리로다|계시니라|창조하시니라)$/, "");
    // Exception for love
    if (cleaned === "사랑") return "사랑";
    return cleaned.trim();
}

function focusWordCommentary(clickedWord, verseNum, koText, enText, ogText, isOt) {
    // 1. Normalize clickedWord (remove punctuation, lower-case for English/Greek comparison)
    const rawRoot = clickedWord.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?\"\'“”]/g, "").trim().toLowerCase();
    const korRoot = getRootWord(clickedWord);
    
    const key = `${state.book}:${state.chapter}:${verseNum}`;
    const commentary = BIBLE_COMMENTARY_DB[key];
    
    let matchedItem = null;
    
    // Helper to check cross-lingual matching on a lexicon item with advanced normalization
    const checkMatch = (item) => {
        if (!item) return false;
        
        const itemWord = (item.word || "").toLowerCase();
        const itemEnglish = getEnglishRoot(item.english || "");
        const itemOriginal = stripHebrewVowels(stripGreekDiacritics(item.original || "")).toLowerCase();
        
        const cleanClicked = stripHebrewVowels(stripGreekDiacritics(rawRoot)).toLowerCase();
        const cleanEnRoot = getEnglishRoot(clickedWord);
        
        return itemWord.includes(korRoot) || korRoot.includes(itemWord) ||
               (itemEnglish && (itemEnglish.includes(cleanEnRoot) || cleanEnRoot.includes(itemEnglish))) ||
               (itemOriginal && (itemOriginal.includes(cleanClicked) || cleanClicked.includes(itemOriginal)));
    };
    
    // A. Search in curated key verse lexicon
    if (commentary && commentary.lexicon) {
        matchedItem = commentary.lexicon.find(item => checkMatch(item));
    }
    
    // B. Search in general lexicon rules
    if (!matchedItem) {
        const rules = isOt ? BIBLE_COMMENTARY_DB.rules.OT : BIBLE_COMMENTARY_DB.rules.NT;
        const matchedRule = rules.find(r => {
            const ruleWord = r.korean.toLowerCase();
            const ruleEnglish = getEnglishRoot(r.english);
            const ruleOriginal = stripHebrewVowels(stripGreekDiacritics(r.original)).toLowerCase();
            
            const cleanClicked = stripHebrewVowels(stripGreekDiacritics(rawRoot)).toLowerCase();
            const cleanEnRoot = getEnglishRoot(clickedWord);
            
            return ruleWord.includes(korRoot) || korRoot.includes(ruleWord) ||
                   (ruleEnglish && (ruleEnglish.includes(cleanEnRoot) || cleanEnRoot.includes(ruleEnglish))) ||
                   (ruleOriginal && (ruleOriginal.includes(cleanClicked) || cleanClicked.includes(ruleOriginal)));
        });
        
        if (matchedRule) {
            matchedItem = {
                word: matchedRule.korean,
                original: matchedRule.original,
                type: isOt ? "히브리어 원어" : "헬라어 원어",
                english: matchedRule.english,
                meaning: matchedRule.meaning
            };
        }
    }
    
    // C. Search in common English/Doctrine words list
    if (!matchedItem) {
        const commonEnWords = [
            { en: "God", ko: "하나님", og: "אֱלֹהִים / θεός", meaning: "피조세계의 완전한 주관자이자 영원한 구원자" },
            { en: "Lord", ko: "주님", og: "יְהוָה / κύριος", meaning: "영혼의 통치자이자 구속의 구세주" },
            { en: "Jesus", ko: "예수", og: "Ἰησοῦς", meaning: "자기 백성을 죄에서 건져내실 메시아" },
            { en: "Christ", ko: "그리스도", og: "Χριστός", meaning: "기름 부음 받은 자, 기름 부음을 입은 선지자/왕" },
            { en: "Holy", ko: "거룩한", og: "קָדוֹשׁ / ἅγιος", meaning: "속된 영역으로부터 성별된 성성(聖性)" },
            { en: "Spirit", ko: "성령/영혼", og: "רוּחַ / πνεῦμα", meaning: "생명의 숨결이자 창조주 하나님의 신성한 영" },
            { en: "Heaven", ko: "하늘", og: "שָׁמַיִם / οὐρανός", meaning: "하나님의 보좌가 있는 영적 통치 처소" },
            { en: "Love", ko: "사랑", og: "אַהֲבָה / ἀγάπη", meaning: "자신을 온전히 희생하여 생명을 주는 절대적 가치" },
            { en: "Faith", ko: "믿음", og: "אֱמוּנָה / πίστις", meaning: "그리스도의 구속 공로에 영혼을 맡기는 전인격적 의뢰" }
        ];
        
        const matchedEn = commonEnWords.find(w => {
            const wEn = getEnglishRoot(w.en);
            const wKo = w.ko.toLowerCase();
            const wOg = stripHebrewVowels(stripGreekDiacritics(w.og)).toLowerCase();
            
            const cleanClicked = stripHebrewVowels(stripGreekDiacritics(rawRoot)).toLowerCase();
            const cleanEnRoot = getEnglishRoot(clickedWord);
            
            return wEn.includes(cleanEnRoot) || cleanEnRoot.includes(wEn) ||
                   wKo.includes(korRoot) || korRoot.includes(wKo) ||
                   wOg.includes(cleanClicked) || cleanClicked.includes(wOg);
        });
        
        if (matchedEn) {
            matchedItem = {
                word: matchedEn.ko,
                original: matchedEn.og,
                type: "핵심 교리적 어휘",
                english: matchedEn.en,
                meaning: matchedEn.meaning
            };
        }
    }
    
    // D. Search in the General Holy Bible Dictionary
    if (!matchedItem && BIBLE_COMMENTARY_DB.dictionary) {
        const dict = BIBLE_COMMENTARY_DB.dictionary;
        const cleanEnRoot = getEnglishRoot(clickedWord);
        
        const matchedKey = Object.keys(dict).find(k => {
            const item = dict[k];
            const itemKo = (item.ko || "").toLowerCase();
            const cleanKey = getEnglishRoot(k);
            return cleanKey === cleanEnRoot || 
                   itemKo.includes(korRoot) || 
                   korRoot.includes(itemKo);
        });
        
        if (matchedKey) {
            const item = dict[matchedKey];
            matchedItem = {
                word: item.ko,
                original: item.og,
                type: "성경 대사전 표제어",
                english: matchedKey,
                meaning: item.mean
            };
        }
    }
    
    // Clear and draw focus styling inside Lexicon Cards
    const cards = els.refContent.querySelectorAll('.lexicon-card');
    cards.forEach(card => {
        const lexTitle = card.querySelector('.lex-korean').textContent;
        const lexMeta = card.querySelector('.lex-meta').textContent;
        
        if (matchedItem && (lexTitle === matchedItem.word || lexMeta.includes(matchedItem.english))) {
            card.style.background = 'rgba(var(--accent-rgb), 0.15)';
            card.style.borderColor = 'var(--accent)';
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
            card.style.background = 'rgba(255, 255, 255, 0.02)';
            card.style.borderColor = 'var(--glass-border)';
        }
    });
    
    // Update theological commentary section for this specific word
    const commentaryTextEl = els.refContent.querySelector('.commentary-text');
    const commentaryLabelEl = els.refContent.querySelector('.commentary-label');
    
    if (matchedItem) {
        commentaryLabelEl.textContent = `다국어 단어 비교 연구 (Multilingual Word Study)`;
        commentaryTextEl.innerHTML = `
            <div class="word-study-header">
                <span class="word-lang-tag tag-ko">한글</span> <b>${matchedItem.word}</b> &nbsp;|&nbsp; 
                <span class="word-lang-tag tag-en">영어</span> <b>${matchedItem.english}</b> &nbsp;|&nbsp; 
                <span class="word-lang-tag tag-og">원어</span> <b>${matchedItem.original}</b>
            </div>
            <div class="word-study-details">
                <p><b>• 클릭한 단어 어휘:</b> 본문 속에서 터치한 단어는 <b>"${clickedWord}"</b>입니다.</p>
                <p><b>• 영어 번역의 의미:</b> 영어 NIV 성경은 이 개념을 <b>"${matchedItem.english}"</b>(으)로 번역하여, 문장 구조 속에서 객관적이며 명료한 의미적 가치를 전달합니다.</p>
                <p><b>• 원어 어원의 깊은 뜻:</b> 성경 원어 <b><i>${matchedItem.original}</i></b>은 고대 언어사상적 배경 속에서 <b>"${matchedItem.meaning}"</b>라는 묵직한 영적 가치를 지닙니다. 이는 창조주 하나님의 의지와 영원한 약속이 서려 있는 핵심 계시어입니다.</p>
                <p><b>• 신학자적 주해 및 해석:</b> 신학적 시각에서 볼 때 이 어휘는 구절 전체의 신앙 고백적 핵심입니다. 성서 기자가 사용한 원어의 뉘앙스를 온전히 헤아릴 때, 단순 번역의 한계를 극복하고 본래 선포하고자 했던 구속사적 진리를 가장 깊이 있게 묵상할 수 있습니다.</p>
            </div>
        `;
    } else {
        // D. Generate dynamic dictionary logic on-the-fly for unregistered words
        const clean = clickedWord.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?\"\'“”]/g, "").trim();
        const isProperNoun = /^[A-Z]/.test(clean);
        
        let pos = "일반 어휘";
        let mean = "성경의 구속사적 의미를 구체화하는 표현";
        let dispOriginal = "성서 원어";
        const cleanLower = clean.toLowerCase();
        
        const isGreek = /[\u0370-\u03FF\u1F00-\u1FFF]/.test(clean);
        const isHebrew = /[\u0590-\u05FF]/.test(clean);
        
        if (isGreek) {
            pos = "헬라어 어휘 (Greek Vocab)";
            const pronunciation = transliterateGreekToKorean(clean);
            dispOriginal = `${clean} (${pronunciation})`;
            
            // BDAG Lexicon matching
            let matchedBdag = null;
            if (BIBLE_COMMENTARY_DB.greekBDAG) {
                const bdag = BIBLE_COMMENTARY_DB.greekBDAG;
                const estimatedStem = estimateGreekLemma(clean);
                const bdagKey = Object.keys(bdag).find(k => {
                    const cleanK = stripGreekDiacritics(k).toLowerCase();
                    return cleanK.includes(estimatedStem) || estimatedStem.includes(cleanK) ||
                           (cleanK.length > 3 && estimatedStem.substring(0, 3) === cleanK.substring(0, 3));
                });
                if (bdagKey) {
                    matchedBdag = bdag[bdagKey];
                    pos = "헬라어 성경사전 표제어 (BDAG Lexicon)";
                    dispOriginal = `${bdagKey} (${matchedBdag.og})`;
                    mean = `[BDAG 사전 정의]: ${matchedBdag.mean}`;
                }
            }
            if (!matchedBdag) {
                mean = "신약 성경의 원어로 기록된 낱개 단어로서, 문맥의 영적 가치를 지탱하는 헬라어의 어휘적·문법적 요소";
            }
        } else if (isHebrew) {
            pos = "히브리어 어휘 (Hebrew Vocab)";
            const pronunciation = transliterateHebrewToKorean(clean);
            dispOriginal = `${clean} (${pronunciation})`;
            mean = "구약 성경의 원어로 기록된 낱개 단어로서, 하나님의 언약과 계시를 문자 그대로 품고 있는 히브리어의 신적 명사/동사";
        } else if (cleanLower.endsWith("ed") || cleanLower.endsWith("ing") || cleanLower.endsWith("ate") || cleanLower === "went" || cleanLower === "saw" || cleanLower === "came" || cleanLower === "said" || cleanLower === "gave") {
            pos = "동사 (Verb) 형태";
            mean = "하나님의 구원 명령의 실행과 피조물의 반응 및 구체적 역사적 행위를 지시하는 역동적 단어";
        } else if (cleanLower.endsWith("ly") || cleanLower.endsWith("ful") || cleanLower.endsWith("ous")) {
            pos = "수식어 (Modifier)";
            mean = "하나님의 거룩한 속성이나 구원 역사의 엄위함 또는 피조물의 상태를 묘사하여 본문의 뉘앙스를 심화하는 단어";
        } else if (isProperNoun) {
            pos = "성경 고유명사 (Proper Noun)";
            mean = "성경 역사 및 구속사적 예표론적 사건을 성취하기 위해 특별히 성별되어 기록된 고유한 인물 또는 장소";
        }
        
        commentaryLabelEl.textContent = `다국어 단어 일반 사전 분석: ${clean}`;
        commentaryTextEl.innerHTML = `
            <div class="word-study-header">
                <span class="word-lang-tag tag-en" style="background:var(--accent);color:#fff;">단어</span> <b>${clean}</b> &nbsp;|&nbsp; 
                <span class="word-lang-tag tag-ko" style="background:rgba(255,255,255,0.1);">분류</span> <b>${pos}</b>
            </div>
            <div class="word-study-details">
                <p><b>• 클릭한 원형:</b> 본 성경 구절에서 선택된 단어의 사전적 기본형은 <b>"${clean}"</b>입니다.</p>
                <p><b>• 원어 한글 발음 및 철자:</b> <b>${dispOriginal}</b></p>
                <p><b>• 사전적 뜻과 뉘앙스:</b> 이 어휘는 문맥상 <b>"${mean}"</b>의 역할을 지닙니다.</p>
                <p><b>• 묵상 및 대조 가이드:</b> 원어(히브리어/헬라어) 띄어쓰기 낱개 단위와 번역어(NIV, 한글)의 1:1 대조를 통해 각 단어가 가진 본질적 의미의 깊이를 입체적으로 탐구해 보십시오.</p>
            </div>
        `;
    }
}

init();;
// File end

