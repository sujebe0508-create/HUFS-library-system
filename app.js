const STORAGE_KEY = 'hufs_library_data_v4'; // AI 기능 적용을 위한 v4 스키마 초기화
const LOGS_STORAGE_KEY = 'hufs_library_ai_logs';
const MODAL_DATE_KEY = 'hufs_library_modal_hide_date_v3';

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
let aiLogs = [];

const loadData = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    booksData = JSON.parse(stored);
  } else {
    booksData = JSON.parse(JSON.stringify(initialBooks));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(booksData));
  }

  const storedLogs = localStorage.getItem(LOGS_STORAGE_KEY);
  if (storedLogs) {
    aiLogs = JSON.parse(storedLogs);
  } else {
    aiLogs = [];
  }
};

// 데이터 저장
const saveData = () => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(booksData));
  localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(aiLogs));
};

// 탭 전환
window.switchTab = (tab) => {
  // 사서 모드 접근 시 비밀번호 확인
  if (tab === 'admin') {
    const password = prompt('사서 권한 인증을 위한 비밀번호를 입력하세요.');
    if (password !== '1234') {
      alert('비밀번호가 일치하지 않습니다.');
      return; // 비밀번호가 틀리면 탭 전환 중단
    }
  }

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

  // AI 로그 렌더링
  const logList = document.getElementById('ai-log-list');
  logList.innerHTML = '';
  
  if (aiLogs.length === 0) {
    logList.innerHTML = '<p style="color: var(--text-muted); padding: 1rem 0;">최근 검수 내역이 없습니다.</p>';
  } else {
    // 최신순 렌더링 (역순)
    [...aiLogs].reverse().forEach(log => {
      const card = document.createElement('div');
      card.className = 'log-card';
      card.innerHTML = `
        <div class="log-info">
          <span class="log-time">${log.time}</span>
          <span class="log-book">${log.bookTitle} (제 ${log.copyId}권)</span>
          <span class="log-issues">${log.issuesText}</span>
        </div>
        <div class="status-badge ${getStatusClass(log.status)}">${log.status}</div>
      `;
      logList.appendChild(card);
    });
  }
};

// =========================================
// AI 자동 검수 시뮬레이션 로직
// =========================================

let selectedReturnBook = null;

window.openReturnModal = () => {
  loadData();
  const select = document.getElementById('return-book-select');
  select.innerHTML = '';
  
  booksData.forEach((book, bIndex) => {
    book.copies.forEach((copy, cIndex) => {
      const option = document.createElement('option');
      option.value = `${bIndex}-${cIndex}`;
      option.textContent = `${book.title} - 제 ${copy.copyId}권 (현재: ${copy.status})`;
      select.appendChild(option);
    });
  });
  
  document.getElementById('return-select-modal').classList.remove('hidden');
};

window.closeReturnModal = () => {
  document.getElementById('return-select-modal').classList.add('hidden');
};

window.startAiScan = () => {
  const select = document.getElementById('return-book-select');
  if (!select.value) return;
  
  const [bIndex, cIndex] = select.value.split('-');
  selectedReturnBook = { bIndex: parseInt(bIndex), cIndex: parseInt(cIndex) };
  
  // 1단계 모달 닫기
  closeReturnModal();
  
  // 2단계 스캔 모달 열기
  const scanModal = document.getElementById('ai-scan-modal');
  scanModal.classList.remove('hidden');
  
  const stepText = document.getElementById('scan-step-text');
  const progressBar = document.getElementById('scan-progress');
  
  const steps = [
    { text: '표지 및 바코드 스캔 중...', progress: 20, time: 800 },
    { text: '페이지 훼손 분석 중...', progress: 40, time: 800 },
    { text: '낙서 및 오염 탐지 중...', progress: 60, time: 1000 },
    { text: '형광펜 및 밑줄 분석 중...', progress: 80, time: 800 },
    { text: '검수 완료 데이터 정리 중...', progress: 100, time: 500 }
  ];
  
  let currentStep = 0;
  
  const runStep = () => {
    if (currentStep >= steps.length) {
      setTimeout(() => {
        scanModal.classList.add('hidden');
        finishAiScan();
      }, 500);
      return;
    }
    
    stepText.textContent = steps[currentStep].text;
    progressBar.style.width = `${steps[currentStep].progress}%`;
    
    setTimeout(runStep, steps[currentStep].time);
    currentStep++;
  };
  
  // 초기화 및 실행
  progressBar.style.width = '0%';
  setTimeout(runStep, 500);
};

