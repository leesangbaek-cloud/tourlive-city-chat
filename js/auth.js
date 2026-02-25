import { supabaseClient } from './supabaseClient.js';
import { elements, switchView, getCityDisplayName } from './ui.js';

export const authState = {
    currentNickname: ''
};

export async function initAuth() {
    console.log('initAuth 시작...');
    supabaseClient.auth.onAuthStateChange((event, session) => {
        console.log('Auth 상태 변경:', event, session);
        if (session) {
            authState.currentNickname = session.user.email.split('@')[0];
            elements.nicknameInput.value = authState.currentNickname;
            switchView('lobby');
        } else {
            switchView('login');
        }
    });

    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        console.log('현재 세션:', session);
        if (session) {
            authState.currentNickname = session.user.email.split('@')[0];
            elements.nicknameInput.value = authState.currentNickname;
            switchView('lobby');
        }
    } catch (err) {
        console.error('세션 확인 중 오류:', err);
    }
}

export async function sendOTP() {
    console.log('Magic Link 발송 호출됨');
    const email = elements.emailInput.value.trim();
    if (!email) {
        alert('이메일을 입력해주세요.');
        return;
    }

    try {
        console.log('Magic Link 발송 시도:', email);
        elements.sendOtpBtn.disabled = true;
        elements.sendOtpBtn.textContent = '발송 중...';

        const { error } = await supabaseClient.auth.signInWithOtp({
            email: email,
            options: {
                shouldCreateUser: true,
                emailRedirectTo: window.location.origin // 배포된 도메인으로 리다이렉트
            }
        });

        if (error) {
            console.error('Supabase Magic Link 발송 에러:', error);
            elements.statusMsg.textContent = '발송 실패: ' + error.message;
            elements.statusMsg.className = 'status-msg error';
            elements.sendOtpBtn.disabled = false;
            elements.sendOtpBtn.textContent = '로그인 링크 받기';
        } else {
            console.log('Magic Link 발송 성공');
            elements.statusMsg.textContent = '이메일로 로그인 링크가 전송되었습니다. 이메일을 확인해주세요!';
            elements.statusMsg.className = 'status-msg success';
            elements.sendOtpBtn.textContent = '링크 재전송';
            elements.sendOtpBtn.disabled = false;
        }
    } catch (err) {
        console.error('sendOTP 내부 오류:', err);
        alert('예기치 못한 오류가 발생했습니다: ' + err.message);
        elements.sendOtpBtn.disabled = false;
        elements.sendOtpBtn.textContent = '로그인 링크 받기';
    }
}

// verifyOTP 함수 제거 (매직링크는 링크 클릭 시 자동으로 처리됨)
