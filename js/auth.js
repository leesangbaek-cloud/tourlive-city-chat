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
    supabaseClient.auth.onAuthStateChange((event, session) => {
        console.log('Auth 상태 변경:', event, session);
        if (session) {
            authState.user = session.user;
            if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
                const defaultNick = session.user.email.split('@')[0];
                elements.nicknameInput.value = defaultNick;
                authState.currentNickname = defaultNick;
                switchView('welcome');
            }
        } else if (event === 'PASSWORD_RECOVERY') {
            // 비밀번호 재설정 모드 진입 시 로직 (필요 시 확장)
            alert('비밀번호 재설정 링크가 확인되었습니다. 새로운 비밀번호를 입력해 주세요.');
        } else {
            switchView('login');
        }
    });

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
}

// 1. 회원가입 (Confirm Sign up 메일 발송)
export async function signUp() {
    const email = elements.emailInput.value.trim();
    const password = elements.passwordInput.value.trim();
    if (!email || !password) return alert('이메일과 비밀번호를 입력해주세요.');

    try {
        const { error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: window.location.origin }
        });
        if (error) throw error;
        showStatus('가입 확인 이메일을 발송했습니다. 메일을 확인하고 링크를 클릭해 주세요!', 'success');
    } catch (err) {
        showStatus('가입 실패: ' + err.message, 'error');
    }
}

// 2. 로그인 (이메일/비밀번호)
export async function signIn() {
    const email = elements.emailInput.value.trim();
    const password = elements.passwordInput.value.trim();
    if (!email || !password) return alert('이메일과 비밀번호를 입력해주세요.');

    try {
        const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;
    } catch (err) {
        showStatus('로그인 실패: ' + err.message, 'error');
    }
}

// 3. 매직링크 (비밀번호 없이 로그인)
export async function sendMagicLink() {
    const email = elements.emailInput.value.trim();
    if (!email) return alert('이메일을 입력해주세요.');

    try {
        const { error } = await supabaseClient.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: window.location.origin }
        });
        if (error) throw error;
        showStatus('매직링크를 발송했습니다. 이메일을 확인해 주세요!', 'success');
    } catch (err) {
        showStatus('발송 실패: ' + err.message, 'error');
    }
}

// 4. 비밀번호 재설정
export async function resetPassword() {
    const email = elements.emailInput.value.trim();
    if (!email) return alert('이메일을 입력해주세요.');

    try {
        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin
        });
        if (error) throw error;
        showStatus('비밀번호 재설정 메일을 발송했습니다.', 'success');
    } catch (err) {
        showStatus('발송 실패: ' + err.message, 'error');
    }
}

function showStatus(msg, type) {
    elements.statusMsg.textContent = msg;
    elements.statusMsg.className = `status-msg ${type}`;
}
