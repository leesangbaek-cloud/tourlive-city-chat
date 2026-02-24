const baseInput = document.getElementById('baseInput');
const currencySelect = document.getElementById('currencySelect');
const currencyUnit = document.getElementById('currencyUnit');
const resultText = document.getElementById('resultText');
const rateInfo = document.getElementById('rateInfo');
const convertBtn = document.getElementById('convertBtn');

const SUPABASE_URL = 'https://vxfkpbbdikxoqoohuyen.supabase.co';
const SUPABASE_KEY = 'sb_publishable_7Zkb2m4twe2X1i8NMmIViA_RAYE5bYS';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentRate = null;

const currencyData = {
    'EUR': { symbol: '€', name: '유로' },
    'USD': { symbol: '$', name: '달러' },
    'JPY': { symbol: '¥', name: '엔' },
    'CNY': { symbol: '¥', name: '위안' },
    'HKD': { symbol: 'HK$', name: '홍콩 달러' },
    'SGD': { symbol: 'S$', name: '싱가포르 달러' },
    'MYR': { symbol: 'RM', name: '링킷' },
    'TWD': { symbol: 'NT$', name: '대만 달러' },
    'THB': { symbol: '฿', name: '바트' },
    'VND': { symbol: '₫', name: '동' },
    'PHP': { symbol: '₱', name: '페소' },
    'GBP': { symbol: '£', name: '파운드' },
    'CHF': { symbol: 'CHF', name: '프랑' },
    'AUD': { symbol: 'A$', name: '호주 달러' },
    'CAD': { symbol: 'C$', name: '캐나다 달러' }
};

const EXCHANGE_API_KEY = '525ee053a652a742d826b0ba';

async function updateExchangeRateFromAPI() {
    console.log('Fetching fresh rates from API...');
    try {
        const response = await fetch(`https://v6.exchangerate-api.com/v6/${EXCHANGE_API_KEY}/latest/KRW`);
        const data = await response.json();

        if (data.result !== 'success') throw new Error('API Sync Failed');

        const rates = data.conversion_rates;
        const targetCurrencies = Object.keys(currencyData);
        const updates = [];

        for (const code of targetCurrencies) {
            if (rates[code]) {
                updates.push({
                    currency_code: code,
                    rate: 1 / rates[code], // 1 외화당 KRW (KRW 기준이므로)
                    updated_at: new Date().toISOString()
                });
            }
        }

        const { error } = await supabaseClient
            .from('exchange_rates')
            .upsert(updates, { onConflict: 'currency_code' });

        if (error) throw error;
        console.log('Supabase sync complete.');
    } catch (error) {
        console.error('Auto Sync Error:', error);
    }
}

async function fetchExchangeRate() {
    const selectedCurrency = currencySelect.value;
    rateInfo.textContent = '환율 정보를 불러오는 중...';
    console.log(`Fetching rate for: ${selectedCurrency}`);

    try {
        const { data, error } = await supabaseClient
            .from('exchange_rates')
            .select('*')
            .ilike('currency_code', selectedCurrency)
            .single();

        if (error) {
            console.error('Supabase Error:', error);
            throw error;
        }

        if (data) {
            console.log('Received data:', data);

            // 데이터가 1시간 이상 지났으면 백그라운드에서 동기화 실행
            const lastUpdate = new Date(data.updated_at);
            const hourInMs = 60 * 60 * 1000;
            if (new Date() - lastUpdate > hourInMs) {
                updateExchangeRateFromAPI();
            }

            currentRate = data.rate;
            rateInfo.textContent = `현재 환율: 1 ${selectedCurrency} = ${currentRate.toLocaleString()}원 (기준: ${lastUpdate.toLocaleString('ko-KR')})`;
            calculateResult();
        } else {
            throw new Error(`'${selectedCurrency}'에 대한 환율 데이터가 테이블에 없습니다.`);
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        rateInfo.textContent = `오류: ${error.message || '환율 정보를 불러오지 못했습니다.'}`;

        // 데이터가 없으면 즉시 동기화 시도
        updateExchangeRateFromAPI().then(() => fetchExchangeRate());
    }
}

function calculateResult() {
    const amount = parseFloat(baseInput.value);

    if (isNaN(amount) || amount <= 0) {
        resultText.textContent = '금액을 입력해주세요';
        return;
    }

    if (currentRate) {
        let resultValue = amount * currentRate;
        // 엔화(JPY)의 경우 100엔당 환율로 계산되는 경우가 많으나, 이 API는 1엔 기준임.
        const formattedResult = Math.floor(resultValue).toLocaleString();
        resultText.textContent = `약 ${formattedResult}원입니다`;
    }
}

function updateCurrencyUI() {
    const selected = currencySelect.value;
    currencyUnit.textContent = currencyData[selected].symbol;
    fetchExchangeRate();
}

baseInput.addEventListener('input', calculateResult);
currencySelect.addEventListener('change', updateCurrencyUI);

convertBtn.addEventListener('click', () => {
    window.location.href = 'https://www.tourlive.co.kr';
});

// 초기 로드
fetchExchangeRate();
