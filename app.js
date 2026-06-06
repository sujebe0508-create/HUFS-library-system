const STORAGE_KEY = 'hufs_library_data';
const MODAL_DATE_KEY = 'hufs_library_modal_hide_date';
const initialBooks = [
  {
    id: 1,
    title: '소년이 온다',
    author: '한강',
    publisher: '창비',
    year: 2014,
    cover: 'assets/human_acts_cover_1780716585156.png',
    copies: [
      { copyId: 1, status: '양호' },
      { copyId: 2, status: '양호' },
      { copyId: 3, status: '주의' }
    ]
  },
  {
    id: 2,
    title: '도둑맞은 집중력',
    author: '요한 하리',
    publisher: '어크로스',
    year: 2023,
    cover: 'assets/stolen_focus_cover_1780716596088.png',
    copies: [
      { copyId: 1, status: '훼손' }
    ]
  },
  {
    id: 3,
    title: '모순',
    author: '양귀자',
    publisher: '쓰다',
    year: 1998,
    cover: 'assets/contradiction_cover_1780716608945.png',
    copies: [
      { copyId: 1, status: '양호' },
      { copyId: 2, status: '양호' }
    ]
  },
  {
    id: 4,
    title: '데미안',
    author: '헤르만 헤세',
    publisher: '민음사',
    year: 1919,
    cover: 'assets/demian_cover_1780716621836.png',
    copies: [
      { copyId: 1, status: '양호' },
      { copyId: 2, status: '주의' },
      { copyId: 3, status: '훼손' }
    ]
  }
];
// 상태 유틸리티
const getStatusClass = (status) => {
  if (status === '양호') return 'status-good';
  if (status === '주의') return 'status-warning';
  if (status === '훼손') return 'status-damaged';
  return '';
};
// 데이터 로드
let booksData = [];
const loadData = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    booksData = JSON.parse(stored);
  } else {
    booksData = JSON.parse(JSON.stringify(initialBooks));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(booksData));
  }
};
// 데이터 저장
const saveData = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(booksData));
};
// 탭 전환
window.switchTab = (tab) => {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
  
  document.getElementById(`tab-${tab}`).classList.add('active');
  document.getElementById(`view-${tab}`).classList.add('active');
  if (tab === 'user') {
    renderUserView();
  } else {
    renderAdminView();
  }
};
// 이용자 화면 렌더링
let currentFilter = '전체';
const renderUserView = () => {
  loadData();
  
  // 우선 배정 안내 로직 (양호 상태가 하나라도 있는지 확인)
  const hasGoodCopy = booksData.some(book => book.copies.some(copy => copy.status === '양호'));
  const notice = document.getElementById('priority-notice');
  if (hasGoodCopy) {
    notice.classList.remove('hidden');
  } else {
    notice.classList.add('hidden');
  }
  // 필터링 적용
  const grid = document.getElementById('book-grid');
  grid.innerHTML = '';
  booksData.forEach(book => {
    // 필터 조건에 맞는 권만 필터링
    const filteredCopies = currentFilter === '전체' 
      ? book.copies 
      : book.copies.filter(c => c.status === currentFilter);
    // 표시할 권이 없으면 카드 숨김
    if (filteredCopies.length === 0) return;
    const card = document.createElement('div');
    card.className = 'book-card';
    
    let copiesHTML = '';
    filteredCopies.forEach(c => {
      copiesHTML += `
        <div class="copy-item">
          <span>제 ${c.copyId}권</span>
          <span class="status-badge ${getStatusClass(c.status)}">${c.status}</span>
        </div>
      `;
    });
    card.innerHTML = `
      <img src="${book.cover}" alt="${book.title} 표지" class="book-cover">
      <div class="book-info">
        <h3 class="book-title">${book.title}</h3>
        <div class="book-meta">${book.author} | ${book.publisher} | ${book.year}</div>
        <div class="book-copies">
          ${copiesHTML}
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
};
// 필터 버튼 이벤트
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    currentFilter = e.target.getAttribute('data-filter');
    renderUserView();
  });
});
// 사서 화면 렌더링
const renderAdminView = () => {
  loadData();
  const tbody = document.getElementById('admin-tbody');
  tbody.innerHTML = '';
  booksData.forEach((book, bIndex) => {
    book.copies.forEach((copy, cIndex) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${book.title}</strong></td>
        <td>제 ${copy.copyId}권</td>
        <td>
          <select class="status-select" id="select-${bIndex}-${cIndex}">
            <option value="양호" ${copy.status === '양호' ? 'selected' : ''}>양호</option>
            <option value="주의" ${copy.status === '주의' ? 'selected' : ''}>주의</option>
            <option value="훼손" ${copy.status === '훼손' ? 'selected' : ''}>훼손</option>
          </select>
        </td>
        <td>
          <button class="save-btn" onclick="updateStatus(${bIndex}, ${cIndex})">저장</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  });
};
// 상태 업데이트
window.updateStatus = (bIndex, cIndex) => {
  const selectElement = document.getElementById(`select-${bIndex}-${cIndex}`);
  const newStatus = selectElement.value;
  
  booksData[bIndex].copies[cIndex].status = newStatus;
  saveData();
  
  showToast();
};
// 토스트 메시지
const showToast = () => {
  const toast = document.getElementById('toast');
  toast.classList.remove('hidden');
  toast.classList.remove('fade-out');
  
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 300);
  }, 300);
};
// 실시간 연동 (Storage Event)
window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEY) {
    // 탭 1에서 업데이트 시 탭 2에서도 뷰 갱신
    if (document.getElementById('view-user').classList.contains('active')) {
      renderUserView();
    } else {
      renderAdminView();
    }
  }
});
// 캠페인 모달 처리
const initModal = () => {
  const today = new Date().toDateString();
  const hideDate = localStorage.getItem(MODAL_DATE_KEY);
  
  if (hideDate !== today) {
    document.getElementById('campaign-modal').classList.remove('hidden');
  }
  document.getElementById('modal-close-btn').addEventListener('click', () => {
    const isChecked = document.getElementById('modal-dont-show-checkbox').checked;
    if (isChecked) {
      localStorage.setItem(MODAL_DATE_KEY, today);
    }
    document.getElementById('campaign-modal').classList.add('hidden');
  });
};
// 초기화
document.addEventListener('DOMContentLoaded', () => {
  initModal();
  renderUserView();
});
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>외대 도서관 장서 상태 안내 시스템</title>
  <link rel="stylesheet" href="style.css">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet">
</head>
<body>
  <!-- 상단 내비게이션 -->
  <nav class="navbar">
    <div class="nav-container">
      <div class="logo">외대 도서관</div>
      <div class="tabs">
        <button id="tab-user" class="tab-btn active" onclick="switchTab('user')">외대 도서관 이용자 모드</button>
        <button id="tab-admin" class="tab-btn" onclick="switchTab('admin')">외대 도서관 사서 모드</button>
      </div>
    </div>
  </nav>
  <!-- 메인 컨텐츠 영역 -->
  <main>
    <!-- 이용자 화면 -->
    <section id="view-user" class="view-section active">
      <header class="section-header">
        <h2>도서 검색 및 상태 확인</h2>
      </header>
      <!-- 가장 깨끗한 도서 우선 배정 안내 (동적 렌더링) -->
      <div id="priority-notice" class="priority-notice hidden">
        <span class="icon">✨</span>
        <p>현재 가장 깨끗한 도서(양호) 우선 배정 안내 중입니다.</p>
      </div>
      <!-- 상태 필터 -->
      <div class="filter-container">
        <button class="filter-btn active" data-filter="전체">전체</button>
        <button class="filter-btn" data-filter="양호">양호</button>
        <button class="filter-btn" data-filter="주의">주의</button>
        <button class="filter-btn" data-filter="훼손">훼손</button>
      </div>
      <!-- 도서 리스트 그리드 -->
      <div id="book-grid" class="book-grid">
        <!-- JS 렌더링 -->
      </div>
    </section>
    <!-- 사서(관리자) 화면 -->
    <section id="view-admin" class="view-section hidden">
      <header class="section-header">
        <h2>장서 상태 관리</h2>
        <p>각 장서의 현재 상태를 업데이트하세요.</p>
      </header>
      <div class="admin-table-container">
        <table class="admin-table">
          <thead>
            <tr>
              <th>도서명</th>
              <th>권차</th>
              <th>상태 변경</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody id="admin-tbody">
            <!-- JS 렌더링 -->
          </tbody>
        </table>
      </div>
    </section>
  </main>
  <!-- 캠페인 모달 -->
  <div id="campaign-modal" class="modal-overlay hidden">
    <div class="modal-content">
      <div class="modal-header">
        <h3>공지사항</h3>
        <button id="modal-close-btn" class="close-btn">&times;</button>
      </div>
      <div class="modal-body">
        <div class="campaign-icon">🚫✏️</div>
        <h4>외대 도서관 공공 도서 필기 금지 캠페인</h4>
        <p>다음 사람을 위해 깨끗하게 이용해주세요.<br>도서에 필기, 밑줄, 접기 등을 삼가시기 바랍니다.</p>
      </div>
      <div class="modal-footer">
        <label class="checkbox-label">
          <input type="checkbox" id="modal-dont-show-checkbox"> 오늘 다시 보지 않음
        </label>
      </div>
    </div>
  </div>
  <!-- 피드백 토스트 -->
  <div id="toast" class="toast hidden">상태 변경 완료</div>
  <script src="app.js"></script>
</body>
</html>
:root {
  --primary-navy: #1B2B4C;
  --secondary-navy: #2A4372;
  --light-bg: #F4F6F9;
  --white: #FFFFFF;
  --text-main: #333333;
  --text-muted: #666666;
  --border-color: #E2E8F0;
  --color-good: #10B981; /* Green */
  --color-good-bg: #D1FAE5;
  --color-warning: #F59E0B; /* Yellow/Amber */
  --color-warning-bg: #FEF3C7;
  --color-damaged: #EF4444; /* Red */
  --color-damaged-bg: #FEE2E2;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
  --transition: all 0.3s ease;
}
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
body {
  font-family: 'Noto Sans KR', sans-serif;
  background-color: var(--light-bg);
  color: var(--text-main);
  line-height: 1.6;
}
/* Navbar */
.navbar {
  background-color: var(--primary-navy);
  color: var(--white);
  padding: 0 2rem;
  box-shadow: var(--shadow-md);
  position: sticky;
  top: 0;
  z-index: 100;
}
.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
}
.logo {
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 1px;
}
.tabs {
  display: flex;
  gap: 1rem;
}
.tab-btn {
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  border: none;
  font-size: 1rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: var(--transition);
  font-family: inherit;
}
.tab-btn:hover {
  color: var(--white);
}
.tab-btn.active {
  color: var(--white);
  border-bottom: 2px solid var(--white);
}
/* Main Content */
main {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}
.view-section {
  display: none;
  animation: fadeIn 0.4s ease-out;
}
.view-section.active {
  display: block;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.section-header {
  margin-bottom: 2rem;
}
.section-header h2 {
  font-size: 1.8rem;
  color: var(--primary-navy);
  margin-bottom: 0.5rem;
}
.hidden {
  display: none !important;
}
/* Priority Notice */
.priority-notice {
  background-color: var(--color-good-bg);
  border: 1px solid var(--color-good);
  color: #047857;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
  box-shadow: var(--shadow-sm);
}
.priority-notice .icon {
  font-size: 1.25rem;
}
/* Filters */
.filter-container {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2rem;
}
.filter-btn {
  background-color: var(--white);
  border: 1px solid var(--border-color);
  padding: 0.5rem 1.25rem;
  border-radius: 20px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: var(--transition);
  color: var(--text-muted);
  font-weight: 500;
}
.filter-btn:hover {
  border-color: var(--primary-navy);
  color: var(--primary-navy);
}
.filter-btn.active {
  background-color: var(--primary-navy);
  color: var(--white);
  border-color: var(--primary-navy);
}
/* Book Grid */
.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
}
.book-card {
  background-color: var(--white);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition: var(--transition);
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
}
.book-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
}
.book-cover {
  width: 100%;
  height: 380px;
  object-fit: cover;
  border-bottom: 1px solid var(--border-color);
  background-color: #eee;
}
.book-info {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.book-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-navy);
  margin-bottom: 0.5rem;
}
.book-meta {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-bottom: 1rem;
}
.book-copies {
  margin-top: auto;
  border-top: 1px dashed var(--border-color);
  padding-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.copy-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95rem;
}
.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 700;
}
.status-good { background-color: var(--color-good-bg); color: var(--color-good); }
.status-warning { background-color: var(--color-warning-bg); color: var(--color-warning); }
.status-damaged { background-color: var(--color-damaged-bg); color: var(--color-damaged); }
/* Admin Table */
.admin-table-container {
  background: var(--white);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  overflow: hidden;
  border: 1px solid var(--border-color);
}
.admin-table {
  width: 100%;
  border-collapse: collapse;
}
.admin-table th, .admin-table td {
  padding: 1rem 1.5rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}
.admin-table th {
  background-color: #FAFAFA;
  font-weight: 700;
  color: var(--primary-navy);
}
.admin-table tbody tr:last-child td {
  border-bottom: none;
}
.admin-table tbody tr:hover {
  background-color: #F8FAFC;
}
.status-select {
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  font-family: inherit;
  font-size: 0.95rem;
  outline: none;
  transition: var(--transition);
}
.status-select:focus {
  border-color: var(--primary-navy);
}
.save-btn {
  background-color: var(--primary-navy);
  color: var(--white);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: var(--transition);
}
.save-btn:hover {
  background-color: var(--secondary-navy);
}
/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}
.modal-content {
  background-color: var(--white);
  border-radius: 16px;
  width: 90%;
  max-width: 450px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  animation: modalScale 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
@keyframes modalScale {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.modal-header {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}
.modal-header h3 {
  color: var(--primary-navy);
  margin: 0;
}
.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-muted);
}
.modal-body {
  padding: 2rem 1.5rem;
  text-align: center;
}
.campaign-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}
.modal-body h4 {
  margin-bottom: 0.75rem;
  color: var(--primary-navy);
}
.modal-body p {
  color: var(--text-muted);
}
.modal-footer {
  padding: 1rem 1.5rem;
  background-color: #FAFAFA;
  border-top: 1px solid var(--border-color);
}
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
  color: var(--text-muted);
}
/* Toast */
.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background-color: var(--primary-navy);
  color: var(--white);
  padding: 1rem 2rem;
  border-radius: 8px;
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  font-weight: 500;
  animation: slideUp 0.3s ease-out;
}
@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.toast.fade-out {
  animation: fadeOut 0.3s ease-in forwards;
}
@keyframes fadeOut {
  from { transform: translateY(0); opacity: 1; }
  to { transform: translateY(100%); opacity: 0; }
}
