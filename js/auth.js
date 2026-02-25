import { supabaseClient } from './supabaseClient.js';
import { elements, switchView } from './ui.js';

export const authState = {
    currentNickname: '익명 여행자',
    user: null
};

export function setNickname(name) {
    authState.currentNickname = name || '익명 여행자';
}

export async function initAuth() {
    console.log('initAuth 시작...');
    supabaseClient.auth.onAuthStateChange((event, session) => {
        console.log('Auth 상태 변경:', event, session);
        if (session) {
            authState.user = session.user;
            // 닉네임 기본값을 이메일 앞부분으로 설정 (Welcome 화면에서 확인 가능하도록)
            const defaultNick = session.user.email.split('@')[0];
            elements.nicknameInput.value = defaultNick;
            authState.currentNickname = defaultNick;

            // 로그인 성공 시 닉네임 설정 화면으로 이동
            switchView('welcome');
        } else {
            switchView('login');
        }
    });

    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session) {
            authState.user = session.user;
            const defaultNick = session.user.email.split('@')[0];
            elements.nicknameInput.value = defaultNick;
            authState.currentNickname = defaultNick;
            switchView('welcome');
        } else {
            switchView('login');
        }
    } catch (err) {
        console.error('세션 확인 중 오류:', err);
    }
}

export async function sendOTP() {
    const email = elements.emailInput.value.trim();
    if (!email) {
        alert('이메일을 입력해주세요.');
        return;
    }

    try {
        elements.sendOtpBtn.disabled = true;
        elements.sendOtpBtn.textContent = '발송 중...';

        const { error } = await supabaseClient.auth.signInWithOtp({
            email: email,
            options: {
                shouldCreateUser: true,
                emailRedirectTo: window.location.origin
            }
        });

        if (error) {
            elements.statusMsg.textContent = '발송 실패: ' + error.message;
            elements.statusMsg.className = 'status-msg error';
            elements.sendOtpBtn.disabled = false;
            elements.sendOtpBtn.textContent = '로그인 링크 받기';
        } else {
            elements.statusMsg.textContent = '이메일로 로그인 링크가 전송되었습니다. 확인 후 클릭해주세요!';
            elements.statusMsg.className = 'status-msg success';
            elements.sendOtpBtn.textContent = '링크 재전송';
            elements.sendOtpBtn.disabled = false;
        }
    } catch (err) {
        console.error('sendOTP 오류:', err);
        elements.sendOtpBtn.disabled = false;
    }
}