const finishAiScan = () => {
  const { bIndex, cIndex } = selectedReturnBook;
  const book = booksData[bIndex];
  const copy = book.copies[cIndex];
  
  // 랜덤 검수 결과 생성 알고리즘
  const issues = {
    underlines: Math.random() > 0.6 ? Math.floor(Math.random() * 5) + 1 : 0,
    highlights: Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 0,
    scribbles: Math.random() > 0.8 ? Math.floor(Math.random() * 2) + 1 : 0,
    foldedPages: Math.random() > 0.6 ? Math.floor(Math.random() * 4) + 1 : 0,
    tornPages: Math.random() > 0.9 ? 1 : 0,
    missingPages: Math.random() > 0.95 ? 1 : 0,
    waterDamage: Math.random() > 0.95
  };
  
  // 상태 판정 규칙
  let finalStatus = '양호';
  let issuesList = [];
  
  if (issues.tornPages > 0 || issues.missingPages > 0 || issues.waterDamage) {
    finalStatus = '훼손';
    if (issues.tornPages > 0) issuesList.push(`찢어진 페이지 ${issues.tornPages}건`);
    if (issues.missingPages > 0) issuesList.push(`페이지 누락 ${issues.missingPages}건`);
    if (issues.waterDamage) issuesList.push(`물 손상 감지`);
  } else if (issues.underlines > 0 || issues.highlights > 0 || issues.scribbles > 0 || issues.foldedPages > 0) {
    finalStatus = '주의';
    if (issues.underlines > 0) issuesList.push(`밑줄 ${issues.underlines}건`);
    if (issues.highlights > 0) issuesList.push(`형광펜 표시 ${issues.highlights}건`);
    if (issues.scribbles > 0) issuesList.push(`낙서 ${issues.scribbles}건`);
    if (issues.foldedPages > 0) issuesList.push(`접힌 페이지 ${issues.foldedPages}건`);
  } else {
    issuesList.push(`이상 없음`);
  }
  
  // 데이터 및 로그 업데이트
  const now = new Date();
  const timeString = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  
  copy.status = finalStatus;
  copy.lastInspection = timeString;
  copy.inspectionResult = issues;
  
  aiLogs.push({
    time: timeString,
    bookTitle: book.title,
    copyId: copy.copyId,
    status: finalStatus,
    issuesText: issuesList.join(', ')
  });
  
  // 최대 로그 50개 유지
  if (aiLogs.length > 50) aiLogs.shift();
  
  saveData();
  renderUserView(); // 화면 갱신
  
  // 3단계 결과 모달 열기
  document.getElementById('result-book-title').textContent = `${book.title} (제 ${copy.copyId}권)`;
  
  const badge = document.getElementById('result-status-badge');
  badge.className = `status-badge ${getStatusClass(finalStatus)}`;
  badge.textContent = `최종 상태: ${finalStatus}`;
  
  const ul = document.getElementById('result-issues-list');
  ul.innerHTML = issuesList.map(issue => `<li>${issue}</li>`).join('');
  
  document.getElementById('ai-result-modal').classList.remove('hidden');
};

window.closeResultModal = () => {
  document.getElementById('ai-result-modal').classList.add('hidden');
};

// 상태 업데이트 (기존 사서 수동 조작용)
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
  const modal = document.getElementById('campaign-modal');
  
  // 오늘 안보기 체크가 되어있으면 숨김
  if (hideDate === today) {
    modal.classList.add('hidden');
  } else {
    modal.classList.remove('hidden');
  }

  document.getElementById('modal-close-btn').addEventListener('click', () => {
    const isChecked = document.getElementById('modal-dont-show-checkbox').checked;
    if (isChecked) {
      localStorage.setItem(MODAL_DATE_KEY, today);
    }
    modal.classList.add('hidden');
  });
};

// 초기화
document.addEventListener('DOMContentLoaded', () => {
  initModal();
  renderUserView();
});
