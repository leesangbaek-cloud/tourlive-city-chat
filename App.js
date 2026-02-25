import { elements, switchView } from './js/ui.js';
import { initAuth, sendOTP, verifyOTP } from './js/auth.js';
import { enterCityBoard, boardChannel, commentChannel, deletePost, saveComment, deleteComment } from './js/board.js';
import { savePost } from './js/write.js';

// --- 전역 브릿지 (HTML onclick/onkeypress 대응) ---
window.app = {
    deletePost,
    saveComment,
    deleteComment
};

// --- 이벤트 리스너 설정 ---

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

// 로그인 관련 이벤트
elements.sendOtpBtn.addEventListener('click', sendOTP);
elements.verifyOtpBtn.addEventListener('click', verifyOTP);

// --- 앱 초기화 ---
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
});
