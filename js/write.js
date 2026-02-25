import { supabaseClient } from './supabaseClient.js';
import { elements, switchView } from './ui.js';
import { currentCity, myPostIds } from './board.js';
import { authState } from './auth.js';

export async function savePost() {
    if (authState.isGuest) {
        alert('로그인이 필요한 기능입니다.');
        return;
    }
    const title = elements.postTitle.value.trim();
    const content = elements.postContent.value.trim();

    if (!title || !content) {
        alert('제목과 내용을 입력해주세요.');
        return;
    }

    elements.submitPostBtn.disabled = true;

    const { data, error } = await supabaseClient
        .from('city_posts')
        .insert([{
            city_name: currentCity,
            nickname: authState.currentNickname,
            title: title,
            content: content
        }])
        .select();

    if (error) {
        console.error('등록 실패:', error);
        alert('등록 실패: ' + error.message + '\nRLS 정책이 authenticated 유저에게 허용되어 있는지 확인해주세요.');
    } else if (data && data[0]) {
        myPostIds.push(data[0].id);
        localStorage.setItem('my_post_ids', JSON.stringify(myPostIds));
        elements.postTitle.value = '';
        elements.postContent.value = '';
        switchView('board');
    }
    elements.submitPostBtn.disabled = false;
}
