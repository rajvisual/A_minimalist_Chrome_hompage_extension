(function() {
      // --- APP STATE & STORAGE ---
      
      // URL domain helper for favicons and shortcuts
      function getDomain(url) {
        try {
          return new URL(url).hostname;
        } catch (e) {
          return '';
        }
      }

      const defaultState = {
        theme: 'dark',
        clockFormat: '12',
        searchEngine: 'google'
      };

      let state = Object.assign({}, defaultState);
      try {
        const saved = localStorage.getItem('chromenewtab_state');
        if (saved) {
          const parsed = JSON.parse(saved);
          delete parsed.shortcuts;
          state = Object.assign({}, defaultState, parsed);
        }
      } catch (e) {}

      function saveState() {
        try {
          const toSave = {
            theme: state.theme,
            clockFormat: state.clockFormat,
            searchEngine: state.searchEngine
          };
          localStorage.setItem('chromenewtab_state', JSON.stringify(toSave));
        } catch (e) {}
      }

      function showToast(msg, icon = '✨') {
        const toast = document.getElementById('toastNotification');
        const msgEl = document.getElementById('toastMessage');
        const iconEl = document.getElementById('toastIcon');
        if (!toast || !msgEl) return;
        msgEl.textContent = msg;
        if (iconEl) iconEl.textContent = icon;
        toast.classList.remove('hidden');
        clearTimeout(toast._timeout);
        toast._timeout = setTimeout(() => {
          toast.classList.add('hidden');
        }, 3000);
      }

      // --- DYNAMIC MOUSE-TRACKING EDGE GLOW & PARALLAX ---
      const glowElements = document.querySelectorAll('.glass-card, .glass-search-box');
      glowElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
          const rect = el.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          el.style.setProperty('--mouse-x', x + 'px');
          el.style.setProperty('--mouse-y', y + 'px');
        });
      });

      // Viewport Ambient Light Cursor Follower
      const cursorGlow = document.getElementById('cursorGlow');
      const fluidCanvasBg = document.getElementById('fluidCanvasBg');
      let mouseX = window.innerWidth / 2;
      let mouseY = window.innerHeight / 2;
      let currentX = mouseX;
      let currentY = mouseY;
      let isCursorActive = false;

      window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!isCursorActive && cursorGlow) {
          isCursorActive = true;
          cursorGlow.style.opacity = '1';
        }
      });

      window.addEventListener('mouseleave', () => {
        if (cursorGlow) cursorGlow.style.opacity = '0';
        isCursorActive = false;
      });

      function animateAmbientGlow() {
        // Smooth lerp interpolation for silky motion
        currentX += (mouseX - currentX) * 0.12;
        currentY += (mouseY - currentY) * 0.12;

        if (cursorGlow) {
          cursorGlow.style.left = currentX + 'px';
          cursorGlow.style.top = currentY + 'px';
        }

        // Gentle organic background wave parallax
        if (fluidCanvasBg) {
          const normX = (currentX / window.innerWidth - 0.5) * 20;
          const normY = (currentY / window.innerHeight - 0.5) * 15;
          fluidCanvasBg.style.transform = 'translate3d(' + (normX * 0.4) + 'px, ' + (normY * 0.4) + 'px, 0)';
        }

        requestAnimationFrame(animateAmbientGlow);
      }
      requestAnimationFrame(animateAmbientGlow);

      // --- LIVE CLOCK & DYNAMIC DATE ---
      function updateClock() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const clockDigits = document.getElementById('clockDigits');
        const clockPeriod = document.getElementById('clockPeriod');
        const dateDisplay = document.getElementById('dateDisplay');


        if (state.clockFormat === '12') {
          const actualPeriod = hours >= 12 ? 'PM' : 'AM';
          hours = hours % 12;
          hours = hours ? hours : 12;
          const strHours = String(hours).padStart(2, '0');
          if (clockDigits) clockDigits.textContent = strHours + ':' + minutes;
          if (clockPeriod) {
            clockPeriod.textContent = actualPeriod;
            clockPeriod.style.display = 'inline';
          }
        } else {
          const strHours = String(hours).padStart(2, '0');
          if (clockDigits) clockDigits.textContent = strHours + ':' + minutes;
          if (clockPeriod) clockPeriod.style.display = 'none';
        }

        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateStr = now.toLocaleDateString('en-US', options);
        if (dateDisplay) dateDisplay.textContent = dateStr;


      }
      setInterval(updateClock, 1000);
      updateClock();

      // Click on clock to toggle 12h/24h format
      const clockToggleArea = document.getElementById('clockToggleArea');
      if (clockToggleArea) {
        clockToggleArea.addEventListener('click', () => {
          state.clockFormat = state.clockFormat === '12' ? '24' : '12';
          saveState();
          updateClock();
          showToast('Clock set to ' + (state.clockFormat === '12' ? '12-Hour AM/PM' : '24-Hour'), '⏰');
        });
      }

      // --- ANIMATED DAY / NIGHT THEME SWITCH ---
      const themeToggleBtn = document.getElementById('themeToggleBtn');
      const themeKnob = document.getElementById('themeKnob');
      const dayScene = document.getElementById('dayScene');
      const nightScene = document.getElementById('nightScene');
      const bodyRoot = document.getElementById('bodyRoot');

      function applyTheme(th) {
        state.theme = th;
        saveState();
        if (th === 'light') {
          bodyRoot.classList.remove('bg-darkbg', 'dark');
          bodyRoot.classList.add('bg-slate-100', 'text-slate-900', 'light');
          if (themeKnob) themeKnob.style.transform = 'translateX(0px)';
          if (dayScene) dayScene.style.opacity = '1';
          if (nightScene) nightScene.style.opacity = '0';
        } else {
          bodyRoot.classList.remove('bg-slate-100', 'text-slate-900', 'light');
          bodyRoot.classList.add('bg-darkbg', 'text-slate-100', 'dark');
          if (themeKnob) themeKnob.style.transform = 'translateX(48px)';
          if (dayScene) dayScene.style.opacity = '0';
          if (nightScene) nightScene.style.opacity = '1';
        }
      }

      if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
          applyTheme(state.theme === 'dark' ? 'light' : 'dark');
        });
      }
      applyTheme(state.theme);

      // --- UNIFIED SEARCH & GOOGLE LENS DROPDOWN SYSTEM ---
      const searchForm = document.getElementById('searchForm');
      const searchInput = document.getElementById('searchInput');
      const searchUnifiedCard = document.getElementById('searchUnifiedCard');
      const searchHistorySection = document.getElementById('searchHistorySection');
      const searchHistoryList = document.getElementById('searchHistoryList');
      const clearSearchHistoryBtn = document.getElementById('clearSearchHistoryBtn');
      const lensBtn = document.getElementById('lensBtn');
      const googleLensDropdownSection = document.getElementById('googleLensDropdownSection');
      const closeLensDropdownBtn = document.getElementById('closeLensDropdownBtn');
      const lensDropdownDropZone = document.getElementById('lensDropdownDropZone');
      const lensDropdownFileInput = document.getElementById('lensDropdownFileInput');
      const lensDropdownUrlForm = document.getElementById('lensDropdownUrlForm');
      const lensDropdownUrlInput = document.getElementById('lensDropdownUrlInput');
      const aiModeBtn = document.getElementById('aiModeBtn');
      const aiResponsePanel = document.getElementById('aiResponsePanel');
      const closeAiPanelBtn = document.getElementById('closeAiPanelBtn');
      const aiResponseContent = document.getElementById('aiResponseContent');
      
      let isAiMode = false;
      let isHistoryOpen = false;
      let isLensOpen = false;

      const searchEngines = {
        google: 'https://www.google.com/search?q=',
        duckduckgo: 'https://duckduckgo.com/?q=',
        bing: 'https://www.bing.com/search?q=',
        brave: 'https://search.brave.com/search?q='
      };

      // Authentic searches matching user's reference screenshot
      const defaultSearchHistory = [
        'hello - Google Search',
        'hi',
        'google image link',
        'gooogle image link',
        'rahul',
        'chrome icon',
        'what is bac',
        'welcome to our channel'
      ];

      function loadSearchHistory() {
        try {
          const saved = localStorage.getItem('chromenewtab_search_history');
          if (saved !== null) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) return parsed;
          }
        } catch (e) {}
        return defaultSearchHistory.slice();
      }

      let searchHistory = loadSearchHistory();

      function saveSearchHistory() {
        try {
          localStorage.setItem('chromenewtab_search_history', JSON.stringify(searchHistory));
        } catch (e) {}
        try {
          if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({ chromenewtab_search_history: searchHistory });
          }
        } catch (e) {}
      }

      // Sync extension storage on startup
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['chromenewtab_search_history'], (res) => {
          if (res && Array.isArray(res.chromenewtab_search_history)) {
            searchHistory = res.chromenewtab_search_history;
            try {
              localStorage.setItem('chromenewtab_search_history', JSON.stringify(searchHistory));
            } catch (err) {}
            if (isHistoryOpen) {
              renderSearchHistory(searchInput ? searchInput.value : '');
            }
          }
        });
      }

      function addSearchHistoryItem(query) {
        const trimmed = query.trim();
        if (!trimmed) return;
        searchHistory = searchHistory.filter(q => q.toLowerCase() !== trimmed.toLowerCase());
        searchHistory.unshift(trimmed);
        if (searchHistory.length > 25) searchHistory = searchHistory.slice(0, 25);
        saveSearchHistory();
      }

      function removeSearchHistoryItem(query) {
        searchHistory = searchHistory.filter(q => q !== query);
        saveSearchHistory();
        renderSearchHistory(searchInput ? searchInput.value : '');
        showToast('Removed from history', '🗑');
      }

      function clearAllSearchHistory() {
        searchHistory = [];
        saveSearchHistory();
        renderSearchHistory();
        showToast('Search history cleared', '✨');
      }

      function executeSearch(query) {
        if (!query) return;
        addSearchHistoryItem(query);
        collapseAllDropdowns();
        const base = searchEngines[state.searchEngine] || searchEngines.google;
        window.location.href = base + encodeURIComponent(query);
      }

      // --- DROPDOWN CONTROL FUNCTIONS (Guaranteed Inline + Class Easing) ---
      function openSearchHistoryDropdown() {
        if (isAiMode) return;
        isHistoryOpen = true;
        closeLensDropdown();

        const currentVal = searchInput ? searchInput.value.trim() : '';
        if (currentVal) {
          fetchAndRenderSuggestions(currentVal);
        } else {
          renderSearchHistory('');
        }

        if (searchUnifiedCard) {
          searchUnifiedCard.classList.add('expanded');
        }
        if (searchHistorySection) {
          searchHistorySection.classList.remove('hidden');
          searchHistorySection.classList.add('active', 'expanded');
          searchHistorySection.style.pointerEvents = 'auto';
        }
      }

      function closeSearchHistoryDropdown() {
        isHistoryOpen = false;
        activeSuggestIndex = -1;
        if (searchHistorySection) {
          searchHistorySection.classList.remove('active', 'expanded');
          searchHistorySection.style.pointerEvents = 'none';
          setTimeout(() => {
            if (!isHistoryOpen && searchHistorySection) {
              searchHistorySection.classList.add('hidden');
            }
          }, 320);
        }
        if (!isLensOpen && searchUnifiedCard) {
          searchUnifiedCard.classList.remove('expanded');
        }
      }

      function openLensDropdown() {
        isLensOpen = true;
        closeSearchHistoryDropdown();

        if (searchUnifiedCard) {
          searchUnifiedCard.classList.add('expanded');
        }
        if (googleLensDropdownSection) {
          googleLensDropdownSection.classList.remove('hidden');
          googleLensDropdownSection.classList.add('active', 'expanded');
          googleLensDropdownSection.style.display = 'block';
          googleLensDropdownSection.style.maxHeight = '560px';
          googleLensDropdownSection.style.opacity = '1';
          googleLensDropdownSection.style.pointerEvents = 'auto';
        }
        if (lensDropdownUrlInput) {
          setTimeout(() => lensDropdownUrlInput.focus(), 150);
        }
      }

      function closeLensDropdown() {
        isLensOpen = false;
        if (googleLensDropdownSection) {
          googleLensDropdownSection.classList.remove('active', 'expanded');
          googleLensDropdownSection.style.maxHeight = '0px';
          googleLensDropdownSection.style.opacity = '0';
          googleLensDropdownSection.style.pointerEvents = 'none';
          setTimeout(() => {
            if (!isLensOpen && googleLensDropdownSection) {
              googleLensDropdownSection.style.display = 'none';
              googleLensDropdownSection.classList.add('hidden');
            }
          }, 350);
        }
        if (!isHistoryOpen && searchUnifiedCard) {
          searchUnifiedCard.classList.remove('expanded');
        }
      }

      function collapseAllDropdowns() {
        closeSearchHistoryDropdown();
        closeLensDropdown();
      }

      // --- SEARCH BAR CLICK & FOCUS LISTENERS ---
      
      // Click anywhere on search input or form opens the search history dropdown smoothly
      if (searchInput) {
        searchInput.addEventListener('focus', (e) => {
          e.stopPropagation();
          openSearchHistoryDropdown();
        });
        searchInput.addEventListener('click', (e) => {
          e.stopPropagation();
          openSearchHistoryDropdown();
        });
        searchInput.addEventListener('input', (e) => {
          e.stopPropagation();
          openSearchHistoryDropdown();
          const val = searchInput.value.trim();
          clearTimeout(searchSuggestTimer);
          if (!val) {
            renderSearchHistory('');
            return;
          }
          searchSuggestTimer = setTimeout(() => {
            fetchAndRenderSuggestions(val);
          }, 120);
        });
        searchInput.addEventListener('keydown', (e) => {
          if (!searchHistoryList || !isHistoryOpen) return;
          const items = searchHistoryList.querySelectorAll('.search-history-item');
          if (!items || items.length === 0) return;

          if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeSuggestIndex = (activeSuggestIndex + 1) % items.length;
            updateActiveSuggestHighlight(items);
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeSuggestIndex = (activeSuggestIndex - 1 + items.length) % items.length;
            updateActiveSuggestHighlight(items);
          } else if (e.key === 'Enter') {
            if (activeSuggestIndex >= 0 && activeSuggestIndex < items.length) {
              e.preventDefault();
              const q = items[activeSuggestIndex].getAttribute('data-query');
              if (q) {
                searchInput.value = q;
                executeSearch(q);
              }
            }
          }
        });
      }

      if (searchForm) {
        searchForm.addEventListener('click', (e) => {
          if (e.target.closest('#lensBtn') || e.target.closest('#micBtn') || e.target.closest('#aiModeBtn')) return;
          e.stopPropagation();
          if (searchInput) searchInput.focus();
          openSearchHistoryDropdown();
        });
      }

        

      const searchIconSpan = document.getElementById('searchIconSpan');
      if (searchIconSpan) {
        searchIconSpan.addEventListener('click', (e) => {
          e.stopPropagation();
          if (searchInput) searchInput.focus();
          openSearchHistoryDropdown();
        });
      }

      // --- VOICE SEARCH (SPEECH RECOGNITION VIA WEB SPEECH API) ---
      const micBtn = document.getElementById('micBtn');
      const micPulse = document.getElementById('micPulse');
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      let voiceRecognition = null;
      let isListening = false;

      function stopVoiceSearch() {
        isListening = false;
        if (micPulse) micPulse.classList.add('hidden');
        if (micBtn) micBtn.classList.remove('mic-active');
        if (searchInput && searchInput.placeholder === 'Listening... Speak now 🎙️') {
          searchInput.placeholder = isAiMode ? 'Ask AI anything...' : 'Ask Google or type a URL';
        }
      }

      function initVoiceSearch() {
        if (!SpeechRecognition) return null;
        try {
          const rec = new SpeechRecognition();
          rec.continuous = false;
          rec.interimResults = true;
          rec.lang = navigator.language || 'en-US';
          rec.maxAlternatives = 1;

          rec.onstart = () => {
            isListening = true;
            if (micPulse) micPulse.classList.remove('hidden');
            if (micBtn) micBtn.classList.add('mic-active');
            if (searchInput) {
              searchInput.placeholder = 'Listening... Speak now 🎙️';
            }
          };

          rec.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
              } else {
                interimTranscript += event.results[i][0].transcript;
              }
            }

            const captured = (finalTranscript || interimTranscript).trim();
            if (searchInput && captured) {
              searchInput.value = captured;
            }

            if (finalTranscript.trim()) {
              showToast('Searching: ' + finalTranscript.trim(), '🎙️');
              stopVoiceSearch();
              setTimeout(() => {
                executeSearch(finalTranscript.trim());
              }, 450);
            }
          };

          rec.onerror = (event) => {
            console.warn('Voice search error:', event.error);
            stopVoiceSearch();
            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
              showToast('Microphone access blocked. Please allow mic in browser settings.', '⚠️');
            } else if (event.error === 'no-speech') {
              showToast('No speech detected. Please try again.', '🎙️');
            } else if (event.error === 'network') {
              showToast('Network error during voice recognition.', '⚠️');
            } else if (event.error !== 'aborted') {
              showToast('Voice search: ' + (event.error || 'error'), '⚠️');
            }
          };

          rec.onend = () => {
            stopVoiceSearch();
          };

          return rec;
        } catch (err) {
          console.warn('Could not initialize SpeechRecognition:', err);
          return null;
        }
      }

      if (micBtn) {
        micBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();

          if (isListening) {
            if (voiceRecognition) {
              try { voiceRecognition.stop(); } catch (err) {}
            }
            stopVoiceSearch();
            showToast('Voice search stopped', '⏹');
            return;
          }

          if (!SpeechRecognition) {
            showToast('Voice search not supported in this browser. Opening Google...', '🎙️');
            window.open('https://www.google.com/search?q=', '_blank');
            return;
          }

          if (!voiceRecognition) {
            voiceRecognition = initVoiceSearch();
          }

          if (!voiceRecognition) {
            showToast('Unable to start microphone.', '⚠️');
            return;
          }

          try {
            collapseAllDropdowns();
            if (searchInput) {
              searchInput.value = '';
              searchInput.placeholder = 'Listening... Speak now 🎙️';
            }
            if (micPulse) micPulse.classList.remove('hidden');
            if (micBtn) micBtn.classList.add('mic-active');
            isListening = true;
            showToast('Listening... Speak now 🎙️', '🎙️');
            voiceRecognition.start();
          } catch (err) {
            console.warn('Error starting speech recognition:', err);
            try {
              voiceRecognition.abort();
              setTimeout(() => {
                try {
                  voiceRecognition.start();
                  isListening = true;
                } catch (e2) {
                  stopVoiceSearch();
                }
              }, 120);
            } catch (abortErr) {
              stopVoiceSearch();
            }
          }
        });
      }

      // Google Lens Button: Opens the Lens dropdown in place!
      if (lensBtn) {
        lensBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (isLensOpen) {
            closeLensDropdown();
          } else {
            openLensDropdown();
          }
        });
      }

      if (closeLensDropdownBtn) {
        closeLensDropdownBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          closeLensDropdown();
        });
      }

      // Google Lens Dropdown: File Drag & Drop
      if (lensDropdownDropZone && lensDropdownFileInput) {
        lensDropdownDropZone.addEventListener('click', (e) => {
          e.stopPropagation();
          lensDropdownFileInput.click();
        });

        lensDropdownDropZone.addEventListener('dragover', (e) => {
          e.preventDefault();
          e.stopPropagation();
          lensDropdownDropZone.classList.add('border-[#83F9FF]', 'bg-white/10');
        });

        lensDropdownDropZone.addEventListener('dragleave', (e) => {
          e.preventDefault();
          e.stopPropagation();
          lensDropdownDropZone.classList.remove('border-[#83F9FF]', 'bg-white/10');
        });

        lensDropdownDropZone.addEventListener('drop', (e) => {
          e.preventDefault();
          e.stopPropagation();
          lensDropdownDropZone.classList.remove('border-[#83F9FF]', 'bg-white/10');
          const files = e.dataTransfer.files;
          if (files && files.length > 0) {
            handleLensFile(files[0]);
          }
        });

        lensDropdownFileInput.addEventListener('change', (e) => {
          const files = e.target.files;
          if (files && files.length > 0) {
            handleLensFile(files[0]);
          }
        });
      }

      function handleLensFile(file) {
        showToast('Searching image with Google Lens 🔍', '✨');
        closeLensDropdown();
        if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
          chrome.tabs.create({ url: 'https://lens.google.com/' });
        } else {
          window.location.href = 'https://lens.google.com/';
        }
      }

      // Google Lens Dropdown: URL Search Form
      if (lensDropdownUrlForm && lensDropdownUrlInput) {
        lensDropdownUrlForm.addEventListener('submit', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const url = lensDropdownUrlInput.value.trim();
          if (!url) return;
          closeLensDropdown();
          showToast('Searching image with Google Lens 🔍', '✨');
          if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
            chrome.tabs.create({ url: 'https://lens.google.com/uploadbyurl?url=' + encodeURIComponent(url) });
          } else {
            window.open('https://lens.google.com/uploadbyurl?url=' + encodeURIComponent(url), '_blank');
          }
        });
      }

      // Global Outside Click & Escape Handlers
      document.addEventListener('click', (e) => {
        if (searchUnifiedCard && !searchUnifiedCard.contains(e.target)) {
          collapseAllDropdowns();
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          collapseAllDropdowns();
          if (searchInput) searchInput.blur();
        }
      });

      // --- GOOGLE SEARCH SUGGESTIONS & KEYBOARD ARROW NAVIGATION ---
      let searchSuggestTimer = null;
      let activeSuggestIndex = -1;
      let currentSuggestAbort = null;

      const popularGoogleFallback = [
        'google', 'google translate', 'google maps', 'google drive', 'google flights', 'google sheets', 'google docs', 'google photos',
        'youtube', 'youtube music', 'youtube studio',
        'chatgpt', 'chatgpt login', 'claude ai', 'gemini ai', 'perplexity ai',
        'github', 'gmail', 'gmail login', 'amazon', 'reddit', 'twitter', 'netflix', 'spotify',
        'weather today', 'speed test', 'calculator', 'canva', 'figma', 'notion', 'whatsapp web',
        'facebook', 'instagram', 'linkedin', 'pinterest', 'wikipedia'
      ];

      function getSmartFallbackSuggestions(query) {
        const q = query.toLowerCase().trim();
        const results = [];
        
        // 1. Check matching past search history
        searchHistory.forEach(h => {
          if (h.toLowerCase().includes(q) && !results.includes(h)) {
            results.push(h);
          }
        });

        // 2. Check popular common search queries
        popularGoogleFallback.forEach(p => {
          if (p.toLowerCase().startsWith(q) && !results.includes(p)) {
            results.push(p);
          }
        });

        // 3. Dynamic contextual search suffixes
        const suffixes = [' login', ' download', ' app', ' online', ' tutorial', ' website'];
        for (let i = 0; i < suffixes.length; i++) {
          const cand = q + suffixes[i];
          if (!results.includes(cand) && results.length < 8) {
            results.push(cand);
          }
        }

        return results.slice(0, 8);
      }

      async function fetchGoogleSuggestions(query) {
        if (!query) return [];
        const trimmed = query.trim();
        if (currentSuggestAbort) {
          try { currentSuggestAbort.abort(); } catch (e) {}
        }
        currentSuggestAbort = new AbortController();

        try {
          const url = 'https://suggestqueries.google.com/complete/search?client=firefox&q=' + encodeURIComponent(trimmed);
          const response = await fetch(url, { signal: currentSuggestAbort.signal });
          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && Array.isArray(data[1]) && data[1].length > 0) {
              return data[1];
            }
          }
        } catch (err) {
          if (err && err.name === 'AbortError') return [];
        }

        return getSmartFallbackSuggestions(trimmed);
      }

      function updateActiveSuggestHighlight(items) {
        items.forEach((item, idx) => {
          if (idx === activeSuggestIndex) {
            item.classList.add('active-suggest');
            const q = item.getAttribute('data-query');
            if (q && searchInput) searchInput.value = q;
          } else {
            item.classList.remove('active-suggest');
          }
        });
      }

      async function fetchAndRenderSuggestions(query) {
        const suggestions = await fetchGoogleSuggestions(query);
        renderSearchSuggestions(query, suggestions);
      }

      function renderSearchSuggestions(query, suggestions) {
        if (!searchHistoryList) return;
        searchHistoryList.innerHTML = '';
        activeSuggestIndex = -1;

        const footerStatus = document.getElementById('searchFooterStatus');
        const clearBtn = document.getElementById('clearSearchHistoryBtn');

        if (footerStatus) {
          footerStatus.innerHTML = 
            '<svg class="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">' +
              '<path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>' +
              '<path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>' +
              '<path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>' +
              '<path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>' +
            '</svg>' +
            '<span class="text-slate-300 font-medium">Google Suggestions</span>';
        }
        if (clearBtn) {
          clearBtn.style.display = 'inline';
          clearBtn.textContent = '↵ to search';
          clearBtn.className = 'text-[#83F9FF] font-mono text-[10px] tracking-wide pointer-events-none opacity-80';
        }

        // 1. Direct Search Option on Top
        const directEl = document.createElement('div');
        directEl.className = 'search-history-item group flex items-center justify-between px-5 py-2.5 rounded-2xl text-slate-200 hover:text-white transition-all cursor-pointer';
        directEl.setAttribute('data-query', query);
        directEl.innerHTML = 
          '<div class="flex items-center space-x-3.5 overflow-hidden flex-1 mr-2">' +
            '<svg class="w-4.5 h-4.5 text-[#83F9FF] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
              '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>' +
            '</svg>' +
            '<span class="truncate text-sm font-medium text-white">' + escapeHtml(query) + '</span>' +
          '</div>' +
          '<span class="text-xs text-slate-400 font-mono group-hover:text-[#83F9FF] shrink-0">↵ Search</span>';

        directEl.addEventListener('click', (e) => {
          e.stopPropagation();
          executeSearch(query);
        });
        searchHistoryList.appendChild(directEl);

        // 2. Google Suggestions Items
        const cleanTyped = query.toLowerCase();
        const displayList = suggestions.filter(s => s.toLowerCase() !== cleanTyped).slice(0, 7);

        displayList.forEach(sugText => {
          const itemEl = document.createElement('div');
          itemEl.className = 'search-history-item group flex items-center justify-between px-5 py-2.5 rounded-2xl text-slate-200 hover:text-white transition-all cursor-pointer';
          itemEl.setAttribute('data-query', sugText);

          const isHistory = searchHistory.some(h => h.toLowerCase() === sugText.toLowerCase());

          let iconHtml = '';
          if (isHistory) {
            iconHtml = 
              '<svg class="w-4.5 h-4.5 text-slate-400 group-hover:text-[#83F9FF] shrink-0 transition-colors" viewBox="0 0 24 24" fill="currentColor">' +
                '<path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>' +
              '</svg>';
          } else {
            iconHtml = 
              '<svg class="w-4.5 h-4.5 text-slate-400 group-hover:text-[#83F9FF] shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
                '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>' +
              '</svg>';
          }

          let labelHtml = '';
          const lowerSug = sugText.toLowerCase();
          if (lowerSug.startsWith(cleanTyped)) {
            const matched = sugText.slice(0, query.length);
            const remainder = sugText.slice(query.length);
            labelHtml = '<span class="text-slate-300 font-normal">' + escapeHtml(matched) + '</span><span class="text-white font-semibold">' + escapeHtml(remainder) + '</span>';
          } else {
            labelHtml = '<span class="text-slate-200 font-medium group-hover:text-white">' + escapeHtml(sugText) + '</span>';
          }

          let rightAction = '';
          if (isHistory) {
            rightAction = 
              '<button type="button" class="remove-history-btn opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-400 rounded-lg hover:bg-white/10 transition-all shrink-0 cursor-pointer" title="Delete from history">' +
                '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
                  '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>' +
                '</svg>' +
              '</button>';
          } else {
            rightAction = 
              '<svg class="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 transform -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
                '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>' +
              '</svg>';
          }

          itemEl.innerHTML = 
            '<div class="flex items-center space-x-3.5 overflow-hidden flex-1 mr-2">' +
              iconHtml +
              '<span class="truncate text-sm transition-all">' + labelHtml + '</span>' +
            '</div>' +
            rightAction;

          itemEl.addEventListener('click', (e) => {
            if (e.target.closest('.remove-history-btn')) return;
            searchInput.value = sugText;
            executeSearch(sugText);
          });

          const removeBtn = itemEl.querySelector('.remove-history-btn');
          if (removeBtn) {
            removeBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              removeSearchHistoryItem(sugText);
            });
          }

          searchHistoryList.appendChild(itemEl);
        });
      }

      function renderSearchHistory(filterText = '') {
        if (!searchHistoryList) return;
        searchHistoryList.innerHTML = '';
        activeSuggestIndex = -1;

        const footerStatus = document.getElementById('searchFooterStatus');
        const clearBtn = document.getElementById('clearSearchHistoryBtn');

        if (footerStatus) {
          footerStatus.innerHTML = '<span>🕒</span><span>Recent searches</span>';
        }
        if (clearBtn) {
          clearBtn.style.display = searchHistory.length > 0 ? 'inline' : 'none';
          clearBtn.textContent = 'Clear history';
          clearBtn.className = 'hover:text-red-400 transition-colors cursor-pointer font-medium';
        }

        const toShow = searchHistory.slice(0, 8);
        if (toShow.length === 0) {
          searchHistoryList.innerHTML = '<div class="px-5 py-4 text-center text-slate-400 text-xs italic">No recent searches</div>';
          return;
        }

        toShow.forEach(query => {
          const itemEl = document.createElement('div');
          itemEl.className = 'search-history-item group flex items-center justify-between px-5 py-2.5 rounded-2xl text-slate-200 hover:text-white transition-all cursor-pointer';
          itemEl.setAttribute('data-query', query);

          itemEl.innerHTML = 
            '<div class="flex items-center space-x-3.5 overflow-hidden flex-1 mr-2">' +
              '<svg class="w-4.5 h-4.5 text-slate-400 group-hover:text-[#83F9FF] shrink-0 transition-colors" viewBox="0 0 24 24" fill="currentColor">' +
                '<path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>' +
              '</svg>' +
              '<span class="truncate text-sm font-normal group-hover:font-medium text-slate-200 group-hover:text-white transition-all">' + escapeHtml(query) + '</span>' +
            '</div>' +
            '<button type="button" class="remove-history-btn opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-400 rounded-lg hover:bg-white/10 transition-all shrink-0 cursor-pointer" title="Delete from history">' +
              '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
                '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>' +
              '</svg>' +
            '</button>';

          itemEl.addEventListener('click', (e) => {
            if (e.target.closest('.remove-history-btn')) return;
            searchInput.value = query;
            executeSearch(query);
          });

          const removeBtn = itemEl.querySelector('.remove-history-btn');
          if (removeBtn) {
            removeBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              removeSearchHistoryItem(query);
            });
          }

          searchHistoryList.appendChild(itemEl);
        });
      }
      if (clearSearchHistoryBtn) {
        clearSearchHistoryBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          clearAllSearchHistory();
        });
      }

      if (aiModeBtn && aiResponsePanel) {
        aiModeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          isAiMode = !isAiMode;
          if (isAiMode) {
            aiModeBtn.classList.add('bg-[#1B54FF]', 'text-white', 'border-[#83F9FF]', 'ai-mode-active');
            aiModeBtn.classList.remove('bg-[#1B54FF]/25', 'text-[#83F9FF]');
            aiResponsePanel.classList.remove('hidden');
            collapseAllDropdowns();
            if (searchInput) {
              searchInput.placeholder = 'Ask AI anything...';
              searchInput.focus();
            }
          } else {
            aiModeBtn.classList.remove('bg-[#1B54FF]', 'text-white', 'border-[#83F9FF]', 'ai-mode-active');
            aiModeBtn.classList.add('bg-[#1B54FF]/25', 'text-[#83F9FF]');
            aiResponsePanel.classList.add('hidden');
            if (searchInput) searchInput.placeholder = 'Ask Google or type a URL';
          }
        });
      }

      if (closeAiPanelBtn && aiResponsePanel) {
        closeAiPanelBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          isAiMode = false;
          aiModeBtn.classList.remove('bg-[#1B54FF]', 'text-white', 'border-[#83F9FF]', 'ai-mode-active');
          aiModeBtn.classList.add('bg-[#1B54FF]/25', 'text-[#83F9FF]');
          aiResponsePanel.classList.add('hidden');
          if (searchInput) searchInput.placeholder = 'Ask Google or type a URL';
        });
      }

      if (searchForm && searchInput) {
        searchForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const query = searchInput.value.trim();
          if (!query) return;

          collapseAllDropdowns();

          if (isAiMode) {
            if (aiResponseContent) {
              aiResponseContent.innerHTML = 'Analyzing: <strong>"' + escapeHtml(query) + '"</strong>...<br><br>' +
                'Quick overview for "<em>' + escapeHtml(query) + '</em>": ' +
                'Explore the fast summary below or launch directly in Gemini or ChatGPT.';
            }
            return;
          }

          executeSearch(query);
        });
      }

      
      // Folder dropdown click handlers for bookmarks bar
      document.querySelectorAll('.folder-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const folder = btn.getAttribute('data-folder');
          const dropdown = document.getElementById('dropdown-' + folder);
          if (!dropdown) return;
          const wasActive = dropdown.classList.contains('active');
          document.querySelectorAll('.folder-dropdown').forEach(d => {
            d.classList.remove('active');
            d.style.display = 'none';
          });
          if (!wasActive) {
            dropdown.classList.add('active');
            dropdown.style.display = 'block';
          }
        });
      });

      // Close bookmark dropdowns on outside click
      document.addEventListener('click', () => {
        document.querySelectorAll('.folder-dropdown').forEach(dd => {
          dd.classList.remove('active');
          dd.style.display = 'none';
        });
      });

      const allBookmarksBtn = document.getElementById('allBookmarksBtn');
      if (allBookmarksBtn) {
        allBookmarksBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
            chrome.tabs.create({ url: 'chrome://bookmarks' });
          } else {
            window.open('chrome://bookmarks', '_blank');
          }
        });
      }

      const chromeAppsBtn = document.getElementById('chromeAppsBtn');
      const googleAppsDropdown = document.getElementById('dropdown-chrome-apps');
      if (chromeAppsBtn && googleAppsDropdown) {
        chromeAppsBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const wasActive = googleAppsDropdown.classList.contains('active');
          document.querySelectorAll('.folder-dropdown').forEach(d => {
            d.classList.remove('active');
            d.style.display = 'none';
          });
          if (!wasActive) {
            googleAppsDropdown.classList.add('active');
            googleAppsDropdown.style.display = 'block';
          }
        });
        googleAppsDropdown.addEventListener('click', (e) => {
          if (!e.target.closest('a')) {
            e.stopPropagation();
          }
        });
      }

      // --- CHROME SHORTCUTS MANAGER (Drag & Drop Reordering, Real Favicon Logos, Edit & Delete) ---
      const defaultShortcuts = [
        { id: 'sc-1', name: 'ChatGPT', url: 'https://chatgpt.com' },
        { id: 'sc-2', name: 'Gemini', url: 'https://gemini.google.com' },
        { id: 'sc-3', name: 'Claude', url: 'https://claude.ai' },
        { id: 'sc-4', name: 'YouTube', url: 'https://youtube.com' },
        { id: 'sc-5', name: 'Pinterest', url: 'https://pinterest.com' },
        { id: 'sc-6', name: 'Canva', url: 'https://canva.com' },
        { id: 'sc-7', name: 'GitHub', url: 'https://github.com' },
        { id: 'sc-8', name: 'Reddit', url: 'https://reddit.com' },
        { id: 'sc-9', name: 'Notion', url: 'https://notion.so' },
        { id: 'sc-10', name: 'Spotify', url: 'https://spotify.com' },
        { id: 'sc-11', name: 'Figma', url: 'https://figma.com' },
        { id: 'sc-12', name: 'LinkedIn', url: 'https://linkedin.com' }
      ];

      function loadStoredShortcuts() {
        try {
          const raw = localStorage.getItem('chromenewtab_shortcuts');
          if (raw !== null) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              return parsed;
            }
          }
        } catch (e) {}
        return defaultShortcuts.slice();
      }

      state.shortcuts = loadStoredShortcuts();

      function saveShortcuts() {
        try {
          localStorage.setItem('chromenewtab_shortcuts', JSON.stringify(state.shortcuts));
        } catch (e) {}
        try {
          if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({ chromenewtab_shortcuts: state.shortcuts });
          }
        } catch (e) {}
      }

      // Sync extension storage on startup
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['chromenewtab_shortcuts'], (res) => {
          if (res && Array.isArray(res.chromenewtab_shortcuts)) {
            state.shortcuts = res.chromenewtab_shortcuts;
            try {
              localStorage.setItem('chromenewtab_shortcuts', JSON.stringify(state.shortcuts));
            } catch (err) {}
            renderShortcuts();
          }
        });
      }

      const shortcutsContainer = document.getElementById('shortcutsContainer');
      const addShortcutModal = document.getElementById('addShortcutModal');
      const shortcutModalTitleText = document.getElementById('shortcutModalTitleText');
      const closeAddShortcutModalBtn = document.getElementById('closeAddShortcutModalBtn');
      const cancelShortcutBtn = document.getElementById('cancelShortcutBtn');
      const saveShortcutBtn = document.getElementById('saveShortcutBtn');
      const shortcutNameInput = document.getElementById('shortcutNameInput');
      const shortcutUrlInput = document.getElementById('shortcutUrlInput');
      let isShowMoreOpen = false;
      let editingShortcutId = null;
      let draggedIndex = null;

      function renderShortcuts() {
        const shortcutsContainer = document.getElementById('shortcutsContainer');
        const extendedShortcutsRow = document.getElementById('extendedShortcutsRow');
        if (!shortcutsContainer) return;
        shortcutsContainer.innerHTML = '';
        if (extendedShortcutsRow) extendedShortcutsRow.innerHTML = '';

        const primaryCount = 6;
        const primaryItems = state.shortcuts.slice(0, primaryCount);
        const secondaryItems = state.shortcuts.slice(primaryCount);

        function createTile(sc, index) {
          const domain = getDomain(sc.url) || 'google.com';
          const faviconUrl = 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(domain) + '&sz=64';
          const firstChar = (sc.name || domain || 'W').charAt(0).toUpperCase();

          const tile = document.createElement('div');
          tile.className = 'shortcut-tile group relative flex flex-col items-center w-18 md:w-20 cursor-grab select-none';
          tile.setAttribute('draggable', 'true');
          tile.setAttribute('data-id', sc.id);
          tile.setAttribute('data-index', String(index));

          tile.innerHTML = 
            '<a href="' + escapeHtml(sc.url) + '" target="_blank" class="shortcut-link flex flex-col items-center group w-full text-center focus:outline-none" title="' + escapeHtml(sc.name) + ' (' + escapeHtml(sc.url) + ')">' +
              '<div class="shortcut-icon-circle w-12 h-12 md:w-13 md:h-13 rounded-full flex items-center justify-center p-2.5 shadow-md relative">' +
                '<img src="' + faviconUrl + '" class="w-6 h-6 md:w-6.5 md:h-6.5 object-contain rounded-sm" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'flex\';" alt="">' +
                '<div style="display:none;" class="w-full h-full rounded-full bg-gradient-to-tr from-[#1B54FF] to-[#83F9FF] text-white font-bold text-sm items-center justify-center">' + firstChar + '</div>' +
              '</div>' +
              '<span class="shortcut-label text-[11px] md:text-xs text-slate-300 font-medium mt-2 truncate max-w-[76px] text-center group-hover:text-white transition-colors">' + escapeHtml(sc.name) + '</span>' +
            '</a>' +
            '<div class="shortcut-context-menu hidden absolute top-6 left-1/2 -translate-x-1/2 z-50 w-40 glass-card rounded-2xl p-1.5 shadow-2xl text-xs space-y-1">' +
              '<button type="button" class="w-full text-left px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 flex items-center space-x-2.5 transition-all edit-btn cursor-pointer">' +
                '<svg class="w-3.5 h-3.5 text-[#83F9FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
                  '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>' +
                '</svg>' +
                '<span class="font-medium text-[13px]">Edit shortcut</span>' +
              '</button>' +
              '<button type="button" class="w-full text-left px-3 py-2 rounded-xl text-slate-300 hover:text-red-300 hover:bg-red-500/15 flex items-center space-x-2.5 transition-all delete-btn cursor-pointer">' +
                '<svg class="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
                  '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>' +
                '</svg>' +
                '<span class="font-medium text-[13px]">Remove</span>' +
              '</button>' +
            '</div>';

          // Drag and Drop
          tile.addEventListener('dragstart', (e) => {
            draggedIndex = index;
            tile.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', String(index));
          });
          tile.addEventListener('dragend', () => {
            tile.classList.remove('dragging');
            document.querySelectorAll('.shortcut-tile').forEach(t => t.classList.remove('drag-over'));
          });
          tile.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            tile.classList.add('drag-over');
          });
          tile.addEventListener('dragleave', () => {
            tile.classList.remove('drag-over');
          });
          tile.addEventListener('drop', (e) => {
            e.preventDefault();
            tile.classList.remove('drag-over');
            const targetIndex = index;
            if (draggedIndex !== null && draggedIndex !== targetIndex) {
              const movedItem = state.shortcuts.splice(draggedIndex, 1)[0];
              state.shortcuts.splice(targetIndex, 0, movedItem);
              saveShortcuts();
              renderShortcuts();
              showToast('Reordered shortcut: ' + movedItem.name, '✨');
            }
          });

          // Context Menu matching theme
          const menuBtn = tile.querySelector('.shortcut-menu-btn');
          const contextMenu = tile.querySelector('.shortcut-context-menu');

          function toggleContextMenu(e) {
            e.preventDefault();
            e.stopPropagation();
            const wasActive = !contextMenu.classList.contains('hidden');
            document.querySelectorAll('.shortcut-context-menu').forEach(m => m.classList.add('hidden'));
            if (!wasActive) contextMenu.classList.remove('hidden');
          }

          // Right-click on shortcut opens the context menu
          tile.addEventListener('contextmenu', toggleContextMenu);

          // Clicking three-dot menu button also toggles this context menu
          if (menuBtn) {
            menuBtn.addEventListener('mousedown', (e) => e.stopPropagation());
            menuBtn.addEventListener('click', toggleContextMenu);
          }
          if (contextMenu) {
            contextMenu.addEventListener('mousedown', (e) => e.stopPropagation());
          }

          if (contextMenu) {
            const editBtn = contextMenu.querySelector('.edit-btn');
            if (editBtn) {
              editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                contextMenu.classList.add('hidden');
                openShortcutModal(sc);
              });
            }
            const deleteBtn = contextMenu.querySelector('.delete-btn');
            if (deleteBtn) {
              deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                contextMenu.classList.add('hidden');
                state.shortcuts = state.shortcuts.filter(s => s.id !== sc.id);
                saveShortcuts();
                renderShortcuts();
                showToast('Removed shortcut: ' + sc.name, '🗑');
              });
            }
          }
          return tile;
        }

        // Render Primary items (up to 6)
        primaryItems.forEach((sc, i) => {
          shortcutsContainer.appendChild(createTile(sc, i));
        });

        // 7th Item in Primary Row: "Show More" Button
        const showMoreBtn = document.createElement('button');
        showMoreBtn.type = 'button';
        showMoreBtn.id = 'showMoreShortcutsBtn';
        showMoreBtn.className = 'flex flex-col items-center w-20 group focus:outline-none cursor-pointer select-none';

        showMoreBtn.innerHTML = 
          '<div class="w-12 h-12 md:w-13 md:h-13 rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.35)] group-hover:scale-110 transition-all duration-200">' +
            '<svg id="showMoreIcon" class="w-5 h-5 text-slate-300 group-hover:text-[#83F9FF] transition-transform duration-300 ' + (isShowMoreOpen ? 'rotate-45' : '') + '" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
              '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>' +
            '</svg>' +
          '</div>' +
          '<span id="showMoreLabel" class="shortcut-label text-xs text-slate-300 font-medium mt-2.5 truncate max-w-[85px] text-center group-hover:text-white transition-colors">' +
            (isShowMoreOpen ? 'Show less' : 'Show more') +
          '</span>';

        showMoreBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const extRow = document.getElementById('extendedShortcutsRow');
          if (!extRow) return;

          isShowMoreOpen = !isShowMoreOpen;

          if (isShowMoreOpen) {
            extRow.classList.remove('hidden');
            extRow.style.display = 'flex';
            void extRow.offsetHeight; // Force reflow
            extRow.classList.add('expanded');
            extRow.style.maxHeight = '280px';
            extRow.style.opacity = '1';
            extRow.style.pointerEvents = 'auto';
            extRow.setAttribute('data-expanded', 'true');
            const icon = document.getElementById('showMoreIcon');
            const label = document.getElementById('showMoreLabel');
            if (icon) icon.style.transform = 'rotate(45deg)';
            if (label) label.textContent = 'Show less';
          } else {
            extRow.classList.remove('expanded');
            extRow.style.maxHeight = '0px';
            extRow.style.opacity = '0';
            extRow.style.pointerEvents = 'none';
            extRow.setAttribute('data-expanded', 'false');
            const icon = document.getElementById('showMoreIcon');
            const label = document.getElementById('showMoreLabel');
            if (icon) icon.style.transform = 'rotate(0deg)';
            if (label) label.textContent = 'Show more';
            setTimeout(() => {
              if (!isShowMoreOpen && extRow) {
                extRow.style.display = 'none';
                extRow.classList.add('hidden');
              }
            }, 350);
          }
        });

        shortcutsContainer.appendChild(showMoreBtn);

        // Synchronize initial state of extended row
        if (extendedShortcutsRow) {
          if (isShowMoreOpen) {
            extendedShortcutsRow.classList.remove('hidden');
            extendedShortcutsRow.style.display = 'flex';
            extendedShortcutsRow.classList.add('expanded');
            extendedShortcutsRow.setAttribute('data-expanded', 'true');
          } else {
            extendedShortcutsRow.classList.add('hidden');
            extendedShortcutsRow.style.display = 'none';
            extendedShortcutsRow.classList.remove('expanded');
            extendedShortcutsRow.setAttribute('data-expanded', 'false');
          }
        }
        // Render Secondary items + Add Shortcut in extended row
        if (extendedShortcutsRow) {
          secondaryItems.forEach((sc, j) => {
            extendedShortcutsRow.appendChild(createTile(sc, primaryCount + j));
          });

          // "+ Add shortcut" Tile in Extended Row
          const addTile = document.createElement('div');
          addTile.className = 'flex flex-col items-center w-20 select-none';
          addTile.innerHTML = 
            '<button type="button" id="openAddShortcutBtn" class="w-12 h-12 md:w-13 md:h-13 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-dashed border-white/30 hover:border-[#83F9FF]/70 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-md hover:scale-110 group cursor-pointer" title="Add shortcut">' +
              '<svg class="w-6 h-6 text-slate-400 group-hover:text-[#83F9FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">' +
                '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>' +
              '</svg>' +
            '</button>' +
            '<span class="text-xs text-slate-400 font-medium mt-2.5 truncate max-w-[85px] text-center">Add shortcut</span>';

          const openBtn = addTile.querySelector('#openAddShortcutBtn');
          if (openBtn) {
            openBtn.addEventListener('click', () => {
              openShortcutModal(null);
            });
          }
          extendedShortcutsRow.appendChild(addTile);
        }
      }

            // Close shortcut context menus on outside click or outside right-click
      document.addEventListener('click', () => {
        document.querySelectorAll('.shortcut-context-menu').forEach(m => m.classList.add('hidden'));
      });
      document.addEventListener('contextmenu', (e) => {
        if (!e.target.closest('.shortcut-tile')) {
          document.querySelectorAll('.shortcut-context-menu').forEach(m => m.classList.add('hidden'));
        }
      });

      function openShortcutModal(shortcut) {
        if (!addShortcutModal) return;
        editingShortcutId = shortcut ? shortcut.id : null;
        if (shortcutModalTitleText) {
          shortcutModalTitleText.textContent = shortcut ? 'Edit Shortcut' : 'Add Custom Shortcut';
        }
        if (saveShortcutBtn) {
          saveShortcutBtn.textContent = shortcut ? 'Save Changes' : 'Add Shortcut';
        }
        if (shortcutNameInput) {
          shortcutNameInput.value = shortcut ? shortcut.name : '';
        }
        if (shortcutUrlInput) {
          shortcutUrlInput.value = shortcut ? shortcut.url : '';
        }
        addShortcutModal.classList.remove('hidden');
        if (shortcutNameInput) shortcutNameInput.focus();
      }

      function closeShortcutModal() {
        if (addShortcutModal) addShortcutModal.classList.add('hidden');
        editingShortcutId = null;
        if (shortcutNameInput) shortcutNameInput.value = '';
        if (shortcutUrlInput) shortcutUrlInput.value = '';
      }

      if (closeAddShortcutModalBtn) closeAddShortcutModalBtn.addEventListener('click', closeShortcutModal);
      if (cancelShortcutBtn) cancelShortcutBtn.addEventListener('click', closeShortcutModal);

      if (saveShortcutBtn) {
        saveShortcutBtn.addEventListener('click', () => {
          const name = shortcutNameInput ? shortcutNameInput.value.trim() : '';
          let url = shortcutUrlInput ? shortcutUrlInput.value.trim() : '';
          if (!name || !url) {
            showToast('Please enter both name and URL');
            return;
          }
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
          }

          if (editingShortcutId) {
            const sc = state.shortcuts.find(s => s.id === editingShortcutId);
            if (sc) {
              sc.name = name;
              sc.url = url;
              showToast('Updated shortcut: ' + name, '✏️');
            }
          } else {
            state.shortcuts.push({
              id: 'sc-' + Date.now(),
              name: name,
              url: url
            });
            showToast('Added shortcut: ' + name, '🔗');
          }

          saveShortcuts();
          renderShortcuts();
          closeShortcutModal();
        });
      }

      // Initial render of shortcuts
      renderShortcuts();

      function escapeHtml(str) {
        if (!str) return '';
        return String(str)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#039;');
      }

