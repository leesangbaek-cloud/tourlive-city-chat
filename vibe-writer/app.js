// Vibe Writer App Logic (v2.3 stable - Robust Multi-Source)

document.addEventListener('DOMContentLoaded', () => {
    // Basic Elements
    const styleButtons = document.querySelectorAll('.style-btn');
    const genModeSelect = document.getElementById('gen-mode');
    const modeBadge = document.getElementById('mode-badge');
    const generateBtn = document.getElementById('generate-btn');
    const aiOutput = document.getElementById('ai-output');
    const sourceTextarea = document.getElementById('source-text');
    const copyBtn = document.getElementById('copy-btn');
    const addSourceBtn = document.getElementById('add-source');
    const sourcesContainer = document.getElementById('sources-container');

    // State
    let currentStyle = 'louvre';

    // Style Selection
    styleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            styleButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentStyle = btn.dataset.style;
        });
    });

    // Mode Selection Change
    genModeSelect.addEventListener('change', (e) => {
        const mode = e.target.value;
        if (mode === 'faithful') {
            modeBadge.textContent = 'Data Faithful Mode';
            modeBadge.style.color = '#10b981';
        } else if (mode === 'hybrid') {
            modeBadge.textContent = 'AI Knowledge Enabled';
            modeBadge.style.color = '#f59e0b';
        } else {
            modeBadge.textContent = 'Zero-Base Creative Mode';
            modeBadge.style.color = '#ff6b35';
        }
    });

    // Multi-Source Management
    addSourceBtn.addEventListener('click', () => {
        const row = document.createElement('div');
        row.className = 'url-input-wrapper';
        row.innerHTML = `
            <input type="text" placeholder="https://..." class="input-field source-url">
            <button class="btn-secondary fetch-url">Crawl</button>
            <button class="btn-remove-source" title="Remove"><i data-lucide="trash-2"></i></button>
        `;
        sourcesContainer.appendChild(row);
        lucide.createIcons();
        updateRemoveButtons();
    });

    function updateRemoveButtons() {
        const rows = sourcesContainer.querySelectorAll('.url-input-wrapper');
        rows.forEach((row, index) => {
            const removeBtn = row.querySelector('.btn-remove-source');
            if (rows.length === 1) {
                removeBtn.style.display = 'none';
            } else {
                removeBtn.style.display = 'flex';
            }
        });
    }

    // Event Delegation for Crawl and Remove buttons
    sourcesContainer.addEventListener('click', (e) => {
        const row = e.target.closest('.url-input-wrapper');
        if (!row) return;

        // Handle Crawl
        if (e.target.closest('.fetch-url')) {
            const input = row.querySelector('.source-url');
            const btn = row.querySelector('.fetch-url');
            crawlSource(input, btn);
        }

        // Handle Remove
        if (e.target.closest('.btn-remove-source')) {
            row.remove();
            updateRemoveButtons();
        }
    });

    async function crawlSource(input, btn) {
        const url = input.value;
        if (!url) {
            alert('URL을 입력해주세요.');
            return;
        }

        btn.disabled = true;
        const originalContent = btn.innerHTML;
        btn.innerHTML = '<i data-lucide="loader-2" class="spin"></i>';
        lucide.createIcons();

        try {
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
            const response = await fetch(proxyUrl);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();

            if (data.contents) {
                const parser = new DOMParser();
                const doc = parser.parseFromString(data.contents, 'text/html');

                const elementsToRemove = doc.querySelectorAll('script, style, nav, footer, header, ads, iframe, noscript');
                elementsToRemove.forEach(el => el.remove());

                const title = doc.title || 'Untitled Source';
                const paragraphs = Array.from(doc.querySelectorAll('p, h1, h2, h3, article'))
                    .map(el => el.textContent.trim())
                    .filter(txt => txt.length > 30)
                    .slice(0, 5);

                const contentText = paragraphs.join('\n\n');
                const newContent = `[Source: ${title}]\n${contentText}`;

                const currentText = sourceTextarea.value;
                sourceTextarea.value = currentText ? `${currentText}\n\n---\n\n${newContent}` : newContent;
                input.style.borderColor = '#10b981';

                // Highlight success
                btn.classList.replace('btn-secondary', 'btn-success');
                setTimeout(() => btn.classList.replace('btn-success', 'btn-secondary'), 2000);
            }
        } catch (error) {
            console.error('Crawling error:', error);
            alert(`크롤링 실패: 일부 사이트는 보안 정책상 차단되어 있습니다. (Error: ${error.message})`);
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalContent;
            lucide.createIcons();
        }
    }

    // Generate Script
    generateBtn.addEventListener('click', () => {
        const sourceText = sourceTextarea.value;
        const genMode = genModeSelect.value;

        if (!sourceText && genMode !== 'zero') {
            alert('소스 텍스트를 입력하거나 제로-베이스 모드를 선택해주세요.');
            return;
        }

        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> AI 작가 집필 중...';
        aiOutput.innerHTML = '<div class="placeholder">투어라이브의 감성을 담아 최고의 대본을 집필 중입니다...</div>';
        lucide.createIcons();

        // Multi-topic extraction
        let topic = "이 작품";
        const sources = sourceText.split('---');
        if (sources.length > 0) {
            const firstTitle = sources[0].match(/\[Source:\s*(.*?)[\]\n]/);
            if (firstTitle) {
                topic = `"${firstTitle[1].split('|')[0].trim()}"`;
                if (sources.length > 1) topic += ` 외 ${sources.length - 1}건`;
            }
        }

        setTimeout(() => {
            const mockScripts = {
                louvre: `
# 도입
여러분, 지금 제 앞에 있는 ${topic}들을 보세요. 여러 자료의 행간을 읽어보니, 이 작품들 뒤에는 우리가 전혀 예상치 못한 역설적인 비하인드가 겹겹이 숨겨져 있습니다. [Pause] 어쩌면 이 이야기는 지금껏 세상에 알려진 것과 조금 다를지도 모릅니다.

# 시선 유도
먼저, 각 작품 속에 공통으로 흐르는 저 에너지를 봐주세요. 마치 살아있는 생명체처럼 꿈틀거리고 있죠? 수집된 정보에 따르면, 이 부분들이야말로 작가들이 가장 고뇌했던 지점입니다. [Pause] 주변의 고요함과 대비되는 저 소동을 시선으로 따라가 보세요.

# 지식
이용자님, 제가 여러 소스의 지식을 더해 분석해보니 여기에는 흥미로운 사실이 하나 더 있습니다. **[체크 필요: 각 소스 데이터 간의 일치성 교차 검증]** 사실 루브르에서는 이런 식의 정보를 전달할 때 청중의 호기심을 자극하는 '반전'의 장치로 쓰이기도 하죠. 단순한 정보 이상의 드라마가 이 ${topic} 안에 숨 쉬고 있습니다.

# 마무리
오늘 여러분의 마음속에는 어떤 영감이 소용돌이치고 있나요? [Pause] 이 아름다운 소동을 뒤로하고, 우리는 이제 이 흐름이 이어지는 다음 장소로 발걸음을 옮겨보겠습니다.`,

                orsay: `
# 도입
${topic}... 이 이름들을 떠올리면 가슴 한구석이 아릿해지는 느낌입니다. [Pause] 수집된 방대한 자료들 사이로 고개를 내밀고 있는 감정의 조각들을 하나씩 모아봤습니다. 마치 누군가의 간절한 기도처럼 반짝이는 이야기들입니다.

# 시선 유도
저 터치들을 자세히 봐주세요. 단순한 기록이 아닙니다. 자료들에서 언급된 그 굴곡과 질감, 제작자들이 직접 숨결을 불어넣은 듯한 그 디테일이 느껴지시나요? [Pause] 빛이 그 굴곡에 부딪혀 실제로 반짝이는 듯한 환각을 불러일으킵니다.

# 지식
오르세의 시선으로 이 ${topic}을 바라본다면, 우리는 그 안에 숨겨진 색채의 하모니를 발견할 수 있습니다. **[체크 필요: 당시 시대적 문헌 내용 인용]** 비록 지금은 차가운 텍스트로 보일지라도, AI의 지식으로 보완해본 결과 이곳엔 고독을 이겨내려는 뜨거운 희망의 붓터치가 숨겨져 있었네요. 

# 마무리
시선이 머문 곳마다 따뜻한 위로가 깃들기를 바랍니다. [Pause] 이제 더 깊은 심연으로, 그들이 사랑했던 또 다른 색채를 찾아서 발걸음을 옮겨볼까요?`,

                florence: `
# 도입
이 공간 안에 펼쳐진 ${topic}의 세계는 당시의 예술적 관습을 완전히 뒤엎은 하나의 거대한 혁명이었습니다. [Pause] 철저한 고증과 수치로 무장한, 대리석의 질감보다 더 차가운 데이터의 정수를 지금 공개합니다.

# 시선 유도
화면 곳곳의 수평선들을 보세요. 소스 데이터들에서 명시한 그 물리적 수치들이 실제 시각적 경험과 어떻게 결합되는지 분석할 시간입니다. 구도의 완벽함 속에서 뿜어져 나오는 긴장감을 팽팽하게 느껴보시기 바랍니다. [Pause] 디테일의 경이로움을 목격하십시오.

# 지식
이 구성 성분들은 당시 기술로서는 불가능에 가까운 도전이었습니다. **[체크 필요: 교차 분석된 물리적 성분 데이터]** 피렌체 거장들이 추구했던 '완벽한 조화'가 이 파편화된 정보들 속에서도 면밀히 관찰됩니다. 이는 철저한 계산과 통제되지 않는 열망이 한 공간에서 공존하고 있음을 증명하죠.

# 마무리
완벽한 구도 속에서 피어난 불완전한 인간의 열정, 데이터가 말하는 진실에 귀를 기울여 보셨나요? [Pause] 긴장의 끈을 놓지 말고, 다음 르네상스의 정수로 안내하겠습니다.`
            };

            const selectedScript = mockScripts[currentStyle] || mockScripts['louvre'];
            const formattedScript = selectedScript
                .trim()
                .replace(/\n/g, '<br>')
                .replace(/\[Pause\]/g, '<span class="pause-tag">Pause</span>')
                .replace(/\[체크 필요: (.*?)\]/g, '<span class="check-needed">[체크 필요: $1]</span>');

            aiOutput.innerHTML = `<div class="script-content">${formattedScript}</div>`;
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<i data-lucide="sparkles"></i> Generate Vibe Script';
            lucide.createIcons();
            aiOutput.focus();
        }, 1200);
    });

    // Copy Button
    copyBtn.addEventListener('click', () => {
        const textToCopy = aiOutput.innerText;
        if (textToCopy.includes('표시됩니다')) {
            alert('복사할 대본이 없습니다.');
            return;
        }

        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalHTML = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i data-lucide="check"></i> Copied!';
            lucide.createIcons();
            setTimeout(() => {
                copyBtn.innerHTML = originalHTML;
                lucide.createIcons();
            }, 2000);
        });
    });

    // Initial check
    updateRemoveButtons();
});
