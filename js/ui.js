export const views = {
    login: document.getElementById('login-view'),
    lobby: document.getElementById('lobby-view'),
    board: document.getElementById('board-view'),
    write: document.getElementById('write-view')
};

export const elements = {
    emailInput: document.getElementById('email-input'),
    otpInput: document.getElementById('otp-input'),
    emailSection: document.getElementById('email-section'),
    otpSection: document.getElementById('otp-section'),
    sendOtpBtn: document.getElementById('send-otp-btn'),
    verifyOtpBtn: document.getElementById('verify-otp-btn'),
    nicknameInput: document.getElementById('nickname-input'),
    cityNameDisplay: document.getElementById('current-city-name'),
    postContainer: document.getElementById('post-container'),
    postTitle: document.getElementById('post-title'),
    postContent: document.getElementById('post-content'),
    cityCards: document.querySelectorAll('.city-card'),
    backToLobbyBtn: document.getElementById('back-to-lobby'),
    writeTriggerBtn: document.getElementById('write-btn'),
    closeWriteBtn: document.getElementById('close-write'),
    submitPostBtn: document.getElementById('submit-post')
};

export function switchView(viewName) {
    Object.keys(views).forEach(key => {
        if (views[key]) views[key].classList.add('hidden');
    });
    if (views[viewName]) views[viewName].classList.remove('hidden');
}

export function getCityDisplayName(cityId) {
    const names = { 'Paris': '파리', 'Rome': '로마', 'Florence': '피렌체', 'Barcelona': '바르셀로나' };
    return names[cityId] || cityId;
}
