// Vibe Writer App Logic

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

    // State
    let currentStyle = 'louvre';

    // Style Selection
    styleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            styleButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentStyle = btn.dataset.style;
            console.log(`Style switched to: ${currentStyle}`);
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

    // Simulate URL Fetching
    fetchUrlBtn.addEventListener('click', () => {
        const url = sourceUrlInput.value;
        if (!url) return;

        fetchUrlBtn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Crawling...';
        lucide.createIcons();

        setTimeout(() => {
            document.getElementById('source-text').value = `[Crawled Content from ${url}]\n고흐의 '별이 빛나는 밤'은 1889년 생레미의 요양원에서 그려진 작품입니다. 밤하늘의 소용돌이치는 별들과 거대한 사이프러스 나무가 특징이며, 고흐의 불안한 심리 상태와 열정을 동시에 보여줍니다...`;
            fetchUrlBtn.innerHTML = 'Crawl';
            lucide.createIcons();
        }, 1500);
    });

    // Generate Script Mockup
    generateBtn.addEventListener('click', () => {
        const sourceText = document.getElementById('source-text').value;
        if (!sourceText && genModeSelect.value !== 'zero') {
            alert('소스 텍스트를 입력하거나 제로-베이스 모드를 선택해주세요.');
            return;
        }

        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i data-lucide="loader-2" class="spin"></i> Generating Vibe...';
        aiOutput.innerHTML = '<div class="placeholder">AI가 투어라이브 스타일로 대본을 집필 중입니다...</div>';
        lucide.createIcons();

        setTimeout(() => {
            const mockScripts = {
                louvre: `[BGM: 경쾌하고 미스테리한 현악사중주]

# 도입
여러분, 지금 제 앞에 있는 이 그림을 보세요. 1889년의 어느 밤, 한 남자가 요양원 창밖을 보며 느꼈을 감정이 느껴지시나요? [Pause] 고흐의 '별이 빛나는 밤'입니다. 이 작품에는 우리가 몰랐던 역설적인 비하인드가 숨겨져 있습니다.

# 시선 유도
먼저, 화면 가운데에서 소용돌이치는 거대한 빛의 흐름을 봐주세요. 마치 살아있는 생명체처럼 꿈틀거리고 있죠? 그 아래에 있는 작은 마을의 고요함과 극명한 대조를 이룹니다. [Pause] 좌측에 우뚝 솟은 검은 형체, 사이프러스 나무도 잊지 마세요.

# 지식
이용자님, 고흐는 이 그림을 그릴 때 본인의 내면을 투영했습니다. [Pause] 저 소용돌이는 단순한 바람이 아니라 그의 요동치는 영혼의 외침이었죠. **[체크 필요: 당시 고흐의 편지 내용 인용]** 재미있는 건, 이 그림이 그려진 곳은 감옥이 아닌 치료를 위한 요양원이었다는 점입니다. 죽음과 부활을 상징하는 사이프러스가 하늘로 뻗어가는 모습에서 우리는 그의 마지막 희망을 발견할 수 있습니다.

# 마무리
오늘 밤, 여러분의 마음속에는 어떤 별이 소용돌이치고 있나요? [Pause] 이 아름다운 소동을 뒤로하고, 우리는 이제 고흐가 마지막으로 머물렀던 오베르의 들판으로 이동해 보겠습니다.`,

                orsay: `[BGM: 서정적이고 고독한 첼로 선율]

# 도입
밤하늘이 이렇게나 뜨거울 수 있을까요? [Pause] 깊은 청색의 잉크가 쏟아진 듯한 밤, 그 위를 수놓은 노란 별들이 마치 누군가의 간절한 기도처럼 반짝입니다. 오르세에서 만나는 고흐의 가장 순수한 고뇌, '별이 빛나는 밤'입니다.

# 시선 유도
저 노란빛의 터치를 자세히 봐주세요. 단순한 칠이 아닙니다. 고흐가 캔버스에 직접 물감을 짜 올린 듯한 두꺼운 질감, 임파스토 기법이 느껴지시나요? 빛이 그 굴곡에 부딪혀 실제로 반짝이는 듯한 착각을 불러일으킵니다.

# 지식
고흐에게 노란색은 단순한 색이 아니었습니다. 그것은 태양이고, 생명이며, 그가 그토록 갈구했던 사랑이었습니다. **[체크 필요: 고흐의 황색시증 관련 설]** 붓 끝에 실린 그의 고독이 밤하늘을 일깨웠고, 우리는 그의 슬픔 덕분에 이토록 찬란한 밤을 선물 받았습니다. [Pause] 작가의 고통이 예술이 되어 우리를 치유하는 순간입니다.

# 마무리
이 차가운 밤의 온기가 여러분의 마음에도 닿았기를 바랍니다. 이제 그가 사랑했던 또 다른 색채, 밀밭의 황금빛을 찾아서 발걸음을 옮겨볼까요?`,

                florence: `[BGM: 웅장하고 긴장감 넘치는 오케스트라]

# 도입
가로 92cm, 세로 73cm의 캔버스 위에 펼쳐진 이 우주는 당시의 예술적 관습을 완전히 뒤엎은 혁명이었습니다. [Pause] 1889년 6월, 생레미 요양원에서 탄생한 물리적 세계와 정신적 세계의 격돌, 빈센트 반 고흐의 걸작입니다.

# 시선 유도
화면 하단의 수평선을 보세요. 네덜란드 전통 화풍의 영향을 받은 낮은 지평선이 작품에 안정감을 주려 하지만, 그 위로 쏟아지는 수직의 사이프러스 나무가 그 긴장감을 팽팽하게 끌어올립니다. 별을 감싸는 동심원의 크기와 물감의 두께를 눈으로 측정해 보시기 바랍니다.

# 지식
이 작품에서 사용된 울트라마린과 코발트 블루의 배합은 당시로서는 파격적인 선택이었습니다. **[체크 필요: 당시 사용된 안료의 화학적 분석 데이터]** 고흐는 격자틀을 사용하여 구도를 잡았음에도 불구하고, 그 내부의 표현은 물리적 법칙을 초월한 에너지를 담아냈습니다. [Pause] 이는 철저한 계산과 통제되지 않는 열망이 한 공간에서 공존하고 있음을 증명합니다.

# 마무리
완벽한 구도 속에서 피어난 불완전한 인간의 열정, 여러분은 어떤 힘이 더 강하게 느껴지시나요? 긴장의 끈을 놓지 말고, 다음 르네상스의 정수로 안내하겠습니다.`
            };

            const selectedScript = mockScripts[currentStyle] || mockScripts['louvre'];

            // Format markers for display
            const formattedScript = selectedScript
                .replace(/\[BGM: (.*?)\]/g, '<span class="bgm-tag">[BGM: $1]</span>')
                .replace(/\[Pause\]/g, '<span class="pause-tag">Pause</span>')
                .replace(/\[체크 필요: (.*?)\]/g, '<span class="check-needed">[체크 필요: $1]</span>');

            aiOutput.innerHTML = formattedScript;

            generateBtn.disabled = false;
            generateBtn.innerHTML = '<i data-lucide="sparkles"></i> Generate Vibe Script';
            lucide.createIcons();

            // Focus output
            aiOutput.focus();
        }, 2000);
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