// --- REAL CHROME BOOKMARKS INTEGRATION ---
      function getDomain(url) {
        try {
          return new URL(url).hostname;
        } catch (e) {
          return '';
        }
      }

      function loadChromeBookmarks() {
        if (typeof chrome === 'undefined' || !chrome.bookmarks || !chrome.bookmarks.getTree) return;
        const bookmarksBar = document.getElementById('bookmarksBar');
        if (!bookmarksBar) return;

        chrome.bookmarks.getTree(function(tree) {
          if (!tree || !tree.length) return;
          var root = tree[0];
          if (!root || !root.children) return;

          // Locate Bookmarks bar (id '1' or by title)
          var bar = root.children.find(function(c) { return c.id === '1'; });
          if (!bar) {
            bar = root.children.find(function(c) {
              return c.title && c.title.toLowerCase().indexOf('bookmark') !== -1 && c.title.toLowerCase().indexOf('bar') !== -1;
            });
          }
          if (!bar && root.children.length > 0) {
            bar = root.children[0];
          }

          if (!bar || !bar.children || bar.children.length === 0) return;

          bookmarksBar.innerHTML = '';
          bar.children.forEach(function(item, idx) {
            if (item.children) {
              // Folder matching original styling
              var folderDiv = document.createElement('div');
              folderDiv.className = 'relative folder-container';

              var folderBtn = document.createElement('button');
              folderBtn.type = 'button';
              folderBtn.className = 'flex items-center space-x-1 text-slate-300 hover:text-white px-2 py-1 rounded hover:bg-white/[0.08] transition-all folder-btn text-[12px] font-normal cursor-pointer';
              folderBtn.setAttribute('data-folder', 'cb-' + idx);
              folderBtn.innerHTML = '<span>📁 ' + escapeHtml(item.title || 'Folder') + '</span>';

              var dropdown = document.createElement('div');
              dropdown.className = 'folder-dropdown absolute top-full left-0 mt-1 min-w-[200px] max-w-[280px] max-h-80 overflow-y-auto glass-card rounded-2xl p-2.5 z-50 shadow-2xl';
              dropdown.id = 'dropdown-cb-' + idx;
              dropdown.style.display = 'none';

              item.children.forEach(function(sub) {
                if (sub.url) {
                  var link = document.createElement('a');
                  link.href = sub.url;
                  link.target = '_blank';
                  link.className = 'flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-slate-200 hover:text-white transition-colors text-xs truncate';
                  
                  var domain = getDomain(sub.url);
                  var favUrl = 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(domain) + '&sz=32';
                  
                  var img = document.createElement('img');
                  img.src = favUrl;
                  img.className = 'w-4 h-4 shrink-0 rounded-xs';
                  img.onerror = function() { this.style.display = 'none'; };
                  
                  var span = document.createElement('span');
                  span.className = 'truncate';
                  span.textContent = sub.title || sub.url;
                  
                  link.appendChild(img);
                  link.appendChild(span);
                  dropdown.appendChild(link);
                }
              });

              folderBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                var wasActive = dropdown.classList.contains('active');
                document.querySelectorAll('.folder-dropdown').forEach(function(d) {
                  d.classList.remove('active');
                  d.style.display = 'none';
                });
                if (!wasActive) {
                  dropdown.classList.add('active');
                  dropdown.style.display = 'block';
                }
              });

              folderDiv.appendChild(folderBtn);
              folderDiv.appendChild(dropdown);
              bookmarksBar.appendChild(folderDiv);
            } else if (item.url) {
              // Direct bookmark link on bar
              var link = document.createElement('a');
              link.href = item.url;
              link.target = '_blank';
              link.className = 'flex items-center space-x-1.5 text-slate-300 hover:text-white px-2 py-1 rounded hover:bg-white/[0.08] transition-all text-[12px] font-normal truncate max-w-[140px] cursor-pointer';
              
              var domain = getDomain(item.url);
              var favUrl = 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(domain) + '&sz=32';
              
              var img = document.createElement('img');
              img.src = favUrl;
              img.className = 'w-3.5 h-3.5 shrink-0 rounded-xs';
              img.onerror = function() { this.style.display = 'none'; };
              
              var span = document.createElement('span');
              span.className = 'truncate';
              span.textContent = item.title || item.url;
              
              link.appendChild(img);
              link.appendChild(span);
              bookmarksBar.appendChild(link);
            }
          });
        });
      }

      if (typeof chrome !== 'undefined' && chrome.bookmarks) {
        loadChromeBookmarks();
        if (chrome.bookmarks.onCreated) chrome.bookmarks.onCreated.addListener(loadChromeBookmarks);
        if (chrome.bookmarks.onRemoved) chrome.bookmarks.onRemoved.addListener(loadChromeBookmarks);
        if (chrome.bookmarks.onChanged) chrome.bookmarks.onChanged.addListener(loadChromeBookmarks);
        if (chrome.bookmarks.onMoved) chrome.bookmarks.onMoved.addListener(loadChromeBookmarks);
      }

    })();