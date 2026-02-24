// Supabase Configuration
const SUPABASE_URL = 'https://vxfkpbbdikxoqoohuyen.supabase.co';
const SUPABASE_KEY = 'sb_publishable_7Zkb2m4twe2X1i8NMmIViA_RAYE5bYS'; // 기존 키 재사용
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// State
let currentNickname = '';
let currentCity = '';
let chatChannel = null;

// DOM Elements
const lobbyView = document.getElementById('lobby-view');
const chatView = document.getElementById('chat-view');
const nicknameInput = document.getElementById('nickname-input');
const messageInput = document.getElementById('message-input');
const messageContainer = document.getElementById('message-container');
const sendBtn = document.getElementById('send-btn');
const backBtn = document.getElementById('back-btn');
const exitBtn = document.getElementById('exit-btn');
const currentCityNameDisplay = document.getElementById('current-city-name');
const cityCards = document.querySelectorAll('.city-card');

// --- Navigation Logic ---

function showLobby() {
    if (chatChannel) {
        chatChannel.unsubscribe();
        chatChannel = null;
    }
    chatView.classList.add('hidden');
    lobbyView.classList.remove('hidden');
    currentCity = '';
}

async function joinChat(cityName) {
    currentNickname = nicknameInput.value.trim() || '익명 여행자';
    currentCity = cityName;

    // UI Update
    currentCityNameDisplay.textContent = getCityDisplayName(cityName);
    messageContainer.innerHTML = ''; // Clear previous messages
    lobbyView.classList.add('hidden');
    chatView.classList.remove('hidden');

    // Load existing messages
    await fetchMessages();

    // Subscribe to Realtime
    subscribeToCity();
}

function getCityDisplayName(cityId) {
    const names = {
        'Paris': '파리',
        'Rome': '로마',
        'Florence': '피렌체',
        'Barcelona': '바르셀로나'
    };
    return names[cityId] || cityId;
}

// --- Chat Logic ---

async function fetchMessages() {
    const { data, error } = await supabaseClient
        .from('city_chats')
        .select('*')
        .eq('city_name', currentCity)
        .order('created_at', { ascending: true })
        .limit(50);

    if (error) {
        console.error('Error fetching messages:', error);
        return;
    }

    data.forEach(msg => appendMessage(msg));
}

function subscribeToCity() {
    chatChannel = supabaseClient.channel(`public:city_chats:city_name=eq.${currentCity}`)
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'city_chats',
            filter: `city_name=eq.${currentCity}`
        }, payload => {
            appendMessage(payload.new);
        })
        .subscribe();
}

async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;

    messageInput.value = '';
    sendBtn.disabled = true;

    const { error } = await supabaseClient
        .from('city_chats')
        .insert([{
            city_name: currentCity,
            nickname: currentNickname,
            message: text
        }]);

    if (error) {
        console.error('Error sending message:', error);
        alert('메시지 전송에 실패했습니다.');
    }

    sendBtn.disabled = false;
    messageInput.focus();
}

function appendMessage(msg) {
    const isMe = msg.nickname === currentNickname;
    const messageEl = document.createElement('div');
    messageEl.className = `message ${isMe ? 'me' : 'other'}`;

    const infoEl = document.createElement('div');
    infoEl.className = 'msg-info';
    infoEl.textContent = `${msg.nickname} • ${new Date(msg.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`;

    const bubbleEl = document.createElement('div');
    bubbleEl.className = 'bubble';
    bubbleEl.textContent = msg.message;

    messageEl.appendChild(infoEl);
    messageEl.appendChild(bubbleEl);
    messageContainer.appendChild(messageEl);

    // Scroll to bottom
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

// --- Event Listeners ---

cityCards.forEach(card => {
    card.addEventListener('click', () => {
        const city = card.dataset.city;
        joinChat(city);
    });
});

sendBtn.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

backBtn.addEventListener('click', showLobby);
exitBtn.addEventListener('click', showLobby);

// Initialize with a simple animation effect (Optional)
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});
