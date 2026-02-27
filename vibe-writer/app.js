// Vibe Writer App Logic (v2.0 - Multi-Source Support)

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const styleButtons = document.querySelectorAll('.style-btn');
    const genModeSelect = document.getElementById('gen-mode');
    const modeBadge = document.getElementById('mode-badge');
    const generateBtn = document.getElementById('generate-btn');
    const aiOutput = document.getElementById('ai-output');
    const publishBtn = document.getElementById('publish-btn');
    const sourceTextarea = document.getElementById('source-text');
    const copyBtn = document.getElementById('copy-btn');

    // Dynamic Sources Elements
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

    // Function to create a new source input row
    function createSourceRow() {
        const row = document.createElement('div');
        row.className = 'url-input-wrapper';
        row.innerHTML = `
            <input type="text" placeholder="https://..." class="input-field source-url">
            <button class="btn-secondary fetch-url">Crawl</button>
            <button class="btn-remove-source" title="Remove"><i data-lucide="trash-2"></i></button>
        `;

        // Add Remove Functionality
        row.querySelector('.btn-remove-source').addEventListener('click', () => {
            if (sourcesContainer.children.length > 1) {
                row.remove();
            } else {
                alert('최소 하나의 소스 입력칸은 필요합니다.');
            }
        });

        // Add Crawl Functionality to the new button
        const crawlBtn = row.querySelector('.fetch-url');
        const urlInput = row.querySelector('.source-url');
        crawlBtn.addEventListener('click', () => crawlSource(urlInput, crawlBtn));

        sourcesContainer.appendChild(row);
        lucide.createIcons();
    }

    // Individual Crawl Logic
    async function crawlSource(input, btn) {
        const url = input.value;
        if (!url) {
            alert('URL을 입력해주세요.');
            return;
        }

        btn.disabled = true;
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
                    .slice(0, 5); // Take top 5 paragraphs per source

                const contentText = paragraphs.join('\n\n');

                // Append to source textarea instead of overwriting
                const currentText = sourceTextarea.value;
                const newContent = `[Source: ${title}]\n${contentText}`;

                if (currentText.includes(`[Source: ${title}]`)) {
                    alert('이미 추가된 소스입니다.');
                } else {
                    sourceTextarea.value = currentText ? `${currentText}\n\n---\n\n${newContent}` : newContent;
                }

                input.style.borderColor = '#10b981';
            }
        } catch (error) {
            console.error('Crawling error:', error);
            alert(`크롤링 실패: 일부 사이트는 보안 정책상 차단되어 있습니다.`);
        } finally {
            btn.disabled = false;
            btn.innerHTML = 'Crawl';
            lucide.createIcons();
        }
    }

    // Initialize the first source row crawl button
    const firstCrawlBtn = document.querySelector('.fetch-url');
    const firstUrlInput = document.querySelector('.source-url');
    if (firstCrawlBtn && firstUrlInput) {
        firstCrawlBtn.addEventListener('click', () => crawlSource(firstUrlInput, firstCrawlBtn));
    }

    // Add Source Button Event
    addSourceBtn.addEventListener('click', createSourceRow);

    // Generate Script using Premium Dynamic Templates (Handles Multiple Sources)
    generateBtn.addEventListener('click', () => {
        const sourceText = sourceTextarea.value;
        const genMode = genModeSelect.value;

        if (!sourceText && genMode !== 'zero') {
            alert('소스 텍스트를 입력하거나 제로-베이스 모드를 선택해주세요.');
            return;
        }

        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> AI 작가 집필 중...';
        aiOutput.innerHTML = '<div class="placeholder">여러 소스의 데이터를 통합하여 최고의 대본을 집필 중입니다...</div>';
        lucide.createIcons();

        // Extract Topic(s)
        let topic = "이 작품";
        const sources = sourceText.match(/\[Source:\s*(.*?)[\]\n]/g);
        if (sources && sources.length > 0) {
            const firstTopic = sources[0].match(/\[Source:\s*(.*?)[\]\n]/)[1].split('|')[0].trim();
            if (sources.length > 1) {
                topic = `"${firstTopic}" 외 ${sources.length - 1}건의 자료`;
            } else {
                topic = `"${firstTopic}"`;
            }
        }

        setTimeout(() => {
            const mockScripts = {
                louvre: `
# 도입
여러분, 제가 지금 ${topic}을(를) 포함한 여러 원천 자료들을 면밀히 분석해봤습니다. [Pause] 자료들 사이의 연결 고리를 찾아보니, 우리가 지금까지 대수롭지 않게 넘겼던 사실 속에 거대한 비밀이 숨겨져 있더군요.

# 시선 유도
자, 먼저 가장 비중 있게 다뤄진 핵심 지점을 봐주세요. 수집된 다각도의 정보들이 공통적으로 가리키는 바로 그곳입니다. [Pause] 파편화된 데이터들이 하나의 완성된 이야기로 맞춰지는 순간이 느껴지시나요?

# 지식
이용자님, 제가 AI 지식을 더해 교차 분석해보니 여기에는 흥미로운 통합적 사실이 있습니다. **[체크 필요: 다중 소스 간 정보 일치성 검토]** 루브르의 시선으로 볼 때, 이런 풍부한 자료의 조합은 청중에게 더 깊은 신뢰와 위트를 동시에 줄 수 있는 최고의 재료가 되죠.

# 마무리
오늘 여러분의 마음속에 쌓인 이 지식의 층위들이 여행의 깊이를 더해주길 바랍니다. [Pause] 이제 이 풍성한 이야기들을 품고, 다음 예술의 현장으로 이동해 보겠습니다.`,

                orsay: `
# 도입
밤하늘의 별들처럼 흩어져 있던 ${topic}의 기록들을 하나로 모았습니다. [Pause] 수집된 여러 자료의 결마다 묻어있는 창작자의 고독과 열망을 이제 하나의 선율로 들려드리고자 합니다.

# 시선 유도
각 자료가 강조하는 세밀한 묘사들에 집중해 보세요. 붓터치 하나, 단어 하나에 서린 감정의 파동이 보이시나요? [Pause] 파편화된 정보들이 모여 하나의 뜨거운 심장 소리를 만들어내며 우리에게 말을 걸어옵니다.

# 지식
오르세의 서정적 시선으로 이 통합된 ${topic}의 세계를 바라본다면, 우리는 그 안에 숨겨진 거대한 감정의 지도를 발견할 수 있습니다. **[체크 필요: 다중 자료 기반 시대적 배경 재구성]** 비록 시작은 각기 다른 기록이었을지라도, AI가 그 행간을 이어보니 결국 하나의 거대한 사랑 이야기였네요.

# 마무리
조각난 지식들이 모여 여러분의 가슴 속에 하나의 별이 되었기를 바랍니다. [Pause] 이제 더 깊은 심연으로, 또 다른 이야기가 기다리는 곳을 향해 발걸음을 옮겨볼까요?`,

                florence: `
# 도입
이곳에 집결된 ${topic} 관련 다각도 데이터는 르네상스적 치밀함의 정수를 보여줍니다. [Pause] 철저한 고증과 수치로 무장한 다중 소스의 정보를 분석하여, 가장 완벽한 형태의 도슨트 가이드를 지금 공개합니다.

# 시선 유도
각 자료의 좌표값이 일치하는 완벽한 구도를 확인하십시오. 소스마다 조금씩 달랐던 디테일들이 고도의 계산을 통해 하나의 무결한 사실로 정립되는 과정입니다. [Pause] 데이터의 웅장함을 직접 목격하십시오.

# 지식
수집된 복합 성분 분석 결과, 이 ${topic}은 고대의 지혜와 당대의 혁신이 결합된 결과물임이 증명되었습니다. **[체크 필요: 다중 소스 교차 검증을 통한 물리적 고증]** 피렌체 거장들이 추구했던 '완벽한 조화'가 이 방대한 정보 집합체 속에서도 면밀하고 수학적으로 관찰됩니다.

# 마무리
방대한 데이터가 증명하는 흔들림 없는 진실에 귀를 기울여 보셨습니까? [Pause] 이 완벽한 긴장감을 유지한 채, 다음 르네상스의 걸작으로 안내하겠습니다.`
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

    // Copy Button Action
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
        }).catch(err => {
            console.error('Copy failed:', err);
            alert('복사에 실패했습니다.');
        });
    });

    // Publish Button Action
    publishBtn.addEventListener('click', () => {
        publishBtn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Publishing...';
        lucide.createIcons();
        setTimeout(() => {
            alert('성공적으로 투어라이브 CMS로 전송되었습니다!');
            publishBtn.innerHTML = '<i data-lucide="send"></i> Publish to CMS';
            lucide.createIcons();
        }, 1500);
    });
});
