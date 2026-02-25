import { supabaseClient } from './supabaseClient.js';
import { elements, switchView, getCityDisplayName } from './ui.js';
import { authState, setNickname } from './auth.js';

export let currentCity = '';
export let boardChannel = null;
export let commentChannel = null;
export let myPostIds = JSON.parse(localStorage.getItem('my_post_ids') || '[]');
export let myCommentIds = JSON.parse(localStorage.getItem('my_comment_ids') || '[]');

export async function enterCityBoard(cityName) {
    // 닉네임 설정 (입력값 없으면 기본값 사용)
    setNickname(elements.nicknameInput.value.trim());

    currentCity = cityName;
    elements.cityNameDisplay.textContent = getCityDisplayName(cityName);
    elements.postContainer.innerHTML = '';
    switchView('board');

    await fetchPosts();
    subscribeToBoard();
    subscribeToComments();

    // 게시글과 댓글 테이블의 변화를 실시간으로 감지하여 좋아요/싫어요 수도 갱신되도록 처리
    subscribeToVotes();
}

export function subscribeToVotes() {
    // 게시글 투표 수 실시간 갱신
    supabaseClient.channel('realtime:city_posts_votes')
        .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'city_posts'
        }, payload => updateVoteUI('post', payload.new))
        .subscribe();

    // 댓글 투표 수 실시간 갱신
    supabaseClient.channel('realtime:city_comments_votes')
        .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'city_comments'
        }, payload => updateVoteUI('comment', payload.new))
        .subscribe();
}

function updateVoteUI(type, item) {
    const el = document.getElementById(`${type}-${item.id}`);
    if (!el) return;
    const likeCount = el.querySelector(`.like-count`);
    const dislikeCount = el.querySelector(`.dislike-count`);
    if (likeCount) likeCount.textContent = item.likes || 0;
    if (dislikeCount) dislikeCount.textContent = item.dislikes || 0;
}

export async function fetchPosts() {
    const { data, error } = await supabaseClient
        .from('city_posts')
        .select('*')
        .eq('city_name', currentCity)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('게시글 로드 실패:', error);
        return;
    }
    data.forEach(post => appendPost(post));
}

export function subscribeToBoard() {
    if (boardChannel) boardChannel.unsubscribe();
    boardChannel = supabaseClient.channel(`realtime:city_posts:${currentCity}`)
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'city_posts',
            filter: `city_name=eq.${currentCity}`
        }, payload => appendPost(payload.new))
        .on('postgres_changes', {
            event: 'DELETE',
            schema: 'public',
            table: 'city_posts'
        }, payload => removePostFromDOM(payload.old.id))
        .subscribe();
}

export function subscribeToComments() {
    if (commentChannel) commentChannel.unsubscribe();
    commentChannel = supabaseClient.channel('realtime:city_comments')
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'city_comments'
        }, payload => renderComment(payload.new))
        .on('postgres_changes', {
            event: 'DELETE',
            schema: 'public',
            table: 'city_comments'
        }, payload => removeCommentFromDOM(payload.old.id))
        .subscribe();
}

export function appendPost(post) {
    if (document.getElementById(`post-${post.id}`)) return;
    const isMine = myPostIds.includes(post.id);
    const card = document.createElement('div');
    card.className = 'post-card';
    card.id = `post-${post.id}`;
    card.innerHTML = `
        ${isMine ? `<button class="delete-btn" onclick="window.app.deletePost('${post.id}')"><i class="fas fa-trash-can"></i></button>` : ''}
        <h4>${post.title}</h4>
        <p>${post.content}</p>
        <div class="post-meta">
            <span class="meta-nickname">${post.nickname}</span>
            <span class="meta-time">${new Date(post.created_at).toLocaleDateString()}</span>
        </div>
        <div class="vote-section">
            <button class="vote-btn like ${hasVoted(post.id, 'like') ? 'active' : ''}" onclick="window.app.handleVote('post', '${post.id}', 'like')">
                <i class="fa-regular fa-thumbs-up"></i> <span class="like-count">${post.likes || 0}</span>
            </button>
            <button class="vote-btn dislike ${hasVoted(post.id, 'dislike') ? 'active' : ''}" onclick="window.app.handleVote('post', '${post.id}', 'dislike')">
                <i class="fa-regular fa-thumbs-down"></i> <span class="dislike-count">${post.dislikes || 0}</span>
            </button>
        </div>
        <div class="comment-section">
            <div class="comment-list"></div>
            ${!authState.isGuest ? `
            <div class="comment-input-wrapper">
                <input type="text" class="comment-input" placeholder="댓글을 입력하세요..." onkeypress="if(event.key==='Enter') window.app.saveComment('${post.id}')">
                <button class="comment-submit-btn" onclick="window.app.saveComment('${post.id}')">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
            ` : '<p class="guest-info">댓글을 작성하려면 로그인이 필요합니다.</p>'}
        </div>
    `;
    elements.postContainer.prepend(card);
    fetchComments(post.id);
}

