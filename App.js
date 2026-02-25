import { elements, switchView } from './js/ui.js';
import { initAuth, sendMagicLink } from './js/auth.js';
import { enterCityBoard, boardChannel, commentChannel, deletePost, saveComment, deleteComment, handleVote } from './js/board.js';
import { savePost } from './js/write.js';

// --- 전역 브릿지 (HTML onclick/onkeypress 대응) ---
window.app = {
    deletePost,
    saveComment,
    deleteComment,
    handleVote
};

// --- 이벤트 리스너 설정 ---

// 로그인: 매직링크 발송
elements.magicLinkBtn.addEventListener('click', sendMagicLink);

// 로그인: 게스트 입장 (임시)
elements.guestLoginBtn.addEventListener('click', () => {
    switchView('welcome');
});

// 로비: 시작하기 (닉네임 설정 후 도시 선택으로)
elements.startBtn.addEventListener('click', () => {
    const nick = elements.nicknameInput.value.trim();
    if (!nick) {
        alert('닉네임을 입력해주세요!');
        return;
    }
    switchView('lobby');
});

// 로비: 도시 선택
elements.cityCards.forEach(card => {
    card.addEventListener('click', () => enterCityBoard(card.dataset.city));
});

// 게시판: 뒤로가기
elements.backToLobbyBtn.addEventListener('click', () => {
    if (boardChannel) boardChannel.unsubscribe();
    if (commentChannel) commentChannel.unsubscribe();
    switchView('lobby');
});

// 게시판: 작성 버튼
elements.writeTriggerBtn.addEventListener('click', () => switchView('write'));

// 작성: 취소 버튼
elements.closeWriteBtn.addEventListener('click', () => switchView('board'));

// 작성: 등록 버튼
elements.submitPostBtn.addEventListener('click', savePost);

// --- 앱 초기화 ---
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
});
