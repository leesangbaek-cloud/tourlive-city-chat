# Tour Buddy Lite (실시간 도시별 게시판)

Tour Buddy Lite는 투어라이브 사용자를 위한 **실시간 도시별 정보 공유 게시판** 서비스입니다. 별도의 로그인 없이 닉네임 설정만으로 여행 정보를 공유하고 실시간으로 소통할 수 있습니다.

## 🚀 주요 기능

- **로그인 프리**: 복잡한 가입 절차 없이 닉네임만 입력하고 가입 없이 즉시 이용 가능합니다.
- **도시별 게시판**: 파리, 로마, 피렌체, 바르셀로나 등 주요 여행 도시별로 구분된 게시판을 제공합니다.
- **실시간 소통**: Supabase Realtime을 사용하여 새로고침 없이 다른 사용자의 글을 즉시 확인할 수 있습니다.
- **브랜드 아이덴티티**: 투어라이브의 브랜드 컬러(#FF5C00)를 활용한 프리미엄 디자인이 적용되었습니다.

## 🛠 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla JS)
- **Backend/Database**: Supabase (PostgreSQL, Realtime API)
- **Icons**: Font Awesome 6.0

## 📂 프로젝트 구조

- `index.html`: SPA(Single Page Application) 구조의 메인 마크업
- `style.css`: 모바일 퍼스트 및 투어라이브 브랜드 테마 스타일링
- `main.js`: 게시글 페칭, 실시간 구독 및 화면 전환 로직
- `supabase_board_setup.sql`: 데이터베이스 테이블 및 RLS 보안 정책 설정 스크립트

## 📝 데이터베이스 설정 (Supabase)

게시판 기능을 위해 다음과 같은 `city_posts` 테이블이 필요합니다:

```sql
create table city_posts (
  id uuid default gen_random_uuid() primary key,
  city_name text not null,
  nickname text not null,
  title text not null,
  content text not null,
  created_at timestamp with time zone default now()
);

-- RLS 활성화 및 정책 설정
alter table city_posts enable row level security;
create policy "Allow anonymous read" on city_posts for select to anon using (true);
create policy "Allow anonymous insert" on city_posts for insert to anon with check (true);

-- 실시간 업데이트 활성화
alter publication supabase_realtime add table city_posts;
```

---
© 2026 TourLive Buddy Lite Implementation.
