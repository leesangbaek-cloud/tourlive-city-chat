// Vibe Writer App Logic (v1.8 - Enhanced Mock-up Mode)

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const styleButtons = document.querySelectorAll('.style-btn');
    const genModeSelect = document.getElementById('gen-mode');
    const modeBadge = document.getElementById('mode-badge');
    const generateBtn = document.getElementById('generate-btn');
    const aiOutput = document.getElementById('ai-output');
    const fetchUrlBtn = document.getElementById('fetch-url');
    const sourceUrlInput = document.getElementById('source-url');
    const publishBtn = document.getElementById('publish-btn');
    const sourceTextarea = document.getElementById('source-text');

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

    // Actual URL Fetching using CORS Proxy
    fetchUrlBtn.addEventListener('click', async () => {
        const url = sourceUrlInput.value;
        if (!url) {
            alert('URL을 입력해주세요.');
            return;
        }

        fetchUrlBtn.disabled = true;
        fetchUrlBtn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Crawling...';
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
                    .slice(0, 15);

                const contentText = paragraphs.join('\n\n');

                if (contentText.length < 50) {
                    sourceTextarea.value = `[Source: ${title}]\n\n내용을 자동으로 추출하지 못했습니다. 수동으로 복사해서 붙여넣어주세요.`;
                } else {
                    sourceTextarea.value = `[Source: ${title}]\n\n${contentText}`;
                }

                sourceUrlInput.style.borderColor = '#10b981';
                setTimeout(() => sourceUrlInput.style.borderColor = '', 2000);
            }
        } catch (error) {
            console.error('Crawling error:', error);
            alert(`크롤링 실패: 일부 사이트는 보안 정책상 크롤링이 차단될 수 있습니다.`);
        } finally {
            fetchUrlBtn.disabled = false;
            fetchUrlBtn.innerHTML = 'Crawl';
            lucide.createIcons();
        }
    });

    // Generate Script using Enhanced Mock-up (No API needed)
    generateBtn.addEventListener('click', () => {
        const sourceText = sourceTextarea.value;
        const genMode = genModeSelect.value;

        if (!sourceText && genMode !== 'zero') {
            alert('소스 텍스트를 입력하거나 제로-베이스 모드를 선택해주세요.');
            return;
        }

        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> AI 작가 집필 중...';
        aiOutput.innerHTML = '<div class="placeholder">AI가 원본 데이터를 분석하여 투어라이브 대본으로 변환 중입니다...</div>';
        lucide.createIcons();

        // Extract a "Topic" from the source text for the dynamic mock
        let topic = "이 작품";
        if (sourceText.includes('[Source:')) {
            const match = sourceText.match(/\[Source:\s*(.*?)[\]\n]/);
            if (match && match[1]) {
                topic = `"${match[1].substring(0, 30).trim()}..."`;
            }
        }

        setTimeout(() => {
            const mockScripts = {
                louvre: `[BGM: 경쾌하고 미스테리한 현악사중주]

# 도입
여러분, 제가 방금 수집한 정보를 바탕으로 ${topic}에 대해 아주 흥미로운 이야기를 들려드릴게요. [Pause] 평범해 보이는 이 데이터 뒤에 숨겨진 진짜 이야기를 아시나요? 

# 시선 유도
자, 먼저 ${topic}의 가장 핵심적인 부분을 봐주세요. 자료의 첫머리에서 강조한 그 지점이 보이시나요? [Pause] 바로 그곳에서 작가의 의도가 시작됩니다.

# 지식
이용자님, 우리가 방금 찾아낸 소스에 따르면, 이 부분은 단순한 정보가 아닙니다. **[체크 필요: 원본 데이터의 신뢰성 검토]** 사실 루브르에서 이런 식으로 정보를 전달할 때는 청중과의 심리적 거리를 좁히는 것이 핵심이죠. 마치 이 자료가 처음부터 우리를 위해 쓰인 것처럼요.

# 마무리
오늘 이 소중한 지식이 여러분의 여행길에 작은 등불이 되었으면 좋겠네요. [Pause] 다음은 이 흐름을 이어받아 좀 더 깊은 배경지식으로 이동해 볼까요?`,

                orsay: `[BGM: 서정적이고 고독한 첼로 선율]

# 도입
${topic}... 이 이름만 들어도 가슴 한구석이 아릿해지는 느낌입니다. [Pause] 파편화된 자료들 사이로 고개를 내밀고 있는 감정의 조각들을 하나씩 모아봤습니다.

# 시선 유도
여기 나열된 텍스트의 질감을 느껴보세요. 딱딱한 정보처럼 보이지만, 그 행간에는 제작자의 뜨거운 숨결이 녹아있습니다. [Pause] 그 고독한 흔적을 시선으로 따라가 보시길 바랍니다.

# 지식
오르세의 감성으로 이 ${topic}을 바라본다면, 우리는 그 안에 숨겨진 색채를 발견할 수 있습니다. **[체크 필요: 역사적 증언 고증]** 비록 지금은 차가운 텍스트로 보일지라도, AI의 지식으로 보완해 본 결과 이곳엔 희망이라는 붓터치가 숨겨져 있었네요.

# 마무리
여러분의 시선이 머문 곳마다 따뜻한 위로가 깃들기를 바랍니다. [Pause] 이제 더 깊은 심연으로, 다음 이야기를 찾아 떠나볼까요?`,

                florence: `[BGM: 웅장하고 긴장감 넘치는 오케스트라]

# 도입
철저한 고증과 수치로 무장한 ${topic}의 세계에 오신 것을 환영합니다. [Pause] 대리석의 질감보다 더 차가운, 그러나 완벽한 데이터의 정수를 지금 공개합니다.

# 시선 유도
좌표 x, y축이 만나는 지점의 비율을 확인하십시오. 소스 데이터에서 명시한 그 물리적 수치가 실제 시각적 경험과 어떻게 결합되는지 분석할 시간입니다. [Pause] 디테일의 경이로움을 목격하십시오.

# 지식
이 ${topic}의 구성 성분은 당시 기술로서는 불가능에 가까운 도전이었습니다. **[체크 필요: 물리적 재료의 현대적 성분 분석 데이터]** 피렌체 거장들이 추구했던 '완벽한 조화'가 이 파편화된 정보들 속에서도 면밀히 관찰됩니다. 

# 마무리
데이터가 말하는 진실에 귀를 기울여 보셨나요? [Pause] 다음 관람 구역은 이보다 더욱 정교한 완성도를 자랑하는 세기의 걸작입니다.`
            };

            const selectedScript = mockScripts[currentStyle] || mockScripts['louvre'];

            // Format markers for display
            const formattedScript = selectedScript
                .replace(/\n/g, '<br>')
                .replace(/\[BGM: (.*?)\]/g, '<span class="bgm-tag">[BGM: $1]</span>')
                .replace(/\[Pause\]/g, '<span class="pause-tag">Pause</span>')
                .replace(/\[체크 필요: (.*?)\]/g, '<span class="check-needed">[체크 필요: $1]</span>');

            aiOutput.innerHTML = `<div class="script-content">${formattedScript}</div>`;
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<i data-lucide="sparkles"></i> Generate Vibe Script';
            lucide.createIcons();
            aiOutput.focus();
        }, 1200);
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
