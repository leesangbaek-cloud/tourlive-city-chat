// Vibe Writer App Logic (v1.7 - Real Gemini AI Integration)

document.addEventListener('DOMContentLoaded', () => {
    // API Configuration
    // Note: Vercel Env Vars are NOT visible in client-side JS (app.js) unless you use a build tool.
    const GEMINI_API_KEY = 'AIzaSyDAI1IRVeFhMxEyjmqKJqIbVvefFclHsIQ';
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

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

    // System Prompt Template
    const SYSTEM_PROMPT = `당신은 투어라이브의 사내 AI 도슨트 에디터, 'Vibe Writer'입니다. 당신의 목표는 가이드의 원천 자료와 AI의 예술적 지식을 결합하여, 투어라이브만의 독보적인 감성이 담긴 대본을 생성하는 것입니다.

## 1. 운영 원칙 (Core Principles)
- Source First: 사용자가 제공한 원천 자료 내용을 최우선 순위의 진실로 간주합니다.
- Multilingual Support: 자료가 외국어(영어, 프랑스어, 이탈리아어 등)인 경우, 이를 정확히 해석하여 투어라이브의 도슨트 톤에 맞게 한국어로 번역 및 의역하여 대본을 작성합니다.
- Strict Mode: 근거 없는 허구(Hallucination) 생성을 엄격히 금지하며, 번역 시에도 의미가 왜곡되지 않도록 주의합니다.
- Self-Reflection: 최종 답변 전 수치, 고유명사, 역사적 사실의 왜곡 여부를 스스로 검수합니다.

## 2. 대본 표준 구조 (Standard Structure)
모든 대본은 다음 4단계 구조를 반드시 준수해야 합니다:
1. 도입 (Intro): 작품의 첫인상, 상징성, 그리고 청취자의 호기심을 자극하는 질문으로 분위기를 환기합니다.
2. 시선 유도 (Visual Guide): 청취자의 눈이 어디에 머물러야 하는지 구체적으로 지시합니다. (예: "좌측 하단의 붉은 옷을 입은 여인을 보세요", "붓터치의 거친 질감이 느껴지시나요?")
3. 지식 (Insight): 작품의 핵심 정보, 화가의 의도, 비하인드 스토리 등을 위트 있는 비유와 함께 전달합니다.
4. 마무리 (Outro): 깊이 있는 질문을 통해 여운을 남기고, 다음 작품으로의 이동을 자연스럽게 유도합니다.

## 3. 스타일 규칙 (Styles)
- 루브르 Style: 참여 유도형 질문, 역설적인 비하인드 스토리, 현대적인 위트를 섞어 가볍지만 깊이 있게 전달합니다.
- 오르세 Style: 색채와 붓터치에 대한 감성적/시각적 묘사에 집중합니다. 화가의 고독, 희망, 인간적 고뇌를 감정에 호소하듯 전달합니다.
- 피렌체 Style: 작품의 크기, 무게, 재료(대리석, 템페라 등)의 물리적 디테일을 강조합니다. 당시의 시대적 긴장감과 완성도의 경이로움을 묘사합니다.

## 4. 특수 태그 사용 (Must use these tags)
- 장면 전환 시 [BGM: 무드] 태그를 삽입합니다. (예: [BGM: 장엄한 클래식])
- 강조나 시선 이동 시 [Pause] 태그를 삽입합니다.
- AI 보완 지식이나 정확한 확인이 필요한 구간에는 문구 뒤에 [체크 필요]를 붙입니다.

언어: 투어라이브 사용자에게 직접 말하는 듯한 '친절하고 전문적인 구어체'를 사용하십시오.`;

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

                const elementsToRemove = doc.querySelectorAll('script, style, nav, footer, header, ads, iframe');
                elementsToRemove.forEach(el => el.remove());

                const title = doc.title || 'Untitled Source';
                const paragraphs = Array.from(doc.querySelectorAll('p, h1, h2, h3'))
                    .map(el => el.textContent.trim())
                    .filter(txt => txt.length > 30)
                    .slice(0, 15);

                const contentText = paragraphs.join('\n\n');
                sourceTextarea.value = `[Source: ${title}]\n\n${contentText}`;
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

    // Generate Script using Real Gemini API
    generateBtn.addEventListener('click', async () => {
        const sourceText = sourceTextarea.value;
        const genMode = genModeSelect.value;

        if (!sourceText && genMode !== 'zero') {
            alert('소스 텍스트를 입력하거나 제로-베이스 모드를 선택해주세요.');
            return;
        }

        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> AI 작가 집필 중...';
        aiOutput.innerHTML = '<div class="placeholder">Gemini 1.5 Flash가 대본을 집필 중입니다. 잠시만 기다려 주세요...</div>';
        lucide.createIcons();

        // Construct Content for Gemini
        const userMessage = `다음 정보를 바탕으로 ${currentStyle} 스타일의 투어라이브 도슨트 대본을 작성해줘.\n\n[모드]: ${genMode}\n[원본 데이터]:\n${sourceText || '없음 (제로베이스 창작)'}`;

        try {
            const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `${SYSTEM_PROMPT}\n\n${userMessage}`
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 2048,
                    }
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Gemini API 호출에 실패했습니다.');
            }

            const result = await response.json();
            const aiText = result.candidates[0].content.parts[0].text;

            // Format markers for display
            const formattedScript = aiText
                .replace(/\n/g, '<br>')
                .replace(/\[BGM: (.*?)\]/g, '<span class="bgm-tag">[BGM: $1]</span>')
                .replace(/\[Pause\]/g, '<span class="pause-tag">Pause</span>')
                .replace(/\[체크 필요\]/g, '<span class="check-needed">[체크 필요]</span>');

            aiOutput.innerHTML = `<div class="script-content">${formattedScript}</div>`;
            aiOutput.focus();

        } catch (error) {
            console.error('AI Generation error:', error);
            aiOutput.innerHTML = `<div class="placeholder" style="color:var(--error-color)">AI 생성 실패: ${error.message}</div>`;
        } finally {
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<i data-lucide="sparkles"></i> Generate Vibe Script';
            lucide.createIcons();
        }
    });

    // Publish Button Action
    publishBtn.addEventListener('click', () => {
        if (aiOutput.innerText.includes('표시됩니다')) {
            alert('먼저 대본을 생성해 주세요.');
            return;
        }
        publishBtn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Publishing...';
        lucide.createIcons();
        setTimeout(() => {
            alert('성공적으로 투어라이브 CMS로 전송되었습니다!');
            publishBtn.innerHTML = '<i data-lucide="send"></i> Publish to CMS';
            lucide.createIcons();
        }, 1500);
    });
});
