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
    console.log('sendOTP 호출됨');
    const email = elements.emailInput.value.trim();
    if (!email) {
        alert('이메일을 입력해주세요.');
        return;
    }

    try {
        console.log('OTP 발송 시도:', email);
        elements.sendOtpBtn.disabled = true;
        elements.sendOtpBtn.textContent = '발송 중...';

        const { error } = await supabaseClient.auth.signInWithOtp({
            email: email,
            options: { shouldCreateUser: true }
        });

        if (error) {
            console.error('Supabase OTP 발송 에러:', error);
            alert('인증번호 발송 실패: ' + error.message);
            elements.sendOtpBtn.disabled = false;
            elements.sendOtpBtn.textContent = '인증번호 받기';
        } else {
            console.log('OTP 발송 성공');
            alert('인증번호가 이메일로 발송되었습니다.');
            elements.emailSection.classList.add('hidden');
            elements.otpSection.classList.remove('hidden');
        }
    } catch (err) {
        console.error('sendOTP 내부 오류:', err);
        alert('예기치 못한 오류가 발생했습니다: ' + err.message);
        elements.sendOtpBtn.disabled = false;
        elements.sendOtpBtn.textContent = '인증번호 받기';
    }
}

export async function verifyOTP() {
    console.log('verifyOTP 호출됨');
    const email = elements.emailInput.value.trim();
    const token = elements.otpInput.value.trim();

    if (!token || token.length !== 6) {
        alert('6자리 인증번호를 입력해주세요.');
        return;
    }

    try {
        elements.verifyOtpBtn.disabled = true;
        elements.verifyOtpBtn.textContent = '인증 중...';

        console.log('OTP 검증 시도:', email, token);
        const { error } = await supabaseClient.auth.verifyOtp({
            email,
            token,
            type: 'signup'
        });

        if (error) {
            console.log('Signup 타입 검증 실패, Login 타입으로 재시도...');
            const { error: retryError } = await supabaseClient.auth.verifyOtp({
                email,
                token,
                type: 'login'
            });

            if (retryError) {
                console.error('OTP 최종 검증 실패:', retryError);
                alert('인증 실패: ' + retryError.message);
                elements.verifyOtpBtn.disabled = false;
                elements.verifyOtpBtn.textContent = '인증 완료';
                return;
            }
        }
        console.log('OTP 검증 성공');
        alert('인증이 완료되었습니다!');
    } catch (err) {
        console.error('verifyOTP 내부 오류:', err);
        alert('검증 중 오류 발생: ' + err.message);
        elements.verifyOtpBtn.disabled = false;
        elements.verifyOtpBtn.textContent = '인증 완료';
    }
}
