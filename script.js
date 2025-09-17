// 전역 변수
let currentNewsText = '';
let analysisData = {};
let currentActivePhilosophy = null;
let isComparisonMode = false;
let selectedPhilosophies = [];
let isRecombineMode = false;
let floatingKeywords = [];
let strongKeywords = [];
let weakKeywords = [];


// DOM 요소들
const inputSection = document.getElementById('input-section');
const analysisSection = document.getElementById('analysis-section');
const newsInput = document.getElementById('news-input');
const registerBtn = document.getElementById('register-btn');
const loading = document.getElementById('loading');
const interpretationArea = document.getElementById('interpretation-area');
const newsContent = document.getElementById('news-content');
const philosophyButtons = document.querySelectorAll('.philosophy-btn');
const comparisonModeToggle = document.getElementById('comparison-mode');
const philosophyCheckboxes = document.querySelectorAll('.philosophy-checkbox');
const recombineSection = document.getElementById('recombine-section');
const recombineBtn = document.getElementById('recombine-btn');
const cameraMode = document.getElementById('camera-mode');
const closeCamera = document.getElementById('close-camera');
const cameraVideo = document.getElementById('camera-video');
const gestureCanvas = document.getElementById('gesture-canvas');
const floatingKeywordsContainer = document.getElementById('floating-keywords');
const strongBox = document.getElementById('strong-box');
const weakBox = document.getElementById('weak-box');
const strongKeywordsContainer = document.getElementById('strong-keywords');
const weakKeywordsContainer = document.getElementById('weak-keywords');
const createPhilosophyBtn = document.getElementById('create-philosophy');
const particleContainer = document.getElementById('particle-container');


// 기사 등록 버튼 이벤트
registerBtn.addEventListener('click', async () => {
  const newsText = newsInput.value.trim();
  if (!newsText) {
    alert('뉴스 기사를 입력해주세요.');
    return;
  }

  currentNewsText = newsText;
  
  // 로딩 표시
  showLoading();
  
  try {
    // 전체 분석 수행
    const response = await fetch('/api/analyze-news', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newsText })
    });

    if (!response.ok) {
      throw new Error('분석 요청 실패');
    }

    analysisData = await response.json();
    
    // UI 전환
    hideLoading();
    showAnalysisSection();
    displayNewsText();
    
  } catch (error) {
    hideLoading();
    alert('분석 중 오류가 발생했습니다. 다시 시도해주세요.');
    console.error('Error:', error);
  }
});

// 철학적 관점 버튼 이벤트
philosophyButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const philosophy = btn.dataset.philosophy;
    
    if (isComparisonMode) {
      togglePhilosophySelection(philosophy);
    } else {
      selectPhilosophy(philosophy);
    }
  });
});

// 체크박스 이벤트
philosophyCheckboxes.forEach(checkbox => {
  checkbox.addEventListener('change', (e) => {
    e.stopPropagation();
    const philosophy = checkbox.dataset.philosophy;
    togglePhilosophySelection(philosophy);
  });
});

// 비교 모드 토글 이벤트
comparisonModeToggle.addEventListener('change', (e) => {
  isComparisonMode = e.target.checked;
  
  if (isComparisonMode) {
    // 비교 모드로 전환
    philosophyButtons.forEach(btn => {
      btn.classList.remove('active');
    });
    selectedPhilosophies = [];
  } else {
    // 단일 모드로 전환
    philosophyCheckboxes.forEach(checkbox => {
      checkbox.checked = false;
    });
    philosophyButtons.forEach(btn => {
      btn.classList.remove('checked');
    });
    selectedPhilosophies = [];
  }
  
  // 해석 영역 초기화
  interpretationArea.innerHTML = `
    <h3>철학적 관점을 선택해주세요</h3>
    <p>${isComparisonMode ? '비교하고 싶은 관점들을 선택하세요.' : '위의 버튼 중 하나를 클릭하면 해당 철학적 관점에서 뉴스가 분석됩니다.'}</p>
  `;
  
  // 뉴스 텍스트 초기화
  newsContent.innerHTML = currentNewsText;
  
  // 재조합 버튼 상태 업데이트
  updateRecombineButton();
});

// 재조합하기 버튼 이벤트
recombineBtn.addEventListener('click', () => {
  startRecombineMode();
});

// 카메라 모드 닫기
closeCamera.addEventListener('click', () => {
  closeRecombineMode();
});

// 나만의 관점 만들기 버튼
createPhilosophyBtn.addEventListener('click', () => {
  createCustomPhilosophy();
});


function showLoading() {
  loading.style.display = 'block';
  inputSection.style.display = 'none';
  analysisSection.style.display = 'none';
}

function hideLoading() {
  loading.style.display = 'none';
}

function showAnalysisSection() {
  inputSection.style.display = 'none';
  analysisSection.style.display = 'block';
}

function displayNewsText() {
  newsContent.innerHTML = currentNewsText;
}

