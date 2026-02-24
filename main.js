// 1. Supabase 초기 설정
const SUPABASE_URL = 'https://vxfkpbbdikxoqoohuyen.supabase.co';
const SUPABASE_KEY = 'sb_publishable_7Zkb2m4twe2X1i8NMmIViA_RAYE5bYS';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. 상태 관리
let currentNickname = '';
let currentCity = '';
let boardChannel = null;

// 3. DOM 요소 추출
const views = {
    lobby: document.getElementById('lobby-view'),
    board: document.getElementById('board-view'),
    write: document.getElementById('write-view')
};

const elements = {
    nicknameInput: document.getElementById('nickname-input'),
    cityNameDisplay: document.getElementById('current-city-name'),
    postContainer: document.getElementById('post-container'),
    postTitle: document.getElementById('post-title'),
    postContent: document.getElementById('post-content'),
    cityCards: document.querySelectorAll('.city-card')
};

// --- 화면 전환 로직 ---

function switchView(viewName) {
    Object.keys(views).forEach(key => {
        views[key].classList.add('hidden');
    });
    views[viewName].classList.remove('hidden');
}

async function enterCityBoard(cityName) {
    currentNickname = elements.nicknameInput.value.trim() || '익명 여행자';
    currentCity = cityName;

    // UI 초기화
    elements.cityNameDisplay.textContent = getCityDisplayName(cityName);
    elements.postContainer.innerHTML = '';
    switchView('board');

    // 게시글 불러오기 및 실시간 구독
    await fetchPosts();
    subscribeToBoard();
}

function getCityDisplayName(cityId) {
    const names = { 'Paris': '파리', 'Rome': '로마', 'Florence': '피렌체', 'Barcelona': '바르셀로나' };
    return names[cityId] || cityId;
}

// --- 게시판 데이터 로직 ---

async function fetchPosts() {
    const { data, error } = await supabaseClient
        .from('city_posts')
        .select('*')
        .eq('city_name', currentCity)
        .order('created_at', { ascending: false }); // 최신순

    if (error) {
        console.error('게시글 로드 실패:', error);
        return;
    }

    data.forEach(post => prependPost(post));
}

function subscribeToBoard() {
    // 기존 구독 해제
    if (boardChannel) boardChannel.unsubscribe();

    boardChannel = supabaseClient.channel(`realtime:city_posts:${currentCity}`)
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'city_posts',
            filter: `city_name=eq.${currentCity}`
        }, payload => {
            prependPost(payload.new);
        })
        .subscribe();
}

async function savePost() {
    const title = elements.postTitle.value.trim();
    const content = elements.postContent.value.trim();

    if (!title || !content) {
        alert('제목과 내용을 입력해주세요.');
        return;
    }

    // 등록 버튼 비활성화 (선택 사항)
    document.getElementById('submit-post').disabled = true;

    const { error } = await supabaseClient
        .from('city_posts')
        .insert([{
            city_name: currentCity,
            nickname: currentNickname,
            title: title,
            content: content
        }]);

    if (error) {
        console.error('게시글 등록 실패:', error);
        alert('등록에 실패했습니다.');
    } else {
        // 성공 시 폼 초기화 및 목록으로 복귀
        elements.postTitle.value = '';
        elements.postContent.value = '';
        switchView('board');
    }

    document.getElementById('submit-post').disabled = false;
}

function prependPost(post) {
    const card = document.createElement('div');
    card.className = 'post-card';
    card.innerHTML = `
        <h4>${post.title}</h4>
        <p>${post.content}</p>
        <div class="post-meta">
            <span class="meta-nickname">${post.nickname}</span>
            <span class="meta-time">${new Date(post.created_at).toLocaleDateString()}</span>
        </div>
    `;
    // 최신 글이 위로 오도록 prepend
    elements.postContainer.prepend(card);
}

// --- 이벤트 리스너 ---

// 로비: 도시 선택
elements.cityCards.forEach(card => {
    card.addEventListener('click', () => enterCityBoard(card.dataset.city));
});

// 게시판: 뒤로가기
document.getElementById('back-to-lobby').addEventListener('click', () => {
    if (boardChannel) boardChannel.unsubscribe();
    switchView('lobby');
});

// 게시판: 작성 버튼
document.getElementById('write-btn').addEventListener('click', () => switchView('write'));

// 작성: 취소 버튼
document.getElementById('close-write').addEventListener('click', () => switchView('board'));

// 작성: 등록 버튼
document.getElementById('submit-post').addEventListener('click', savePost);
