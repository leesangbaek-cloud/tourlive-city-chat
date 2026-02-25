export const authState = {
    currentNickname: '익명 여행자'
};

export function setNickname(name) {
    authState.currentNickname = name || '익명 여행자';
}
