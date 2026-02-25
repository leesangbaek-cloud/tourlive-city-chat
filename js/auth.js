import { supabaseClient } from './supabaseClient.js';
import { elements, switchView } from './ui.js';

export const authState = {
    currentNickname: '익명 여행자',
    user: null,
    isGuest: false
};

export function setNickname(name) {
    authState.currentNickname = name || '익명 여행자';
}

export async function initAuth() {
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (session) {
            authState.user = session.user;
            authState.isGuest = false;
            // 닉네임 입력란에 이메일을 이용한 기본값 제안
            const defaultNick = session.user.email.split('@')[0];
            if (!elements.nicknameInput.value) {
                elements.nicknameInput.value = defaultNick;
            }
            authState.currentNickname = elements.nicknameInput.value || defaultNick;
            switchView('welcome');
        } else {
            switchView('login');
        }
    });

    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        authState.user = session.user;
        authState.isGuest = false;
        switchView('welcome');
    } else {
        switchView('login');
    }
}

export async function sendMagicLink() {
    const email = elements.emailInput.value.trim();
    if (!email) return alert('이메일을 입력해주세요.');

    try {
        elements.magicLinkBtn.disabled = true;
        elements.magicLinkBtn.textContent = '발송 중...';
        elements.statusMsg.textContent = '';

        const { error } = await supabaseClient.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: window.location.origin
            }
        });

        if (error) throw error;

        elements.statusMsg.innerHTML = '이메일로 로그인 링크가 전송되었습니다.<br>확인 후 클릭해 주세요!';
        elements.statusMsg.className = 'status-msg success';
        elements.magicLinkBtn.textContent = '링크 다시 보내기';
    } catch (err) {
        console.error('매직링크 발송 실패:', err);
        let msg = '발송 실패: ' + err.message;

        if (err.message.includes('Error sending magic link email')) {
            msg = '발송 실패: 슈파베이스 이메일 한도(시간당 3회) 초과 또는 SMTP 설정 오류입니다.';
        }

        elements.statusMsg.textContent = msg;
        elements.statusMsg.className = 'status-msg error';
        elements.magicLinkBtn.textContent = '로그인 링크 받기';
    } finally {
        elements.magicLinkBtn.disabled = false;
    }
}
