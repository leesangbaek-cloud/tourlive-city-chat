import { supabaseClient } from './supabaseClient.js';
import { elements, switchView } from './ui.js';

export let currentNickname = '';

export async function initAuth() {
    supabaseClient.auth.onAuthStateChange((event, session) => {
        console.log('Auth Event:', event, session);
        if (session) {
            currentNickname = session.user.email.split('@')[0];
            elements.nicknameInput.value = currentNickname;
            switchView('lobby');
        } else {
            switchView('login');
        }
    });

    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
        currentNickname = session.user.email.split('@')[0];
        elements.nicknameInput.value = currentNickname;
        switchView('lobby');
    }
}

export async function sendOTP() {
    const email = elements.emailInput.value.trim();
    if (!email) {
        alert('이메일을 입력해주세요.');
        return;
    }

    elements.sendOtpBtn.disabled = true;
    elements.sendOtpBtn.textContent = '발송 중...';

    const { error } = await supabaseClient.auth.signInWithOtp({
        email: email,
        options: { shouldCreateUser: true }
    });

    if (error) {
        alert('인증번호 발송 실패: ' + error.message);
        elements.sendOtpBtn.disabled = false;
        elements.sendOtpBtn.textContent = '인증번호 받기';
    } else {
        alert('인증번호가 이메일로 발송되었습니다.');
        elements.emailSection.classList.add('hidden');
        elements.otpSection.classList.remove('hidden');
    }
}

export async function verifyOTP() {
    const email = elements.emailInput.value.trim();
    const token = elements.otpInput.value.trim();

    if (!token || token.length !== 6) {
        alert('6자리 인증번호를 입력해주세요.');
        return;
    }

    elements.verifyOtpBtn.disabled = true;
    elements.verifyOtpBtn.textContent = '인증 중...';

    const { error } = await supabaseClient.auth.verifyOtp({
        email,
        token,
        type: 'signup'
    });

    if (error) {
        const { error: retryError } = await supabaseClient.auth.verifyOtp({
            email,
            token,
            type: 'login'
        });

        if (retryError) {
            alert('인증 실패: ' + retryError.message);
            elements.verifyOtpBtn.disabled = false;
            elements.verifyOtpBtn.textContent = '인증 완료';
            return;
        }
    }
    alert('인증이 완료되었습니다!');
}
