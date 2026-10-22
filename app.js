(function() {
      // --- APP STATE & STORAGE ---
      const defaultState = {
        theme: 'dark',
        clockFormat: '12',
        searchEngine: 'google'
      };

      let state = Object.assign({}, defaultState);
      try {
        const saved = localStorage.getItem('chromenewtab_state');
        if (saved) {
          state = Object.assign({}, defaultState, JSON.parse(saved));
        }
      } catch (e) {}

      function saveState() {
        try {
          localStorage.setItem('chromenewtab_state', JSON.stringify(state));
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

      // --- DYNAMIC GREETING & WISHES ---
      const morningWishes = [
        'Wishing you an inspiring and productive day ahead.',
        'May your day be filled with clarity and great energy.',
        'Start strong, stay creative, and achieve your goals.'
      ];
      const afternoonWishes = [
        'Keep up the fantastic momentum and focused flow.',
        'Wishing you clarity and success through the afternoon.',
        'Take a breath and continue conquering your day.'
      ];
      const eveningWishes = [
        'Reflect on today’s achievements and unwind peacefully.',
        'Wishing you a calm, inspiring, and relaxing evening.',
        'Great job on everything you accomplished today.'
      ];
      const nightWishes = [
        'Wishing you a peaceful evening and restorative night.',
        'Time to recharge and dream big for tomorrow.',
        'Rest well and wake up renewed and inspired.'
      ];

      function updateGreeting() {
        const now = new Date();
        const hours = now.getHours();
        const titleEl = document.getElementById('greetingTitle');
        const wishEl = document.getElementById('greetingWish');
        const iconEl = document.getElementById('greetingIcon');
        if (!titleEl || !wishEl || !iconEl) return;

        let title = 'Good morning';
        let icon = '✨';
        let pool = morningWishes;

        if (hours >= 5 && hours < 12) {
          title = 'Good morning';
          icon = '🌅';
          pool = morningWishes;
        } else if (hours >= 12 && hours < 17) {
          title = 'Good afternoon';
          icon = '☀️';
          pool = afternoonWishes;
        } else if (hours >= 17 && hours < 21) {
          title = 'Good evening';
          icon = '🌆';
          pool = eveningWishes;
        } else {
          title = 'Good night';
          icon = '🌙';
          pool = nightWishes;
        }

        titleEl.textContent = title;
        iconEl.textContent = icon;
        if (typeof window._currentWishIndex === 'undefined') window._currentWishIndex = 0;
        wishEl.textContent = pool[window._currentWishIndex % pool.length];
      }

      const greetingWidget = document.getElementById('greetingWidget');
      if (greetingWidget) {
        greetingWidget.addEventListener('click', () => {
          window._currentWishIndex = (window._currentWishIndex || 0) + 1;
          updateGreeting();
          showToast('Updated your daily wish ✨', '✨');
        });
      }
      updateGreeting();

      // --- CHROME APPS & BOOKMARKS OPTIONS DROPDOWN ---
      const chromeAppsBtn = document.getElementById('chromeAppsBtn');
      const chromeAppsDropdown = document.getElementById('chromeAppsDropdown');
      const dropdownAllBookmarksBtn = document.getElementById('dropdownAllBookmarksBtn');
      const dropdownSyncBookmarksBtn = document.getElementById('dropdownSyncBookmarksBtn');

      if (chromeAppsBtn && chromeAppsDropdown) {
        chromeAppsBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const isHidden = chromeAppsDropdown.classList.contains('hidden');
          document.querySelectorAll('.folder-dropdown').forEach(dd => {
            dd.classList.remove('active');
            dd.style.display = 'none';
          });
          if (isHidden) {
            chromeAppsDropdown.classList.remove('hidden');
          } else {
            chromeAppsDropdown.classList.add('hidden');
          }
        });

        document.addEventListener('click', (e) => {
          if (!chromeAppsBtn.contains(e.target) && !chromeAppsDropdown.contains(e.target)) {
            chromeAppsDropdown.classList.add('hidden');
          }
        });
      }

      if (dropdownAllBookmarksBtn) {
        dropdownAllBookmarksBtn.addEventListener('click', () => {
          if (chromeAppsDropdown) chromeAppsDropdown.classList.add('hidden');
          if (typeof chrome !== 'undefined' && chrome.tabs) {
            chrome.tabs.create({ url: 'chrome://bookmarks' });
          } else {
            window.open('chrome://bookmarks', '_blank');
          }
        });
      }

      if (dropdownSyncBookmarksBtn && syncBookmarksModal) {
        dropdownSyncBookmarksBtn.addEventListener('click', () => {
          if (chromeAppsDropdown) chromeAppsDropdown.classList.add('hidden');
          syncBookmarksModal.classList.remove('hidden');
        });
      }


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

      // --- COMMAND PALETTE & SEARCH ENGINE ---
      const searchForm = document.getElementById('searchForm');
      const searchInput = document.getElementById('searchInput');
      const commandDropdown = document.getElementById('commandDropdown');
      const aiModeBtn = document.getElementById('aiModeBtn');
      const aiResponsePanel = document.getElementById('aiResponsePanel');
      const closeAiPanelBtn = document.getElementById('closeAiPanelBtn');
      const aiResponseContent = document.getElementById('aiResponseContent');
      let isAiMode = false;

      const searchEngines = {
        google: 'https://www.google.com/search?q=',
        duckduckgo: 'https://duckduckgo.com/?q=',
        bing: 'https://www.bing.com/search?q=',
        brave: 'https://search.brave.com/search?q='
      };

      // Show/hide command palette dropdown when typing or focusing
      if (searchInput && commandDropdown) {
        searchInput.addEventListener('focus', () => {
          if (!isAiMode) commandDropdown.classList.remove('hidden');
        });
        document.addEventListener('click', (e) => {
          if (!searchForm.contains(e.target) && !commandDropdown.contains(e.target)) {
            commandDropdown.classList.add('hidden');
          }
        });
      }

      if (commandDropdown) {
        commandDropdown.querySelectorAll('a').forEach(link => {
          link.addEventListener('click', () => {
            commandDropdown.classList.add('hidden');
          });
        });
      }

      if (aiModeBtn && aiResponsePanel) {
        aiModeBtn.addEventListener('click', () => {
          isAiMode = !isAiMode;
          if (isAiMode) {
            aiModeBtn.classList.add('bg-[#1B54FF]', 'text-white', 'border-[#83F9FF]');
            aiModeBtn.classList.remove('bg-[#1B54FF]/25', 'text-[#83F9FF]');
            aiResponsePanel.classList.remove('hidden');
            if (commandDropdown) commandDropdown.classList.add('hidden');
            if (searchInput) {
              searchInput.placeholder = 'Ask AI anything...';
              searchInput.focus();
            }
          } else {
            aiModeBtn.classList.remove('bg-[#1B54FF]', 'text-white', 'border-[#83F9FF]');
            aiModeBtn.classList.add('bg-[#1B54FF]/25', 'text-[#83F9FF]');
            aiResponsePanel.classList.add('hidden');
            if (searchInput) searchInput.placeholder = 'Type a command or search...';
          }
        });
      }

      if (closeAiPanelBtn && aiResponsePanel) {
        closeAiPanelBtn.addEventListener('click', () => {
          isAiMode = false;
          aiModeBtn.classList.remove('bg-[#1B54FF]', 'text-white', 'border-[#83F9FF]');
          aiModeBtn.classList.add('bg-[#1B54FF]/25', 'text-[#83F9FF]');
          aiResponsePanel.classList.add('hidden');
          if (searchInput) searchInput.placeholder = 'Type a command or search...';
        });
      }

      if (searchForm && searchInput) {
        searchForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const query = searchInput.value.trim();
          if (!query) return;

          if (commandDropdown) commandDropdown.classList.add('hidden');

          if (isAiMode) {
            if (aiResponseContent) {
              aiResponseContent.innerHTML = 'Analyzing: <strong>"' + escapeHtml(query) + '"</strong>...<br><br>' +
                'Quick overview for "<em>' + escapeHtml(query) + '</em>": ' +
                'Explore the fast summary below or launch directly in Gemini or ChatGPT.';
            }
            return;
          }

          const base = searchEngines[state.searchEngine] || searchEngines.google;
          window.location.href = base + encodeURIComponent(query);
        });
      }

      // Quick engine button removed per request; Enter triggers immediate search

      // Voice recognition button
      const micBtn = document.getElementById('micBtn');
      if (micBtn) {
        micBtn.addEventListener('click', () => {
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.lang = 'en-US';
            showToast('Listening... Speak now 🎙️', '🎙️');
            recognition.onresult = function(event) {
              const text = event.results[0][0].transcript;
              if (searchInput) {
                searchInput.value = text;
                showToast('Recognized: ' + text);
              }
            };
            recognition.onerror = function() {
              showToast('Microphone input completed');
            };
            recognition.start();
          } else {
            showToast('Voice search ready (Web Speech API available in browser)');
          }
        });
      }

      // Lens button
      const lensBtn = document.getElementById('lensBtn');
      if (lensBtn) {
        lensBtn.addEventListener('click', () => {
          showToast('Search by image ready');
        });
      }

      // Ask Gemini / ChatGPT buttons
      const askGeminiBtn = document.getElementById('askGeminiBtn');
      if (askGeminiBtn) {
        askGeminiBtn.addEventListener('click', () => {
          const q = searchInput ? searchInput.value.trim() : '';
          window.open('https://gemini.google.com/app?q=' + encodeURIComponent(q), '_blank');
        });
      }
      const askChatGPTBtn = document.getElementById('askChatGPTBtn');
      if (askChatGPTBtn) {
        askChatGPTBtn.addEventListener('click', () => {
          const q = searchInput ? searchInput.value.trim() : '';
          window.open('https://chatgpt.com/?q=' + encodeURIComponent(q), '_blank');
        });
      }

      // --- REAL BOOKMARK BAR INTEGRATION (Live Chrome Bookmarks API + Import Sync) ---
      const bookmarksBar = document.getElementById('bookmarksBar');
      const syncBookmarksModal = document.getElementById('syncBookmarksModal');
      const closeSyncBookmarksModalBtn = document.getElementById('closeSyncBookmarksModalBtn');
      const doneSyncBookmarksBtn = document.getElementById('doneSyncBookmarksBtn');
      const bookmarksFileInput = document.getElementById('bookmarksFileInput');
      const chooseBookmarksFileBtn = document.getElementById('chooseBookmarksFileBtn');
      const resetBookmarksBtn = document.getElementById('resetBookmarksBtn');
      const syncStatusTitle = document.getElementById('syncStatusTitle');
      const syncStatusDesc = document.getElementById('syncStatusDesc');

      const defaultBookmarks = [
        {
          title: 'AI Tools',
          children: [
            { title: 'ChatGPT', url: 'https://chatgpt.com' },
            { title: 'Google Gemini', url: 'https://gemini.google.com' },
            { title: 'Claude AI', url: 'https://claude.ai' },
            { title: 'Perplexity', url: 'https://perplexity.ai' }
          ]
        },
        {
          title: 'Inspiration',
          children: [
            { title: 'Dribbble', url: 'https://dribbble.com' },
            { title: 'Behance', url: 'https://behance.net' },
            { title: 'Pinterest', url: 'https://pinterest.com' },
            { title: 'Awwwards', url: 'https://awwwards.com' }
          ]
        },
        {
          title: 'Workspace',
          children: [
            { title: 'Gmail', url: 'https://mail.google.com' },
            { title: 'Google Drive', url: 'https://drive.google.com' },
            { title: 'Notion', url: 'https://notion.so' },
            { title: 'GitHub', url: 'https://github.com' }
          ]
        },
        {
          title: 'Payment tracker',
          children: [
            { title: 'Stripe Dashboard', url: 'https://stripe.com' },
            { title: 'PayPal', url: 'https://paypal.com' },
            { title: 'Budget Sheet', url: 'https://sheets.google.com' }
          ]
        },
        {
          title: 'Tools',
          children: [
            { title: 'Figma', url: 'https://figma.com' },
            { title: 'Canva', url: 'https://canva.com' },
            { title: 'URL Shortener', url: 'https://tinyurl.com' }
          ]
        },
        {
          title: 'social media',
          children: [
            { title: 'X / Twitter', url: 'https://twitter.com' },
            { title: 'LinkedIn', url: 'https://linkedin.com' },
            { title: 'Instagram', url: 'https://instagram.com' },
            { title: 'Reddit', url: 'https://reddit.com' }
          ]
        },
        {
          title: 'Digital marketing',
          children: [
            { title: 'Google Analytics', url: 'https://analytics.google.com' },
            { title: 'Google Ads', url: 'https://ads.google.com' },
            { title: 'Search Console', url: 'https://search.google.com/search-console' }
          ]
        }
      ];

      function getDomain(url) {
        try {
          return new URL(url).hostname;
        } catch (e) {
          return '';
        }
      }

      function renderBookmarksBar(items) {
        if (!bookmarksBar) return;
        bookmarksBar.innerHTML = '';

        if (!items || !items.length) {
          items = defaultBookmarks;
        }

        items.forEach(node => {
          if (node.url) {
            // Leaf bookmark
            const a = document.createElement('a');
            a.href = node.url;
            a.target = '_blank';
            a.className = 'flex items-center space-x-1.5 text-slate-300 hover:text-white px-2 py-1 rounded hover:bg-white/[0.08] transition-all shrink-0 text-[12px] font-normal max-w-[170px] truncate';
            a.title = node.title || node.url;

            const domain = getDomain(node.url);
            const favUrl = domain ? 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(domain) + '&sz=32' : '';

            a.innerHTML = 
              (favUrl ? '<img src="' + favUrl + '" class="w-3.5 h-3.5 rounded-sm shrink-0" onerror="this.style.display=\'none\';" alt="">' : '') +
              '<span class="truncate">' + escapeHtml(node.title || domain || 'Bookmark') + '</span>';
            bookmarksBar.appendChild(a);
          } else if (node.children) {
            // Folder with children
            const folderDiv = document.createElement('div');
            folderDiv.className = 'relative folder-container shrink-0';
            folderDiv.style.position = 'relative';

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'flex items-center space-x-1 text-slate-300 hover:text-white px-2 py-1 rounded hover:bg-white/[0.08] transition-all folder-btn text-[12px] font-normal';
            btn.innerHTML = 
              '<span class="text-xs">📁</span>' +
              '<span class="truncate max-w-[130px]">' + escapeHtml(node.title || 'Folder') + '</span>';

            const dd = document.createElement('div');
            dd.className = 'folder-dropdown absolute top-full left-0 mt-1 w-56 glass-card rounded-2xl p-2 z-50 shadow-2xl max-h-80 overflow-y-auto custom-scrollbar';
            dd.style.position = 'absolute';
            dd.style.top = '100%';
            dd.style.left = '0';
            dd.style.marginTop = '4px';
            dd.style.zIndex = '999';

            if (node.children && node.children.length > 0) {
              node.children.forEach(sub => {
                if (sub.url) {
                  const subA = document.createElement('a');
                  subA.href = sub.url;
                  subA.target = '_blank';
                  subA.className = 'flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-slate-200 hover:text-white transition-colors text-xs truncate';
                  subA.title = sub.title || sub.url;
                  const sDomain = getDomain(sub.url);
                  const sFav = sDomain ? 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(sDomain) + '&sz=32' : '';
                  subA.innerHTML = 
                    (sFav ? '<img src="' + sFav + '" class="w-3.5 h-3.5 rounded-sm shrink-0" onerror="this.style.display=\'none\';" alt="">' : '<span>🔗</span>') +
                    '<span class="truncate">' + escapeHtml(sub.title || sDomain || 'Link') + '</span>';
                  dd.appendChild(subA);
                } else if (sub.children && sub.children.length > 0) {
                  const subHead = document.createElement('div');
                  subHead.className = 'px-3 pt-2 pb-1 text-[11px] font-bold text-slate-400 flex items-center space-x-1.5 uppercase tracking-wider';
                  subHead.innerHTML = '<span>📁</span><span class="truncate">' + escapeHtml(sub.title) + '</span>';
                  dd.appendChild(subHead);
                  sub.children.forEach(nested => {
                    if (nested.url) {
                      const nA = document.createElement('a');
                      nA.href = nested.url;
                      nA.target = '_blank';
                      nA.className = 'flex items-center space-x-2 px-5 py-1.5 rounded-xl hover:bg-white/10 text-slate-300 hover:text-white transition-colors text-xs truncate';
                      const nDomain = getDomain(nested.url);
                      const nFav = nDomain ? 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(nDomain) + '&sz=32' : '';
                      nA.innerHTML = 
                        (nFav ? '<img src="' + nFav + '" class="w-3 h-3 rounded-sm shrink-0" onerror="this.style.display=\'none\';" alt="">' : '<span>🔗</span>') +
                        '<span class="truncate">' + escapeHtml(nested.title || nDomain || 'Link') + '</span>';
                      dd.appendChild(nA);
                    }
                  });
                }
              });
            } else {
              dd.innerHTML = '<div class="px-3 py-2 text-xs text-slate-400 italic">Empty folder</div>';
            }

            btn.addEventListener('click', (e) => {
              e.stopPropagation();
              const wasActive = dd.classList.contains('active');
              document.querySelectorAll('.folder-dropdown').forEach(d => {
                d.classList.remove('active');
                d.style.display = 'none';
              });
              if (!wasActive) {
                dd.classList.add('active');
                dd.style.display = 'block';
                dd.style.position = 'absolute';
              }
            });

            folderDiv.appendChild(btn);
            folderDiv.appendChild(dd);
            bookmarksBar.appendChild(folderDiv);
          }
        });
      }

      function parseBookmarksHtml(text) {
        const lines = text.split(/\r?\n/);
        const items = [];
        const stack = [items];
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          if (/<h3/i.test(line)) {
            const match = line.match(/<h3[^>]*>(.*?)<\/h3>/i);
            const title = match ? match[1].replace(/<[^>]+>/g, '').trim() : 'Folder';
            const folder = { title: title, children: [] };
            stack[stack.length - 1].push(folder);
            stack.push(folder.children);
          } else if (/<\/dl>/i.test(line)) {
            if (stack.length > 1) {
              stack.pop();
            }
          } else if (/<a /i.test(line)) {
            const hrefMatch = line.match(/href=["']([^"']*)["']/i);
            const titleMatch = line.match(/>([^<]*)<\/a>/i);
            if (hrefMatch) {
              const url = hrefMatch[1];
              const title = titleMatch && titleMatch[1].trim() ? titleMatch[1].trim() : url;
              stack[stack.length - 1].push({ title: title, url: url });
            }
          }
        }

        // Find Bookmarks bar children or return all
        for (let j = 0; j < items.length; j++) {
          if (items[j].children && /bar/i.test(items[j].title)) {
            return items[j].children;
          }
        }
        for (let j = 0; j < items.length; j++) {
          if (items[j].children && items[j].children.length > 0) {
            return items[j].children;
          }
        }
        return items;
      }

      function loadBookmarks() {
        if (typeof chrome !== 'undefined' && chrome.bookmarks && chrome.bookmarks.getTree) {
          if (syncStatusTitle) syncStatusTitle.textContent = 'Chrome Extension Sync: Active 🟢';
          if (syncStatusDesc) syncStatusDesc.textContent = 'Connected directly to your Chrome Bookmarks API. Your real saved bookmarks bar is live and synced in real time!';

          chrome.bookmarks.getTree((tree) => {
            if (tree && tree.length > 0) {
              let barNode = null;
              if (tree[0].children) {
                barNode = tree[0].children.find(c => c.id === '1' || (c.title && c.title.toLowerCase().includes('bar')));
                if (!barNode && tree[0].children.length > 0) barNode = tree[0].children[0];
              }
              if (barNode && barNode.children && barNode.children.length > 0) {
                renderBookmarksBar(barNode.children);
                return;
              }
            }
            renderBookmarksBar(defaultBookmarks);
          });

          if (chrome.bookmarks.onCreated && !window._hasBookmarkListeners) {
            window._hasBookmarkListeners = true;
            chrome.bookmarks.onCreated.addListener(loadBookmarks);
            chrome.bookmarks.onRemoved.addListener(loadBookmarks);
            chrome.bookmarks.onChanged.addListener(loadBookmarks);
            chrome.bookmarks.onMoved.addListener(loadBookmarks);
            if (chrome.bookmarks.onChildrenReordered) {
              chrome.bookmarks.onChildrenReordered.addListener(loadBookmarks);
            }
          }
        } else {
          // Web Preview Mode
          if (syncStatusTitle) syncStatusTitle.textContent = 'Web Preview Mode (Security Sandbox)';
          if (syncStatusDesc) syncStatusDesc.textContent = 'Web browsers prevent websites from directly reading private bookmarks. When installed as an unpacked Chrome Extension, your real bookmarks bar will appear automatically here. In this preview, you can also upload your exported bookmarks.html file below!';

          try {
            const saved = localStorage.getItem('chromenewtab_custom_bookmarks');
            if (saved) {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed) && parsed.length > 0) {
                renderBookmarksBar(parsed);
                return;
              }
            }
          } catch (e) {}
          renderBookmarksBar(defaultBookmarks);
        }
      }

      // Close dropdowns on outside click
      document.addEventListener('click', () => {
        document.querySelectorAll('.folder-dropdown').forEach(dd => {
          dd.classList.remove('active');
          dd.style.display = 'none';
        });
      });


      function closeSyncModal() {
        if (syncBookmarksModal) syncBookmarksModal.classList.add('hidden');
      }
      if (closeSyncBookmarksModalBtn) closeSyncBookmarksModalBtn.addEventListener('click', closeSyncModal);
      if (doneSyncBookmarksBtn) doneSyncBookmarksBtn.addEventListener('click', closeSyncModal);

      if (chooseBookmarksFileBtn && bookmarksFileInput) {
        chooseBookmarksFileBtn.addEventListener('click', () => {
          bookmarksFileInput.click();
        });

        bookmarksFileInput.addEventListener('change', (e) => {
          const file = e.target.files && e.target.files[0];
          if (!file) return;

          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const content = event.target.result;
              const parsed = parseBookmarksHtml(content);
              if (parsed && parsed.length > 0) {
                try {
                  localStorage.setItem('chromenewtab_custom_bookmarks', JSON.stringify(parsed));
                } catch (err) {}
                renderBookmarksBar(parsed);
                showToast('Loaded ' + parsed.length + ' items from your Chrome bookmarks file! 🔖', '🔖');
                closeSyncModal();
              } else {
                showToast('No bookmarks found in file');
              }
            } catch (err) {
              showToast('Error parsing bookmarks file');
            }
          };
          reader.readAsText(file);
        });
      }

      if (resetBookmarksBtn) {
        resetBookmarksBtn.addEventListener('click', () => {
          try {
            localStorage.removeItem('chromenewtab_custom_bookmarks');
          } catch (e) {}
          renderBookmarksBar(defaultBookmarks);
          showToast('Reset to default bookmarks bar', '🔄');
          closeSyncModal();
        });
      }

      // Initial load
      loadBookmarks();

      // --- CHROME SHORTCUTS MANAGER (Drag & Drop Reordering, Real Favicon Logos, Edit & Delete) ---
      const defaultShortcuts = [
        { id: 'sc-1', name: 'ChatGPT', url: 'https://chatgpt.com' },
        { id: 'sc-2', name: 'Gemini', url: 'https://gemini.google.com' },
        { id: 'sc-3', name: 'Claude', url: 'https://claude.ai' },
        { id: 'sc-4', name: 'YouTube', url: 'https://youtube.com' },
        { id: 'sc-5', name: 'Pinterest', url: 'https://pinterest.com' },
        { id: 'sc-6', name: 'Canva', url: 'https://canva.com' },
        { id: 'sc-7', name: 'GitHub', url: 'https://github.com' },
        { id: 'sc-8', name: 'Reddit', url: 'https://reddit.com' }
      ];

      if (!state.shortcuts || !Array.isArray(state.shortcuts) || state.shortcuts.length === 0) {
        try {
          const savedSc = localStorage.getItem('chromenewtab_shortcuts');
          state.shortcuts = savedSc ? JSON.parse(savedSc) : defaultShortcuts.slice();
        } catch (e) {
          state.shortcuts = defaultShortcuts.slice();
        }
      }

      function saveShortcuts() {
        try {
          localStorage.setItem('chromenewtab_shortcuts', JSON.stringify(state.shortcuts));
          if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            chrome.storage.local.set({ chromenewtab_shortcuts: state.shortcuts });
          }
        } catch (e) {}
      }

      const shortcutsContainer = document.getElementById('shortcutsContainer');
      const addShortcutModal = document.getElementById('addShortcutModal');
      const shortcutModalTitleText = document.getElementById('shortcutModalTitleText');
      const closeAddShortcutModalBtn = document.getElementById('closeAddShortcutModalBtn');
      const cancelShortcutBtn = document.getElementById('cancelShortcutBtn');
      const saveShortcutBtn = document.getElementById('saveShortcutBtn');
      const shortcutNameInput = document.getElementById('shortcutNameInput');
      const shortcutUrlInput = document.getElementById('shortcutUrlInput');
      let editingShortcutId = null;
      let draggedIndex = null;

      function renderShortcuts() {
        if (!shortcutsContainer) return;
        shortcutsContainer.innerHTML = '';

        state.shortcuts.forEach((sc, index) => {
          const domain = getDomain(sc.url) || 'google.com';
          const faviconUrl = 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(domain) + '&sz=64';
          const firstChar = (sc.name || domain || 'W').charAt(0).toUpperCase();

          const tile = document.createElement('div');
          tile.className = 'shortcut-tile group relative flex flex-col items-center w-20 cursor-grab select-none';
          tile.setAttribute('draggable', 'true');
          tile.setAttribute('data-id', sc.id);
          tile.setAttribute('data-index', String(index));

          tile.innerHTML = 
            '<a href="' + escapeHtml(sc.url) + '" target="_blank" class="shortcut-icon-circle w-14 h-14 md:w-15 md:h-15 rounded-full flex items-center justify-center p-3 shadow-md relative" title="' + escapeHtml(sc.name) + ' (' + escapeHtml(sc.url) + ')">' +
              '<img src="' + faviconUrl + '" class="w-7 h-7 md:w-8 md:h-8 object-contain rounded-sm" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'flex\';" alt="">' +
              '<div style="display:none;" class="w-full h-full rounded-full bg-gradient-to-tr from-[#1B54FF] to-[#83F9FF] text-white font-bold text-base items-center justify-center">' + firstChar + '</div>' +
            '</a>' +
            '<span class="shortcut-label text-xs text-slate-300 font-medium mt-2.5 truncate max-w-[85px] text-center group-hover:text-white transition-colors">' + escapeHtml(sc.name) + '</span>' +
            '<button type="button" class="shortcut-menu-btn absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 w-5 h-5 rounded-full bg-black/80 hover:bg-black text-slate-300 hover:text-white border border-white/25 transition-all flex items-center justify-center text-[10px] shadow-md z-10" title="Options">' +
              '⋮' +
            '</button>' +
            '<div class="shortcut-context-menu hidden absolute top-6 right-0 z-30 w-36 glass-card rounded-2xl p-1.5 shadow-2xl text-xs space-y-0.5">' +
              '<button type="button" class="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-slate-200 hover:text-white flex items-center space-x-2 edit-btn">' +
                '<span>✏️</span><span>Edit</span>' +
              '</button>' +
              '<button type="button" class="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-slate-200 hover:text-white flex items-center space-x-2 move-first-btn">' +
                '<span>⏮</span><span>Move to First</span>' +
              '</button>' +
              '<button type="button" class="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-slate-200 hover:text-white flex items-center space-x-2 move-last-btn">' +
                '<span>⏭</span><span>Move to Last</span>' +
              '</button>' +
              '<button type="button" class="w-full text-left px-2.5 py-1.5 rounded-xl hover:bg-red-500/20 text-red-300 hover:text-red-200 flex items-center space-x-2 delete-btn">' +
                '<span>🗑</span><span>Remove</span>' +
              '</button>' +
            '</div>';

          // Drag and Drop Listeners
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

          // Options menu button
          const menuBtn = tile.querySelector('.shortcut-menu-btn');
          const contextMenu = tile.querySelector('.shortcut-context-menu');

          if (menuBtn && contextMenu) {
            menuBtn.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              const wasActive = !contextMenu.classList.contains('hidden');
              document.querySelectorAll('.shortcut-context-menu').forEach(m => m.classList.add('hidden'));
              if (!wasActive) contextMenu.classList.remove('hidden');
            });

            // Edit button
            const editBtn = contextMenu.querySelector('.edit-btn');
            if (editBtn) {
              editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                contextMenu.classList.add('hidden');
                openShortcutModal(sc);
              });
            }

            // Move First button
            const moveFirstBtn = contextMenu.querySelector('.move-first-btn');
            if (moveFirstBtn) {
              moveFirstBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                contextMenu.classList.add('hidden');
                if (index > 0) {
                  const item = state.shortcuts.splice(index, 1)[0];
                  state.shortcuts.unshift(item);
                  saveShortcuts();
                  renderShortcuts();
                  showToast('Moved "' + item.name + '" to first position 🥇', '⏮');
                }
              });
            }

            // Move Last button
            const moveLastBtn = contextMenu.querySelector('.move-last-btn');
            if (moveLastBtn) {
              moveLastBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                contextMenu.classList.add('hidden');
                if (index < state.shortcuts.length - 1) {
                  const item = state.shortcuts.splice(index, 1)[0];
                  state.shortcuts.push(item);
                  saveShortcuts();
                  renderShortcuts();
                  showToast('Moved "' + item.name + '" to last position', '⏭');
                }
              });
            }

            // Delete button
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

          shortcutsContainer.appendChild(tile);
        });

        // "+ Add shortcut" Tile at the end
        const addTile = document.createElement('div');
        addTile.className = 'flex flex-col items-center w-20 select-none';
        addTile.innerHTML = 
          '<button type="button" id="openAddShortcutBtn" class="w-14 h-14 md:w-15 md:h-15 rounded-full bg-white/[0.06] hover:bg-white/[0.14] border border-dashed border-white/30 hover:border-[#83F9FF]/70 flex items-center justify-center text-slate-300 hover:text-white transition-all shadow-md hover:scale-110 group" title="Add shortcut">' +
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

        shortcutsContainer.appendChild(addTile);
      }

      // Close shortcut context menus on outside click
      document.addEventListener('click', () => {
        document.querySelectorAll('.shortcut-context-menu').forEach(m => m.classList.add('hidden'));
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

    })();