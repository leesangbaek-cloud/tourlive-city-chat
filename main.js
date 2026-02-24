// 1. Supabase 초기 설정
const SUPABASE_URL = 'https://vxfkpbbdikxoqoohuyen.supabase.co';
const SUPABASE_KEY = 'sb_publishable_7Zkb2m4twe2X1i8NMmIViA_RAYE5bYS';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. 상태 관리
let currentNickname = '';
let currentCity = '';
let boardChannel = null;
let commentChannel = null;
let myPostIds = JSON.parse(localStorage.getItem('my_post_ids') || '[]');
let myCommentIds = JSON.parse(localStorage.getItem('my_comment_ids') || '[]');

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
    subscribeToComments();
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

    data.forEach(post => appendPost(post));
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
            appendPost(payload.new);
        })
        .on('postgres_changes', {
            event: 'DELETE',
            schema: 'public',
            table: 'city_posts'
        }, payload => {
            removePostFromDOM(payload.old.id);
        })
        .subscribe();
}

function subscribeToComments() {
    if (commentChannel) commentChannel.unsubscribe();

    commentChannel = supabaseClient.channel('realtime:city_comments')
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'city_comments'
        }, payload => {
            renderComment(payload.new);
        })
        .on('postgres_changes', {
            event: 'DELETE',
            schema: 'public',
            table: 'city_comments'
        }, payload => {
            removeCommentFromDOM(payload.old.id);
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

    const { data, error } = await supabaseClient
        .from('city_posts')
        .insert([{
            city_name: currentCity,
            nickname: currentNickname,
            title: title,
            content: content
        }])
        .select();

    if (error) {
        console.error('게시글 등록 실패:', error);
        alert('등록에 실패했습니다.');
    } else if (data && data[0]) {
        // 내 글 ID 저장
        myPostIds.push(data[0].id);
        localStorage.setItem('my_post_ids', JSON.stringify(myPostIds));

        elements.postTitle.value = '';
        elements.postContent.value = '';
        switchView('board');
    }

    document.getElementById('submit-post').disabled = false;
}

async function deletePost(postId) {
    if (!confirm('정말 이 게시글을 삭제하시겠습니까?')) return;

    const { error } = await supabaseClient
        .from('city_posts')
        .delete()
        .eq('id', postId);

    if (error) {
        console.error('삭제 실패:', error);
        alert('삭제에 실패했습니다.');
    }
}

async function saveComment(postId) {
    const input = document.querySelector(`#post-${postId} .comment-input`);
    const content = input.value.trim();

    if (!content) return;

    const { data, error } = await supabaseClient
        .from('city_comments')
        .insert([{
            post_id: postId,
            nickname: currentNickname,
            content: content
        }])
        .select();

    if (error) {
        console.error('댓글 등록 실패:', error);
        alert('댓글 등록에 실패했습니다.');
    } else if (data && data[0]) {
        myCommentIds.push(data[0].id);
        localStorage.setItem('my_comment_ids', JSON.stringify(myCommentIds));
        input.value = '';
    }
}

async function deleteComment(commentId) {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;

    const { error } = await supabaseClient
        .from('city_comments')
        .delete()
        .eq('id', commentId);

    if (error) {
        console.error('댓글 삭제 실패:', error);
        alert('삭제에 실패했습니다.');
    }
}

async function fetchComments(postId) {
    const { data, error } = await supabaseClient
        .from('city_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('댓글 로드 실패:', error);
        return;
    }

    const container = document.querySelector(`#post-${postId} .comment-list`);
    if (container) {
        container.innerHTML = '';
        data.forEach(comment => renderComment(comment));
    }
}

function appendPost(post) {
    // 이미 존재하는 글인지 확인 (중복 방지)
    if (document.getElementById(`post-${post.id}`)) return;

    const isMine = myPostIds.includes(post.id);
    const card = document.createElement('div');
    card.className = 'post-card';
    card.id = `post-${post.id}`;
    card.innerHTML = `
        ${isMine ? `<button class="delete-btn" onclick="deletePost('${post.id}')"><i class="fas fa-trash-can"></i></button>` : ''}
        <h4>${post.title}</h4>
        <p>${post.content}</p>
        <div class="post-meta">
            <span class="meta-nickname">${post.nickname}</span>
            <span class="meta-time">${new Date(post.created_at).toLocaleDateString()}</span>
        </div>
        <div class="comment-section">
            <div class="comment-list"></div>
            <div class="comment-input-wrapper">
                <input type="text" class="comment-input" placeholder="댓글을 입력하세요..." onkeypress="if(event.key==='Enter') saveComment('${post.id}')">
                <button class="comment-submit-btn" onclick="saveComment('${post.id}')">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>
    `;
    // 최신 글이 위로 오도록 prepend
    elements.postContainer.prepend(card);

    // 댓글 불러오기
    fetchComments(post.id);
}

function renderComment(comment) {
    const postEl = document.getElementById(`post-${comment.post_id}`);
    if (!postEl) return;

    const container = postEl.querySelector('.comment-list');
    if (!container || document.getElementById(`comment-${comment.id}`)) return;

    const isMine = myCommentIds.includes(comment.id);
    const item = document.createElement('div');
    item.className = 'comment-item';
    item.id = `comment-${comment.id}`;
    item.innerHTML = `
        <div class="comment-header">
            <span class="comment-nickname">${comment.nickname}</span>
            <span class="comment-date">${new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div class="comment-content">${comment.content}</div>
        ${isMine ? `<button class="comment-delete-btn" onclick="deleteComment('${comment.id}')"><i class="fas fa-trash-can"></i></button>` : ''}
    `;
    container.appendChild(item);
}

function removeCommentFromDOM(commentId) {
    const el = document.getElementById(`comment-${commentId}`);
    if (el) el.remove();
}

function removePostFromDOM(postId) {
    const el = document.getElementById(`post-${postId}`);
    if (el) el.remove();
}

// --- 이벤트 리스너 ---

// 로비: 도시 선택
elements.cityCards.forEach(card => {
    card.addEventListener('click', () => enterCityBoard(card.dataset.city));
});

// 게시판: 뒤로가기
document.getElementById('back-to-lobby').addEventListener('click', () => {
    if (boardChannel) boardChannel.unsubscribe();
    if (commentChannel) commentChannel.unsubscribe();
    switchView('lobby');
});

// 게시판: 작성 버튼
document.getElementById('write-btn').addEventListener('click', () => switchView('write'));

// 작성: 취소 버튼
document.getElementById('close-write').addEventListener('click', () => switchView('board'));

// 작성: 등록 버튼
document.getElementById('submit-post').addEventListener('click', savePost);