function selectPhilosophy(philosophy) {
  // 버튼 활성화 상태 변경
  philosophyButtons.forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-philosophy="${philosophy}"]`).classList.add('active');
  
  currentActivePhilosophy = philosophy;
  
  // 해석 표시
  displayInterpretation(philosophy);
  
  // 텍스트 하이라이트
  highlightText(philosophy);
}

function togglePhilosophySelection(philosophy) {
  const btn = document.querySelector(`[data-philosophy="${philosophy}"]`);
  const checkbox = document.querySelector(`[data-philosophy="${philosophy}"].philosophy-checkbox`);
  
  if (selectedPhilosophies.includes(philosophy)) {
    // 선택 해제
    selectedPhilosophies = selectedPhilosophies.filter(p => p !== philosophy);
    btn.classList.remove('checked');
    checkbox.checked = false;
  } else {
    // 선택 추가
    selectedPhilosophies.push(philosophy);
    btn.classList.add('checked');
    checkbox.checked = true;
  }
  
  // 비교 분석 표시
  if (selectedPhilosophies.length > 0) {
    displayComparison(selectedPhilosophies);
    highlightTextComparison(selectedPhilosophies);
  } else {
    interpretationArea.innerHTML = `
      <h3>철학적 관점을 선택해주세요</h3>
      <p>비교하고 싶은 관점들을 선택하세요.</p>
    `;
    newsContent.innerHTML = currentNewsText;
  }
  
  // 재조합 버튼 상태 업데이트
  updateRecombineButton();
}

function displayComparison(philosophies) {
  const philosophyNames = {
    'platonism': '플라톤주의',
    'kantianism': '칸트주의', 
    'nietzscheanism': '니체주의',
    'existentialism': '실존주의',
    'marxism': '마르크스주의'
  };
  
  const philosophyEmojis = {
    'platonism': '🏛️',
    'kantianism': '⚖️',
    'nietzscheanism': '⚡',
    'existentialism': '🌅',
    'marxism': '🔨'
  };

  let html = `<h3>다중 관점 비교 분석</h3>`;
  
  philosophies.forEach(philosophy => {
    const data = analysisData[philosophy];
    if (data) {
      html += `
        <div class="comparison-item">
          <h4>${philosophyEmojis[philosophy]} ${philosophyNames[philosophy]}</h4>
          <div class="keywords">
            <strong>핵심 키워드:</strong> 
            <span style="color: #007aff; font-weight: 600;">${data.keywords.join(', ')}</span>
          </div>
          <div class="interpretation">
            <strong>해석:</strong><br>
            <span style="line-height: 1.6; color: #444;">${data.interpretation}</span>
          </div>
        </div>
      `;
    }
  });
  
  interpretationArea.innerHTML = html;
}

function highlightTextComparison(philosophies) {
  let highlightedText = currentNewsText;
  
  // 각 철학적 관점별로 다른 색상으로 하이라이트
  philosophies.forEach((philosophy, index) => {
    const data = analysisData[philosophy];
    if (!data) return;
    
    const extendedKeywords = getExtendedKeywords(philosophy, data.keywords);
    
    extendedKeywords.forEach(keyword => {
      const regex = new RegExp(`(${keyword})`, 'gi');
      highlightedText = highlightedText.replace(regex, `<span class="highlight comparison-${philosophy}">$1</span>`);
    });
  });
  
  // 문장 단위 분석
  const sentences = highlightedText.split(/([.!?])\s+/);
  const processedSentences = sentences.map((sentence, index) => {
    if (/[.!?]/.test(sentence) && sentence.length <= 2) {
      return sentence;
    }
    
    // 여러 관점에서 공통으로 중요하게 여기는 문장 하이라이트
    const isImportantForMultiple = philosophies.some(philosophy => {
      const extendedKeywords = getExtendedKeywords(philosophy, analysisData[philosophy]?.keywords || []);
      return extendedKeywords.some(keyword => 
        sentence.toLowerCase().includes(keyword.toLowerCase())
      );
    });
    
    if (isImportantForMultiple) {
      return `<span class="sentence-highlight comparison-multi">${sentence}</span>`;
    }
    
    return sentence;
  });
  
  highlightedText = processedSentences.join(' ');
  newsContent.innerHTML = highlightedText;
}

function displayInterpretation(philosophy) {
  const data = analysisData[philosophy];
  if (!data) return;
  
  const philosophyNames = {
    'platonism': '플라톤주의',
    'kantianism': '칸트주의', 
    'nietzscheanism': '니체주의',
    'existentialism': '실존주의',
    'marxism': '마르크스주의'
  };
  
  const philosophyEmojis = {
    'platonism': '🏛️',
    'kantianism': '⚖️',
    'nietzscheanism': '⚡',
    'existentialism': '🌅',
    'marxism': '🔨'
  };

  interpretationArea.innerHTML = `
    <h3>${philosophyEmojis[philosophy]} ${philosophyNames[philosophy]} 관점</h3>
    <div style="margin-bottom: 16px;">
      <strong>핵심 키워드:</strong> 
      <span style="color: #007aff; font-weight: 600;">${data.keywords.join(', ')}</span>
    </div>
    <div>
      <strong>해석:</strong><br>
      <span style="line-height: 1.6; color: #444;">${data.interpretation}</span>
    </div>
  `;
}

function highlightText(philosophy) {
  const data = analysisData[philosophy];
  if (!data) return;
  
  let highlightedText = currentNewsText;
  
  // 철학적 관점별 관련 키워드 확장
  const extendedKeywords = getExtendedKeywords(philosophy, data.keywords);
  
  // 1. 키워드 하이라이트 (최소 3개 이상 보장)
  let keywordCount = 0;
  extendedKeywords.forEach(keyword => {
    const regex = new RegExp(`(${keyword})`, 'gi');
    const matches = highlightedText.match(regex);
    if (matches) {
      keywordCount += matches.length;
      highlightedText = highlightedText.replace(regex, `<span class="highlight ${philosophy}">$1</span>`);
    }
  });
  
  // 키워드가 3개 미만이면 추가 키워드 하이라이트
  if (keywordCount < 3) {
    const additionalKeywords = getAdditionalKeywords(philosophy);
    additionalKeywords.forEach(keyword => {
      if (keywordCount >= 3) return;
      const regex = new RegExp(`(${keyword})`, 'gi');
      const matches = highlightedText.match(regex);
      if (matches && !highlightedText.includes(`<span class="highlight ${philosophy}">${keyword}</span>`)) {
        keywordCount += matches.length;
        highlightedText = highlightedText.replace(regex, `<span class="highlight ${philosophy}">$1</span>`);
      }
    });
  }
  
  // 2. 문장 단위 분석 및 하이라이트 (최소 1개 이상 보장)
  const sentences = highlightedText.split(/([.!?])\s+/);
  let highlightedSentenceCount = 0;
  
  const processedSentences = sentences.map((sentence, index) => {
    // 구두점은 그대로 유지
    if (/[.!?]/.test(sentence) && sentence.length <= 2) {
      return sentence;
    }
    
    // 철학적 관점에서 무시할 문장인지 판단
    if (shouldStrikethrough(sentence, philosophy, extendedKeywords)) {
      return `<span class="strikethrough">${sentence}</span>`;
    }
    
    // 철학자가 집중했을 문장인지 판단하여 문장 전체 하이라이트
    if (shouldHighlightSentence(sentence, philosophy, extendedKeywords)) {
      highlightedSentenceCount++;
      return `<span class="sentence-highlight ${philosophy}">${sentence}</span>`;
    }
    
    return sentence;
  });
  
  // 문장 하이라이트가 0개면 강제로 1개 이상 하이라이트
  if (highlightedSentenceCount === 0) {
    const sentences = processedSentences.filter(s => s.length > 20 && !s.includes('strikethrough'));
    if (sentences.length > 0) {
      const randomIndex = Math.floor(Math.random() * sentences.length);
      const sentence = sentences[randomIndex];
      const sentenceIndex = processedSentences.indexOf(sentence);
      if (sentenceIndex !== -1) {
        processedSentences[sentenceIndex] = `<span class="sentence-highlight ${philosophy}">${sentence}</span>`;
      }
    }
  }
  
  highlightedText = processedSentences.join(' ');
  
  newsContent.innerHTML = highlightedText;
}

function getExtendedKeywords(philosophy, originalKeywords) {
  // 철학적 관점별로 관련 키워드 대폭 확장
  const philosophyKeywords = {
    'platonism': {
      core: ['이데아', '진리', '이상', '정의', '지혜', '선', '완벽성', '영혼', '형상', '동굴의 비유'],
      related: ['이상적', '완벽', '진실', '정의', '선악', '지식', '철학', '형이상학', '본질', '실재', '가상', '현실', '이상국가', '철인정치', '교육', '계몽', '진리', '이상', '정의', '지혜', '선', '완벽', '영혼', '형상', '동굴', '비유', '이상적', '완벽한', '진실한', '정의로운', '선한', '지혜로운', '완벽한', '영혼적', '형상적', '이상국가', '철인', '정치', '교육적', '계몽적', '진리적', '이상적', '정의적', '지혜적', '선적', '완벽적', '영혼적', '형상적', '동굴적', '비유적', '이상국가적', '철인적', '정치적', '교육적', '계몽적', '진리적', '이상적', '정의적', '지혜적', '선적', '완벽적', '영혼적', '형상적', '동굴적', '비유적', '이상국가적', '철인적', '정치적', '교육적', '계몽적']
    },
    'kantianism': {
      core: ['의무', '도덕법칙', '자율성', '정언명령', '이성', '존엄성', '보편성', '의지', '선의지', '정언명령'],
      related: ['도덕', '윤리', '의무', '책임', '자율', '이성', '보편', '존엄', '인간', '자유', '선의지', '정언명령', '가언명령', '실천이성', '순수이성', '선험', '범주', '도덕적', '윤리적', '의무적', '책임적', '자율적', '이성적', '보편적', '존엄적', '인간적', '자유적', '선의지적', '정언명령적', '가언명령적', '실천이성적', '순수이성적', '선험적', '범주적', '도덕적', '윤리적', '의무적', '책임적', '자율적', '이성적', '보편적', '존엄적', '인간적', '자유적', '선의지적', '정언명령적', '가언명령적', '실천이성적', '순수이성적', '선험적', '범주적']
    },
    'nietzscheanism': {
      core: ['권력의지', '초인', '영원회귀', '가치전도', '창조', '생명력', '개별성', '극복', '신의 죽음', '가치창조'],
      related: ['권력', '의지', '초인', '가치', '창조', '생명', '개별', '극복', '전통', '도덕', '기독교', '약자', '강자', '예술', '음악', '비극', '디오니소스', '아폴론', '영원회귀', '권력적', '의지적', '초인적', '가치적', '창조적', '생명적', '개별적', '극복적', '전통적', '도덕적', '기독교적', '약자적', '강자적', '예술적', '음악적', '비극적', '디오니소스적', '아폴론적', '영원회귀적', '권력적', '의지적', '초인적', '가치적', '창조적', '생명적', '개별적', '극복적', '전통적', '도덕적', '기독교적', '약자적', '강자적', '예술적', '음악적', '비극적', '디오니소스적', '아폴론적', '영원회귀적']
    },
    'existentialism': {
      core: ['자유', '선택', '책임', '불안', '죽음', '의미창조', '진정성', '현존재', '존재선행', '절망'],
      related: ['자유', '선택', '책임', '불안', '죽음', '의미', '진정성', '존재', '절망', '고독', '무의미', '실존', '본질', '현재', '미래', '과거', '시간', '인간', '주체', '객체', '자유적', '선택적', '책임적', '불안적', '죽음적', '의미적', '진정성적', '존재적', '절망적', '고독적', '무의미적', '실존적', '본질적', '현재적', '미래적', '과거적', '시간적', '인간적', '주체적', '객체적', '자유적', '선택적', '책임적', '불안적', '죽음적', '의미적', '진정성적', '존재적', '절망적', '고독적', '무의미적', '실존적', '본질적', '현재적', '미래적', '과거적', '시간적', '인간적', '주체적', '객체적']
    },
    'marxism': {
      core: ['계급', '자본', '착취', '변증법', '혁명', '생산관계', '이데올로기', '노동', '소외', '물질적 조건'],
      related: ['계급', '자본', '착취', '변증법', '혁명', '생산', '이데올로기', '노동', '소외', '물질', '경제', '사회', '정치', '부르주아', '프롤레타리아', '자본주의', '사회주의', '공산주의', '상품', '가치', '잉여가치', '계급적', '자본적', '착취적', '변증법적', '혁명적', '생산적', '이데올로기적', '노동적', '소외적', '물질적', '경제적', '사회적', '정치적', '부르주아적', '프롤레타리아적', '자본주의적', '사회주의적', '공산주의적', '상품적', '가치적', '잉여가치적', '계급적', '자본적', '착취적', '변증법적', '혁명적', '생산적', '이데올로기적', '노동적', '소외적', '물질적', '경제적', '사회적', '정치적', '부르주아적', '프롤레타리아적', '자본주의적', '사회주의적', '공산주의적', '상품적', '가치적', '잉여가치적']
    }
  };
  
  const keywords = philosophyKeywords[philosophy];
  if (!keywords) return originalKeywords;
  
  // 원본 키워드 + 관련 키워드 결합
  return [...new Set([...originalKeywords, ...keywords.core, ...keywords.related])];
}

function shouldStrikethrough(sentence, philosophy, keywords) {
  // 문장이 너무 짧으면 취소선 적용하지 않음
  if (sentence.length < 15) return false;
  
  // 키워드가 포함된 문장은 취소선 적용하지 않음
  const hasKeyword = keywords.some(keyword => 
    sentence.toLowerCase().includes(keyword.toLowerCase())
  );
  if (hasKeyword) return false;
  
  // 철학적 관점에서 무시할 수 있는 문장 패턴들
  const ignorePatterns = {
    'platonism': ['날짜', '시간', '장소', '연락처', '전화번호', '이메일', '주소', '가격', '비용', '할인', '세일'],
    'kantianism': ['날짜', '시간', '장소', '연락처', '전화번호', '이메일', '주소', '가격', '비용', '할인', '세일', '오락', '유흥'],
    'nietzscheanism': ['날짜', '시간', '장소', '연락처', '전화번호', '이메일', '주소', '가격', '비용', '할인', '세일', '도덕적', '선량한'],
    'existentialism': ['날짜', '시간', '장소', '연락처', '전화번호', '이메일', '주소', '가격', '비용', '할인', '세일', '일상적', '평범한'],
    'marxism': ['날짜', '시간', '장소', '연락처', '전화번호', '이메일', '주소', '가격', '비용', '할인', '세일', '개인적', '사적']
  };
  
  const patterns = ignorePatterns[philosophy] || [];
  const hasIgnorePattern = patterns.some(pattern => 
    sentence.toLowerCase().includes(pattern.toLowerCase())
  );
  
  // 무시 패턴이 있거나, 철학적 의미가 없는 단순한 사실 나열인 경우
  return hasIgnorePattern || isSimpleFactualStatement(sentence);
}

function getAdditionalKeywords(philosophy) {
  // 키워드가 부족할 때 사용할 추가 키워드들
  const additionalKeywords = {
    'platonism': ['이상', '완벽', '진리', '정의', '지혜', '선', '영혼', '형상', '이상적', '완벽한', '진실한', '정의로운', '선한', '지혜로운', '영혼적', '형상적', '이상국가', '철인', '정치', '교육', '계몽', '진실', '정의', '선악', '지식', '철학', '형이상학', '본질', '실재', '가상', '현실', '이상국가', '철인정치', '교육', '계몽', '진리', '이상', '정의', '지혜', '선', '완벽', '영혼', '형상', '동굴', '비유'],
    'kantianism': ['도덕', '윤리', '의무', '책임', '자율', '이성', '보편', '존엄', '인간', '자유', '선의지', '정언명령', '가언명령', '실천이성', '순수이성', '선험', '범주', '도덕적', '윤리적', '의무적', '책임적', '자율적', '이성적', '보편적', '존엄적', '인간적', '자유적', '선의지적', '정언명령적', '가언명령적', '실천이성적', '순수이성적', '선험적', '범주적'],
    'nietzscheanism': ['권력', '의지', '초인', '가치', '창조', '생명', '개별', '극복', '전통', '도덕', '기독교', '약자', '강자', '예술', '음악', '비극', '디오니소스', '아폴론', '영원회귀', '권력적', '의지적', '초인적', '가치적', '창조적', '생명적', '개별적', '극복적', '전통적', '도덕적', '기독교적', '약자적', '강자적', '예술적', '음악적', '비극적', '디오니소스적', '아폴론적', '영원회귀적'],
    'existentialism': ['자유', '선택', '책임', '불안', '죽음', '의미', '진정성', '존재', '절망', '고독', '무의미', '실존', '본질', '현재', '미래', '과거', '시간', '인간', '주체', '객체', '자유적', '선택적', '책임적', '불안적', '죽음적', '의미적', '진정성적', '존재적', '절망적', '고독적', '무의미적', '실존적', '본질적', '현재적', '미래적', '과거적', '시간적', '인간적', '주체적', '객체적'],
    'marxism': ['계급', '자본', '착취', '변증법', '혁명', '생산', '이데올로기', '노동', '소외', '물질', '경제', '사회', '정치', '부르주아', '프롤레타리아', '자본주의', '사회주의', '공산주의', '상품', '가치', '잉여가치', '계급적', '자본적', '착취적', '변증법적', '혁명적', '생산적', '이데올로기적', '노동적', '소외적', '물질적', '경제적', '사회적', '정치적', '부르주아적', '프롤레타리아적', '자본주의적', '사회주의적', '공산주의적', '상품적', '가치적', '잉여가치적']
  };
  
  return additionalKeywords[philosophy] || [];
}

function shouldHighlightSentence(sentence, philosophy, keywords) {
  // 문장이 너무 짧으면 하이라이트하지 않음
  if (sentence.length < 20) return false;
  
  // 키워드가 포함된 문장은 하이라이트
  const hasKeyword = keywords.some(keyword => 
    sentence.toLowerCase().includes(keyword.toLowerCase())
  );
  if (hasKeyword) return true;
  
  // 철학적 관점별로 집중할 문장 패턴들
  const focusPatterns = {
    'platonism': ['이상', '완벽', '진리', '정의', '지혜', '선', '영혼', '형상', '이상적', '완벽한', '진실한', '정의로운', '선한', '지혜로운', '영혼적', '형상적', '이상국가', '철인', '정치', '교육', '계몽'],
    'kantianism': ['도덕', '윤리', '의무', '책임', '자율', '이성', '보편', '존엄', '인간', '자유', '선의지', '정언명령', '가언명령', '실천이성', '순수이성', '선험', '범주'],
    'nietzscheanism': ['권력', '의지', '초인', '가치', '창조', '생명', '개별', '극복', '전통', '도덕', '기독교', '약자', '강자', '예술', '음악', '비극', '디오니소스', '아폴론', '영원회귀'],
    'existentialism': ['자유', '선택', '책임', '불안', '죽음', '의미', '진정성', '존재', '절망', '고독', '무의미', '실존', '본질', '현재', '미래', '과거', '시간', '인간', '주체', '객체'],
    'marxism': ['계급', '자본', '착취', '변증법', '혁명', '생산', '이데올로기', '노동', '소외', '물질', '경제', '사회', '정치', '부르주아', '프롤레타리아', '자본주의', '사회주의', '공산주의', '상품', '가치', '잉여가치']
  };
  
  const patterns = focusPatterns[philosophy] || [];
  const hasFocusPattern = patterns.some(pattern => 
    sentence.toLowerCase().includes(pattern.toLowerCase())
  );
  
  return hasFocusPattern;
}

function isSimpleFactualStatement(sentence) {
  // 단순한 사실 나열 문장인지 판단
  const factualPatterns = [
    /^\d+년/,  // "2023년"
    /^\d+월/,  // "3월"
    /^\d+일/,  // "15일"
    /^\d+시/,  // "오후 3시"
    /^\d+분/,  // "30분"
    /^\d+원/,  // "1000원"
    /^\d+%/,   // "5%"
    /^\d+명/,  // "100명"
    /^\d+개/,  // "10개"
    /^\d+건/,  // "5건"
    /연락처/,   // 연락처 정보
    /전화번호/, // 전화번호
    /이메일/,   // 이메일
    /주소/,     // 주소
    /홈페이지/, // 홈페이지
    /웹사이트/  // 웹사이트
  ];
  
  return factualPatterns.some(pattern => pattern.test(sentence));
}

// 재조합 버튼 상태 업데이트
function updateRecombineButton() {
  if (isComparisonMode && selectedPhilosophies.length >= 2) {
    recombineSection.style.display = 'block';
  } else {
    recombineSection.style.display = 'none';
  }
}

// 재조합 모드 시작
async function startRecombineMode() {
  isRecombineMode = true;
  cameraMode.style.display = 'flex';
  
  // 카메라 시작
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { 
        width: { ideal: 1280 },
        height: { ideal: 720 }
      } 
    });
    cameraVideo.srcObject = stream;
    
    // 떠다니는 키워드 생성
    createFloatingKeywords();
    
    // 제스처 인식 시작 (간단한 버전)
    startGestureRecognition();
    
  } catch (error) {
    console.error('카메라 접근 실패:', error);
    alert('카메라 접근이 필요합니다. 브라우저 설정을 확인해주세요.');
    closeRecombineMode();
  }
}

// 재조합 모드 닫기
function closeRecombineMode() {
  isRecombineMode = false;
  cameraMode.style.display = 'none';
  
  // MediaPipe 정리
  if (camera) {
    camera.stop();
    camera = null;
  }
  if (hands) {
    hands.close();
    hands = null;
  }
  isHandTracking = false;
  
  // 카메라 스트림 정지
  if (cameraVideo.srcObject) {
    const tracks = cameraVideo.srcObject.getTracks();
    tracks.forEach(track => track.stop());
    cameraVideo.srcObject = null;
  }
  
  // 상태 초기화
  floatingKeywords = [];
  strongKeywords = [];
  weakKeywords = [];
  floatingKeywordsContainer.innerHTML = '';
  strongKeywordsContainer.innerHTML = '';
  weakKeywordsContainer.innerHTML = '';
  createPhilosophyBtn.disabled = false; // 항상 활성화
  currentPinchTarget = null;
}

// 떠다니는 키워드 생성
function createFloatingKeywords() {
  const allKeywords = new Set();
  
  // 선택된 철학적 관점들의 키워드 수집
  selectedPhilosophies.forEach(philosophy => {
    const data = analysisData[philosophy];
    if (data && data.keywords) {
      data.keywords.forEach(keyword => allKeywords.add(keyword));
    }
  });
  
  // 키워드를 화면에 랜덤하게 배치 (박스 영역 제외)
  const keywordsArray = Array.from(allKeywords);
  keywordsArray.forEach((keyword, index) => {
    const keywordElement = document.createElement('div');
    keywordElement.className = 'floating-keyword';
    keywordElement.textContent = keyword;
    keywordElement.dataset.keyword = keyword;
    
    // 박스 영역을 피한 랜덤 위치 설정
    let x, y;
    let attempts = 0;
    do {
      x = Math.random() * 80 + 10; // 10% ~ 90%
      y = Math.random() * 70 + 10; // 10% ~ 80% (하단 박스 영역 제외)
      attempts++;
    } while (attempts < 50 && isInBoxArea(x, y)); // 박스 영역이면 다시 시도
    
    keywordElement.style.left = `${x}%`;
    keywordElement.style.top = `${y}%`;
    
    // 드래그 이벤트 추가
    addDragEvents(keywordElement);
    
    floatingKeywordsContainer.appendChild(keywordElement);
    floatingKeywords.push(keywordElement);
  });
}

// 박스 영역 확인 함수
function isInBoxArea(x, y) {
  // 박스 영역은 화면 하단 20% 영역
  return y > 80; // 80% 이상이면 박스 영역
}

// 드래그 이벤트 추가
function addDragEvents(element) {
  let isDragging = false;
  let startX, startY, initialX, initialY;
  
  element.addEventListener('mousedown', (e) => {
    isDragging = true;
    element.classList.add('dragging');
    startX = e.clientX;
    startY = e.clientY;
    initialX = element.offsetLeft;
    initialY = element.offsetTop;
    e.preventDefault();
  });
  
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;
    
    element.style.left = `${initialX + deltaX}px`;
    element.style.top = `${initialY + deltaY}px`;
  });
  
  document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    
    isDragging = false;
    element.classList.remove('dragging');
    
    // 드롭 존 확인
    checkDropZone(element);
  });
  
  // 터치 이벤트도 추가
  element.addEventListener('touchstart', (e) => {
    isDragging = true;
    element.classList.add('dragging');
    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    initialX = element.offsetLeft;
    initialY = element.offsetTop;
    e.preventDefault();
  });
  
  document.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;
    
    element.style.left = `${initialX + deltaX}px`;
    element.style.top = `${initialY + deltaY}px`;
    e.preventDefault();
  });
  
  document.addEventListener('touchend', () => {
    if (!isDragging) return;
    
    isDragging = false;
    element.classList.remove('dragging');
    checkDropZone(element);
  });
}

// 파티클 애니메이션 생성
function createParticleExplosion(x, y, color = '#ffd700') {
  const particleCount = 12;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.background = color;
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    
    // 랜덤한 방향으로 파티클 이동
    const angle = (i / particleCount) * Math.PI * 2;
    const distance = 50 + Math.random() * 100;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    
    particle.style.setProperty('--dx', `${dx}px`);
    particle.style.setProperty('--dy', `${dy}px`);
    
    particleContainer.appendChild(particle);
    
    // 애니메이션 완료 후 파티클 제거
    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, 1000);
  }
}

// 드롭 존 확인
function checkDropZone(element) {
  const rect = element.getBoundingClientRect();
  const strongRect = strongBox.getBoundingClientRect();
  const weakRect = weakBox.getBoundingClientRect();
  
  const keyword = element.dataset.keyword;
  
  // 디버깅 정보 출력
  console.log('=== 드롭 존 확인 ===');
  console.log('키워드:', keyword);
  console.log('키워드 위치:', rect);
  console.log('강하게 박스 위치:', strongRect);
  console.log('약하게 박스 위치:', weakRect);
  
  // 강하게 박스에 드롭 (매우 넓은 영역으로 확장)
  const strongOverlap = rect.left < strongRect.right + 60 && rect.right > strongRect.left - 60 &&
                       rect.top < strongRect.bottom + 60 && rect.bottom > strongRect.top - 60;
  
  if (strongOverlap) {
    console.log('강하게 박스와 겹침!');
    
    if (!strongKeywords.includes(keyword)) {
      strongKeywords.push(keyword);
      weakKeywords = weakKeywords.filter(k => k !== keyword);
      updateKeywordContainers();
      
      // 파티클 애니메이션과 함께 키워드 제거
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      createParticleExplosion(centerX, centerY, '#ff5722');
      
      element.classList.add('keyword-drop-animation');
      setTimeout(() => {
        element.remove();
      }, 500);
      
      console.log('키워드 강하게 반영:', keyword);
      
      // 시각적 피드백
      strongBox.style.background = 'rgba(255, 87, 34, 0.5)';
      setTimeout(() => {
        strongBox.style.background = '';
      }, 500);
    }
  }
  // 약하게 박스에 드롭 (더 넓은 영역으로 확장)
  else {
    const weakOverlap = rect.left < weakRect.right + 60 && rect.right > weakRect.left - 60 &&
                       rect.top < weakRect.bottom + 60 && rect.bottom > weakRect.top - 60;
    
    if (weakOverlap) {
      console.log('약하게 박스와 겹침!');
      
      if (!weakKeywords.includes(keyword)) {
        weakKeywords.push(keyword);
        strongKeywords = strongKeywords.filter(k => k !== keyword);
        updateKeywordContainers();
        
        // 파티클 애니메이션과 함께 키워드 제거
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        createParticleExplosion(centerX, centerY, '#2196f3');
        
        element.classList.add('keyword-drop-animation');
        setTimeout(() => {
          element.remove();
        }, 500);
        
        console.log('키워드 약하게 반영:', keyword);
        
        // 시각적 피드백
        weakBox.style.background = 'rgba(33, 150, 243, 0.5)';
        setTimeout(() => {
          weakBox.style.background = '';
        }, 500);
      }
    } else {
      console.log('어떤 박스와도 겹치지 않음');
    }
  }
  
  // 드래그 오버 상태 초기화
  strongBox.classList.remove('drag-over');
  weakBox.classList.remove('drag-over');
  
  // 완료 버튼은 항상 활성화
  createPhilosophyBtn.disabled = false;
}

// 키워드 컨테이너 업데이트
function updateKeywordContainers() {
  strongKeywordsContainer.innerHTML = '';
  weakKeywordsContainer.innerHTML = '';
  
  strongKeywords.forEach(keyword => {
    const tag = document.createElement('span');
    tag.className = 'keyword-tag';
    tag.textContent = keyword;
    strongKeywordsContainer.appendChild(tag);
  });
  
  weakKeywords.forEach(keyword => {
    const tag = document.createElement('span');
    tag.className = 'keyword-tag';
    tag.textContent = keyword;
    weakKeywordsContainer.appendChild(tag);
  });
}

// 완료 버튼 상태 업데이트
function updateCreateButton() {
  // 항상 활성화 (키워드가 분류되지 않아도 됨)
  createPhilosophyBtn.disabled = false;
}

// MediaPipe Hands 객체
let hands = null;
let camera = null;
let isHandTracking = false;
let currentPinchTarget = null;
let pinchStartDistance = 0;

// 제스처 인식 시작 (MediaPipe 사용)
function startGestureRecognition() {
  console.log('손 인식 시작 시도...');
  
  // MediaPipe 라이브러리 로딩 확인
  if (typeof Hands === 'undefined') {
    console.error('MediaPipe Hands가 로드되지 않았습니다. 라이브러리를 다시 로드합니다.');
    loadMediaPipeLibraries();
    return;
  }
  
  try {
    hands = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      }
    });
    
    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
    
    hands.onResults(onHandResults);
    
    // 카메라 설정
    camera = new Camera(cameraVideo, {
      onFrame: async () => {
        if (hands) {
          await hands.send({ image: cameraVideo });
        }
      },
      width: 1280,
      height: 720
    });
    
    camera.start();
    isHandTracking = true;
    console.log('MediaPipe 손 인식 시작 성공');
    
    // 제스처 상태 업데이트
    updateGestureStatus('손 인식 활성화됨');
    
  } catch (error) {
    console.error('MediaPipe 초기화 실패:', error);
    updateGestureStatus('손 인식 초기화 실패');
  }
}

// MediaPipe 라이브러리 동적 로딩
function loadMediaPipeLibraries() {
  console.log('MediaPipe 라이브러리 동적 로딩 시작...');
  
  const scripts = [
    'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js',
    'https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js',
    'https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js',
    'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js'
  ];
  
  let loadedCount = 0;
  
  scripts.forEach((src, index) => {
    const script = document.createElement('script');
    script.src = src;
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      loadedCount++;
      console.log(`MediaPipe 라이브러리 ${index + 1}/${scripts.length} 로드 완료`);
      
      if (loadedCount === scripts.length) {
        console.log('모든 MediaPipe 라이브러리 로드 완료');
        setTimeout(() => {
          startGestureRecognition();
        }, 1000);
      }
    };
    script.onerror = () => {
      console.error(`MediaPipe 라이브러리 ${index + 1} 로드 실패`);
    };
    document.head.appendChild(script);
  });
}

// 제스처 상태 업데이트
function updateGestureStatus(message) {
  const statusElement = document.getElementById('gesture-status');
  if (statusElement) {
    statusElement.querySelector('p').textContent = message;
  }
}

// 손 인식 결과 처리
function onHandResults(results) {
  const canvas = gestureCanvas;
  const ctx = canvas.getContext('2d');
  
  // 캔버스 크기 설정
  canvas.width = cameraVideo.videoWidth;
  canvas.height = cameraVideo.videoHeight;
  
  // 캔버스 초기화
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    console.log(`손 ${results.multiHandLandmarks.length}개 감지됨`);
    
    results.multiHandLandmarks.forEach((landmarks, index) => {
      // 손 랜드마크 그리기 (초록색 선)
      drawHandLandmarks(ctx, landmarks);
      
      // 핀치 제스처 감지
      const pinchInfo = detectPinchGesture(landmarks);
      if (pinchInfo.isPinching) {
        handlePinchGesture(pinchInfo, landmarks);
      } else {
        if (currentPinchTarget) {
          currentPinchTarget.classList.remove('pinch-target');
          currentPinchTarget = null;
        }
      }
    });
    
    // 제스처 상태 업데이트
    updateGestureStatus(`손 ${results.multiHandLandmarks.length}개 감지됨 - 핀치 제스처로 키워드를 드래그하세요`);
  } else {
    // 손이 감지되지 않을 때
    if (currentPinchTarget) {
      currentPinchTarget.classList.remove('pinch-target');
      currentPinchTarget = null;
    }
    updateGestureStatus('손을 카메라 앞에 대세요');
  }
}

// 손 랜드마크 그리기 (좌우반전 적용)
function drawHandLandmarks(ctx, landmarks) {
  const canvas = gestureCanvas;
  
  ctx.strokeStyle = '#00ff00';
  ctx.lineWidth = 3;
  ctx.fillStyle = '#00ff00';
  
  // 손가락 연결선 그리기 (좌우반전 적용)
  const connections = [
    [0, 1], [1, 2], [2, 3], [3, 4], // 엄지
    [0, 5], [5, 6], [6, 7], [7, 8], // 검지
    [5, 9], [9, 10], [10, 11], [11, 12], // 중지
    [9, 13], [13, 14], [14, 15], [15, 16], // 약지
    [13, 17], [17, 18], [18, 19], [19, 20], // 소지
    [0, 17] // 손목
  ];
  
  connections.forEach(([start, end]) => {
    const startPoint = landmarks[start];
    const endPoint = landmarks[end];
    
    // 좌우반전 적용
    const startX = (1 - startPoint.x) * canvas.width;
    const startY = startPoint.y * canvas.height;
    const endX = (1 - endPoint.x) * canvas.width;
    const endY = endPoint.y * canvas.height;
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  });
  
  // 랜드마크 점 그리기 (좌우반전 적용)
  landmarks.forEach((landmark, index) => {
    const x = (1 - landmark.x) * canvas.width;
    const y = landmark.y * canvas.height;
    
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI);
    ctx.fill();
  });
  
  // 엄지와 검지 끝 강조 (핀치 제스처용, 좌우반전 적용)
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  
  ctx.fillStyle = '#ff0000';
  ctx.beginPath();
  ctx.arc((1 - thumbTip.x) * canvas.width, thumbTip.y * canvas.height, 6, 0, 2 * Math.PI);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc((1 - indexTip.x) * canvas.width, indexTip.y * canvas.height, 6, 0, 2 * Math.PI);
  ctx.fill();
}

// 핀치 제스처 감지 (vibe 프로젝트 알고리즘 적용)
function detectPinchGesture(landmarks) {
  // 엄지 끝 (4번)과 검지 끝 (8번) 사이의 거리 계산
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  
  const distance = Math.sqrt(
    Math.pow(thumbTip.x - indexTip.x, 2) + 
    Math.pow(thumbTip.y - indexTip.y, 2)
  );
  
  // 더 간단한 핀치 감지 로직
  const pinchThreshold = 0.06; // 단일 임계값 사용
  
  const isPinching = distance < pinchThreshold;
  
  // 핀치 중심점 계산 (좌우반전 적용)
  const pinchCenter = {
    x: 1 - (thumbTip.x + indexTip.x) / 2, // 좌우반전
    y: (thumbTip.y + indexTip.y) / 2
  };
  
  return {
    isPinching,
    distance,
    center: pinchCenter,
    thumbTip: { x: 1 - thumbTip.x, y: thumbTip.y }, // 좌우반전
    indexTip: { x: 1 - indexTip.x, y: indexTip.y }  // 좌우반전
  };
}

// 핀치 제스처 처리
function handlePinchGesture(pinchInfo, landmarks) {
  const canvas = gestureCanvas;
  const pinchX = pinchInfo.center.x * canvas.width;
  const pinchY = pinchInfo.center.y * canvas.height;
  
  // 핀치 중심점에 시각적 표시 (더 크고 눈에 띄게)
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#E544A5';
  ctx.beginPath();
  ctx.arc(pinchX, pinchY, 12, 0, 2 * Math.PI);
  ctx.fill();
  
  // 핀치 상태 표시
  ctx.fillStyle = '#ffffff';
  ctx.font = '16px Arial';
  ctx.fillText('핀치 감지됨', pinchX + 20, pinchY - 20);
  
  // 키워드와의 충돌 감지 (더 넓은 범위)
  const floatingKeywords = document.querySelectorAll('.floating-keyword');
  let closestKeyword = null;
  let closestDistance = Infinity;
  
  floatingKeywords.forEach(keyword => {
    const rect = keyword.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    
    // 캔버스 좌표계로 변환 (키워드 중심점)
    const keywordX = rect.left - canvasRect.left + rect.width / 2;
    const keywordY = rect.top - canvasRect.top + rect.height / 2;
    
    // 핀치 중심과 키워드 중심 사이의 거리
    const distance = Math.sqrt(
      Math.pow(pinchX - keywordX, 2) + 
      Math.pow(pinchY - keywordY, 2)
    );
    
    // 가장 가까운 키워드 찾기 (100px 반경으로 확대)
    if (distance < 100 && distance < closestDistance) {
      closestKeyword = keyword;
      closestDistance = distance;
    }
    
    // 디버깅용 로그
    if (distance < 150) {
      console.log(`키워드 "${keyword.textContent}" 거리: ${distance.toFixed(1)}px`);
    }
  });
  
  // 가장 가까운 키워드가 있으면 타겟으로 설정
  if (closestKeyword) {
    if (!currentPinchTarget) {
      currentPinchTarget = closestKeyword;
      currentPinchTarget.classList.add('pinch-target');
      pinchStartDistance = pinchInfo.distance;
      console.log('키워드 잡음:', currentPinchTarget.textContent);
    }
    
    // 핀치로 키워드 이동 (vibe 프로젝트의 부드러운 드래그)
    if (currentPinchTarget === closestKeyword) {
      // 키워드 중심을 핀치 중심에 부드럽게 이동
      const keywordWidth = currentPinchTarget.offsetWidth;
      const keywordHeight = currentPinchTarget.offsetHeight;
      
      // 부드러운 이동을 위한 lerp 적용
      const targetX = pinchX - keywordWidth / 2;
      const targetY = pinchY - keywordHeight / 2;
      
      const currentLeft = parseFloat(currentPinchTarget.style.left) || 0;
      const currentTop = parseFloat(currentPinchTarget.style.top) || 0;
      
      // 선형 보간으로 부드러운 이동 (vibe 프로젝트 방식)
      const lerpFactor = 0.3; // 이동 속도 조절
      const newLeft = currentLeft + (targetX - currentLeft) * lerpFactor;
      const newTop = currentTop + (targetY - currentTop) * lerpFactor;
      
      currentPinchTarget.style.left = `${newLeft}px`;
      currentPinchTarget.style.top = `${newTop}px`;
      currentPinchTarget.style.position = 'absolute';
      
      // 드롭 존 근처에 있으면 시각적 피드백
      checkDropZoneProximity(currentPinchTarget);
    }
  }
  
        // 핀치 해제 시 드롭 존 확인
        if (currentPinchTarget && !pinchInfo.isPinching) {
          console.log('핀치 해제 - 드롭 존 확인');
          console.log('현재 핀치 타겟:', currentPinchTarget);
          checkDropZone(currentPinchTarget);
          currentPinchTarget.classList.remove('pinch-target');
          currentPinchTarget = null;
        }
        
        // 핀치가 유지되는 동안 실시간 드롭 존 확인 (더 넓은 범위)
        if (currentPinchTarget && pinchInfo.isPinching) {
          const rect = currentPinchTarget.getBoundingClientRect();
          const strongRect = strongBox.getBoundingClientRect();
          const weakRect = weakBox.getBoundingClientRect();
          
          // 매우 넓은 범위로 드롭 존 확인
          const strongOverlap = rect.left < strongRect.right + 50 && rect.right > strongRect.left - 50 &&
                               rect.top < strongRect.bottom + 50 && rect.bottom > strongRect.top - 50;
          const weakOverlap = rect.left < weakRect.right + 50 && rect.right > weakRect.left - 50 &&
                             rect.top < weakRect.bottom + 50 && rect.bottom > weakRect.top - 50;
          
          if (strongOverlap || weakOverlap) {
            console.log('실시간 드롭 존 감지! - 즉시 처리');
            checkDropZone(currentPinchTarget);
            currentPinchTarget.classList.remove('pinch-target');
            currentPinchTarget = null;
          }
        }
}

// 드롭 존 근접성 확인 (시각적 피드백)
function checkDropZoneProximity(keyword) {
  const rect = keyword.getBoundingClientRect();
  const strongRect = strongBox.getBoundingClientRect();
  const weakRect = weakBox.getBoundingClientRect();
  
  // 강하게 박스 근처 (매우 넓은 범위)
  if (rect.left < strongRect.right + 50 && rect.right > strongRect.left - 50 &&
      rect.top < strongRect.bottom + 50 && rect.bottom > strongRect.top - 50) {
    strongBox.classList.add('drag-over');
    weakBox.classList.remove('drag-over');
  }
  // 약하게 박스 근처 (매우 넓은 범위)
  else if (rect.left < weakRect.right + 50 && rect.right > weakRect.left - 50 &&
           rect.top < weakRect.bottom + 50 && rect.bottom > weakRect.top - 50) {
    weakBox.classList.add('drag-over');
    strongBox.classList.remove('drag-over');
  }
  // 둘 다 아닐 때
  else {
    strongBox.classList.remove('drag-over');
    weakBox.classList.remove('drag-over');
  }
}

// 나만의 철학적 관점 생성
async function createCustomPhilosophy() {
  // 모든 키워드 수집 (분류되지 않은 키워드는 약하게 반영)
  const allKeywords = [...strongKeywords, ...weakKeywords];
  const remainingKeywords = Array.from(document.querySelectorAll('.floating-keyword')).map(el => el.dataset.keyword);
  
  try {
    // 서버에 나만의 철학적 관점 생성 요청
    const response = await fetch('/api/create-custom-philosophy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        newsText: newsText,
        strongKeywords: strongKeywords,
        weakKeywords: [...weakKeywords, ...remainingKeywords]
      })
    });
    
    if (response.ok) {
      const customPhilosophy = await response.json();
      console.log('서버 응답:', customPhilosophy); // 디버깅용
      
      // 새로운 스키마인 경우 기존 속성 덮어쓰기 방지
      if (!customPhilosophy.perspectiveName) {
        customPhilosophy.strongKeywords = strongKeywords;
        customPhilosophy.weakKeywords = [...weakKeywords, ...remainingKeywords];
        customPhilosophy.allKeywords = [...allKeywords, ...remainingKeywords];
      }
      displayCustomPhilosophy(customPhilosophy);
    } else {
      throw new Error('서버 응답 오류');
    }
  } catch (error) {
    console.error('나만의 철학적 관점 생성 오류:', error);
    // 오류 발생 시 기본값 사용
    const customPhilosophy = {
      name: '나만의 철학적 관점',
      definition: '사용자가 선택한 키워드들을 바탕으로 한 독특한 철학적 관점입니다.',
      similarPhilosophy: '실용주의',
      strongKeywords: strongKeywords,
      weakKeywords: [...weakKeywords, ...remainingKeywords],
      allKeywords: [...allKeywords, ...remainingKeywords],
      interpretation: `강하게 반영할 키워드(${strongKeywords.join(', ')})와 약하게 반영할 키워드(${weakKeywords.join(', ')})를 바탕으로 한 나만의 독특한 철학적 관점입니다. 이 관점은 기존의 전통적인 철학적 사고를 넘어서, 개인의 경험과 가치관이 반영된 새로운 사고의 틀을 제시합니다.`
    };
    displayCustomPhilosophy(customPhilosophy);
  }
  
  // 카메라 모드 닫기
  closeRecombineMode();
}

// 나만의 철학적 관점 표시 (철학적 렌즈 생성기 스키마 적용)
function displayCustomPhilosophy(philosophy) {
  console.log('displayCustomPhilosophy 호출됨:', philosophy); // 디버깅용
  
  // 새로운 스키마인지 확인
  if (philosophy.perspectiveName) {
    console.log('새로운 스키마 감지됨'); // 디버깅용
    // 철학적 렌즈 생성기 스키마
    interpretationArea.innerHTML = `
      <div class="lens-result-content">
        <div class="perspective-name">
          <h3>${philosophy.perspectiveName.korean}</h3>
          <div class="english-name">${philosophy.perspectiveName.english}</div>
        </div>
        
        <div class="additional-perspectives">
          <h4>🔗 추천 관점</h4>
          ${philosophy.additionalPerspectives.map(perspective => `
            <div class="perspective-item">
              <h5>${perspective.name}</h5>
              <p>${perspective.reason}</p>
            </div>
          `).join('')}
        </div>
        
        <div class="analysis-grid">
          <div class="analysis-item">
            <h5>사건</h5>
            <span class="weight-indicator weight-${getWeightClass(philosophy.analysis.event.weight)}">${philosophy.analysis.event.weight}</span>
          </div>
          <div class="analysis-item">
            <h5>원인</h5>
            <span class="weight-indicator weight-${getWeightClass(philosophy.analysis.cause.weight)}">${philosophy.analysis.cause.weight}</span>
          </div>
          <div class="analysis-item">
            <h5>결과</h5>
            <span class="weight-indicator weight-${getWeightClass(philosophy.analysis.result.weight)}">${philosophy.analysis.result.weight}</span>
          </div>
          <div class="analysis-item">
            <h5>주체</h5>
            <span class="weight-indicator weight-${getWeightClass(philosophy.analysis.subject.weight)}">${philosophy.analysis.subject.weight}</span>
          </div>
          <div class="analysis-item">
            <h5>맥락</h5>
            <span class="weight-indicator weight-${getWeightClass(philosophy.analysis.context.weight)}">${philosophy.analysis.context.weight}</span>
          </div>
          <div class="analysis-item">
            <h5>인용</h5>
            <span class="weight-indicator weight-${getWeightClass(philosophy.analysis.quotation.weight)}">${philosophy.analysis.quotation.weight}</span>
          </div>
          <div class="analysis-item">
            <h5>프레이밍</h5>
            <span class="weight-indicator weight-${getWeightClass(philosophy.analysis.framing.weight)}">${philosophy.analysis.framing.weight}</span>
          </div>
          <div class="analysis-item">
            <h5>과거</h5>
            <span class="weight-indicator weight-${getWeightClass(philosophy.analysis.past.weight)}">${philosophy.analysis.past.weight}</span>
          </div>
          <div class="analysis-item">
            <h5>현재</h5>
            <span class="weight-indicator weight-${getWeightClass(philosophy.analysis.present.weight)}">${philosophy.analysis.present.weight}</span>
          </div>
          <div class="analysis-item">
            <h5>미래</h5>
            <span class="weight-indicator weight-${getWeightClass(philosophy.analysis.future.weight)}">${philosophy.analysis.future.weight}</span>
          </div>
        </div>
        
        <div class="headline-template">
          <h4>📰 헤드라인 리프레이밍 템플릿</h4>
          <div class="template-text">${philosophy.headlineTemplate}</div>
        </div>
        
        <div class="visual-guide">
          <h4>🎨 시각적 스타일 가이드</h4>
          <div class="color-palette">
            <div class="color-swatch" style="background-color: ${philosophy.visualGuide.primaryColor}">
              Primary
            </div>
            <div class="color-swatch" style="background-color: ${philosophy.visualGuide.secondaryColor}">
              Secondary
            </div>
          </div>
          <div class="symbol-display">${philosophy.visualGuide.symbol}</div>
        </div>
        
        <div class="bias-warning">
          <h4>⚠️ 위험요소/편향과 균형잡기 팁</h4>
          <p>${philosophy.biasWarning}</p>
        </div>
      </div>
    `;
  } else {
    // 기존 스키마 (호환성 유지)
    interpretationArea.innerHTML = `
      <h3>🎨 ${philosophy.name}</h3>
      <div class="philosophy-definition">
        <strong>📖 정의:</strong><br>
        <span style="line-height: 1.6; color: #444;">${philosophy.definition || '사용자가 선택한 키워드들을 바탕으로 한 독특한 철학적 관점입니다.'}</span>
      </div>
      <div class="similar-philosophy">
        <strong>🔗 유사한 철학적 관점:</strong> 
        <span style="color: #E544A5; font-weight: 600;">${philosophy.similarPhilosophy || '실용주의'}</span>
      </div>
      <div class="keywords">
        <strong>💪 강하게 반영:</strong> 
        <span style="color: #ff5722; font-weight: 600;">${philosophy.strongKeywords.join(', ')}</span>
      </div>
      <div class="keywords">
        <strong>🤏 약하게 반영:</strong> 
        <span style="color: #2196f3; font-weight: 600;">${philosophy.weakKeywords.join(', ')}</span>
      </div>
      <div class="interpretation">
        <strong>💭 해석:</strong><br>
        <span style="line-height: 1.6; color: #444;">${philosophy.interpretation}</span>
      </div>
    `;
  }
  
  // 뉴스 텍스트를 나만의 관점으로 하이라이트
  highlightCustomPhilosophy(philosophy);
}

// 나만의 철학적 관점으로 하이라이트
function highlightCustomPhilosophy(philosophy) {
  let highlightedText = currentNewsText;
  
  // 새로운 스키마인 경우 키워드 하이라이트 생략 (구조적 분석에 집중)
  if (philosophy.perspectiveName) {
    newsContent.innerHTML = highlightedText;
    return;
  }
  
  // 기존 스키마인 경우 키워드 하이라이트
  if (philosophy.strongKeywords) {
    philosophy.strongKeywords.forEach(keyword => {
      const regex = new RegExp(`(${keyword})`, 'gi');
      highlightedText = highlightedText.replace(regex, `<span class="highlight strong-philosophy">$1</span>`);
    });
  }
  
  if (philosophy.weakKeywords) {
    philosophy.weakKeywords.forEach(keyword => {
      const regex = new RegExp(`(${keyword})`, 'gi');
      highlightedText = highlightedText.replace(regex, `<span class="highlight weak-philosophy">$1</span>`);
    });
  }
  
  newsContent.innerHTML = highlightedText;
}

// 새 기사 분석하기 버튼 (분석 섹션에 추가)
function addNewAnalysisButton() {
  const newAnalysisBtn = document.createElement('button');
  newAnalysisBtn.textContent = '새 기사 분석하기';
  newAnalysisBtn.style.marginTop = '20px';
  newAnalysisBtn.style.background = '#6c757d';
  newAnalysisBtn.addEventListener('click', () => {
    // 초기 상태로 리셋
    currentNewsText = '';
    analysisData = {};
    currentActivePhilosophy = null;
    selectedPhilosophies = [];
    isRecombineMode = false;
    
    // UI 리셋
    inputSection.style.display = 'block';
    analysisSection.style.display = 'none';
    newsInput.value = '';
    
    // 버튼 상태 리셋
    philosophyButtons.forEach(btn => {
      btn.classList.remove('active', 'checked');
    });
    
    // 재조합 섹션 숨기기
    recombineSection.style.display = 'none';
  });
  
  analysisSection.appendChild(newAnalysisBtn);
}


// 페이지 로드 시 새 기사 분석 버튼 추가
document.addEventListener('DOMContentLoaded', () => {
  addNewAnalysisButton();
});