// ... existing comment logic refactored for exports
export async function deletePost(postId) {
    if (!confirm('정말 이 게시글을 삭제하시겠습니까?')) return;
    const { error } = await supabaseClient.from('city_posts').delete().eq('id', postId);
    if (error) alert('삭제 실패');
}

export async function saveComment(postId) {
    if (authState.isGuest) {
        alert('로그인이 필요한 기능입니다.');
        return;
    }
    const input = document.querySelector(`#post-${postId} .comment-input`);
    const content = input.value.trim();
    if (!content) return;
    const { data, error } = await supabaseClient.from('city_comments').insert([{
        post_id: postId, nickname: authState.currentNickname, content
    }]).select();
    if (error) alert('댓글 등록 실패');
    else if (data && data[0]) {
        myCommentIds.push(data[0].id);
        localStorage.setItem('my_comment_ids', JSON.stringify(myCommentIds));
        input.value = '';
    }
}

export async function deleteComment(commentId) {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;
    const { error } = await supabaseClient.from('city_comments').delete().eq('id', commentId);
    if (error) alert('댓글 삭제 실패');
}

export async function fetchComments(postId) {
    const { data, error } = await supabaseClient.from('city_comments')
        .select('*').eq('post_id', postId).order('created_at', { ascending: true });
    if (!error) {
        const container = document.querySelector(`#post-${postId} .comment-list`);
        if (container) {
            container.innerHTML = '';
            data.forEach(comment => renderComment(comment));
        }
    }
}

export function renderComment(comment) {
    const postEl = document.getElementById(`post-${comment.post_id}`);
    if (!postEl) return;
    const container = postEl.querySelector('.comment-list');
    if (!container || document.getElementById(`comment-${comment.id}`)) return;
    const isMine = myCommentIds.includes(comment.id);
    const item = document.createElement('div');
    item.className = 'comment-item';
    item.id = `comment-${comment.id}`;
    item.innerHTML = `
        <div class="comment-header"><span class="comment-nickname">${comment.nickname}</span></div>
        <div class="comment-content">${comment.content}</div>
        <div class="vote-section small">
            <button class="vote-btn like ${hasVoted(comment.id, 'like') ? 'active' : ''}" onclick="window.app.handleVote('comment', '${comment.id}', 'like')">
                <i class="fa-regular fa-thumbs-up"></i> <span class="like-count">${comment.likes || 0}</span>
            </button>
            <button class="vote-btn dislike ${hasVoted(comment.id, 'dislike') ? 'active' : ''}" onclick="window.app.handleVote('comment', '${comment.id}', 'dislike')">
                <i class="fa-regular fa-thumbs-down"></i> <span class="dislike-count">${comment.dislikes || 0}</span>
            </button>
        </div>
        ${isMine ? `<button class="comment-delete-btn" onclick="window.app.deleteComment('${comment.id}')"><i class="fas fa-trash-can"></i></button>` : ''}
    `;
    container.appendChild(item);
}

function removePostFromDOM(id) { document.getElementById(`post-${id}`)?.remove(); }
function removeCommentFromDOM(id) { document.getElementById(`comment-${id}`)?.remove(); }

// --- 투표(좋아요/싫어요) 로직 ---

function hasVoted(itemId, type) {
    const votes = JSON.parse(localStorage.getItem('my_votes') || '{}');
    return votes[itemId] === type;
}

export async function handleVote(itemType, itemId, voteType) {
    const votes = JSON.parse(localStorage.getItem('my_votes') || '{}');
    const table = itemType === 'post' ? 'city_posts' : 'city_comments';

    if (votes[itemId]) {
        alert('이미 투표하셨습니다!');
        return;
    }

    // 현재 수치 가져오기
    const { data: currentData, error: fetchError } = await supabaseClient
        .from(table)
        .select('likes, dislikes')
        .eq('id', itemId)
        .single();

    if (fetchError || !currentData) {
        console.error('투표 수치 조회 실패:', fetchError);
        return;
    }

    const updateData = {};
    if (voteType === 'like') {
        updateData.likes = (currentData.likes || 0) + 1;
    } else {
        updateData.dislikes = (currentData.dislikes || 0) + 1;
    }

    const { error: updateError } = await supabaseClient
        .from(table)
        .update(updateData)
        .eq('id', itemId);

    if (updateError) {
        console.error('투표 반영 실패:', updateError);
        alert('투표에 실패했습니다. (DB 설정 확인 필요)');
    } else {
        votes[itemId] = voteType;
        localStorage.setItem('my_votes', JSON.stringify(votes));

        // UI 즉시 반영 (실시간 구독과 별개로 사용자 경험 개선)
        const el = document.getElementById(`${itemType}-${itemId}`);
        const btn = el.querySelector(`.vote-btn.${voteType}`);
        const countEl = btn.querySelector(`.${voteType}-count`);
        btn.classList.add('active');
        countEl.textContent = updateData[voteType + 's'];
    }
}
