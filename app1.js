const STORAGE_KEY = 'hufs_library_data_v3'; // 버전을 올려 이전 로컬 스토리지 초기화
const MODAL_DATE_KEY = 'hufs_library_modal_hide_date_v2';

const initialBooks = [
  {
    id: 1,
    title: '소년이 온다',
    author: '한강',
    publisher: '창비',
    year: 2014,
    cover: 'assets/human_acts_real.jpg',
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
    cover: 'assets/stolen_focus_real.png',
    copies: [
      { copyId: 1, status: '주의' }
    ]
  },
  {
    id: 3,
    title: '모순',
    author: '양귀자',
    publisher: '쓰다',
    year: 1998,
    cover: 'assets/contradiction_real.jpg',
    copies: [
      { copyId: 1, status: '양호' },
      { copyId: 2, status: '훼손' }
    ]
  },
  {
    id: 4,
    title: '데미안',
    author: '헤르만 헤세',
    publisher: '민음사',
    year: 1919,
    cover: 'assets/demian_real.png',
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
let searchQuery = '';

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

  // 필터링 및 검색 적용
  const grid = document.getElementById('book-grid');
  grid.innerHTML = '';

  booksData.forEach(book => {
    // 검색어 필터링 (제목 또는 저자)
    const matchesSearch = book.title.includes(searchQuery) || book.author.includes(searchQuery);
    if (!matchesSearch && searchQuery.trim() !== '') return;

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

// 검색 이벤트
const searchInput = document.getElementById('search-input');
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderUserView();
  });
}

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
