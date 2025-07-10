const btn = document.getElementById('generate-btn');
const input = document.getElementById('goal-input');
const resultBox = document.getElementById('result-box');

btn.addEventListener('click', async () => {
  const goal = input.value.trim();
  if (!goal) {
    resultBox.innerHTML = '<span style="color:#d00">목표를 입력해 주세요.</span>';
    return;
  }
  // 목표를 localStorage에 저장
  localStorage.setItem('user_goal', goal);
  // 학습 프로세스 페이지로 이동
  window.location.href = 'process.html';
});
