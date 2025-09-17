// 👇 맨 위에 추가!
require('dotenv').config();

// 필요한 모듈
const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY  // 👈 .env에서 안전하게 가져옴!
});

// 테스트 출력 (선택)
console.log("🔐 API 키 확인:", process.env.OPENAI_API_KEY);
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // 현재 디렉토리의 정적 파일 제공

// 철학적 뉴스 분석 엔드포인트
app.post('/api/analyze-news', async (req, res) => {
  try {
    const { newsText } = req.body;
    
    if (!newsText) {
      return res.status(400).json({ error: '뉴스 텍스트가 필요합니다.' });
    }

    // 5가지 철학적 관점별 분석
    const philosophies = [
      {
        name: 'platonism',
        koreanName: '플라톤주의',
        keywords: ['이데아', '진리', '이상', '정의', '지혜', '선', '완벽성', '영혼', '형상', '동굴의 비유'],
        prompt: `플라톤주의 관점에서 이 뉴스를 분석해주세요. 이데아, 진리, 이상, 정의, 지혜, 선, 완벽성, 영혼, 형상 등의 키워드를 중심으로 현실과 이상의 관계, 진리의 추구, 정의의 실현 등을 고려하여 분석해주세요.`
      },
      {
        name: 'kantianism',
        koreanName: '칸트주의',
        keywords: ['의무', '도덕법칙', '자율성', '정언명령', '이성', '존엄성', '보편성', '의지', '선의지', '정언명령'],
        prompt: `칸트주의 관점에서 이 뉴스를 분석해주세요. 의무, 도덕법칙, 자율성, 정언명령, 이성, 존엄성, 보편성, 의지 등의 키워드를 중심으로 도덕적 의무, 보편적 도덕법칙, 인간의 존엄성 등을 고려하여 분석해주세요.`
      },
      {
        name: 'nietzscheanism',
        koreanName: '니체주의',
        keywords: ['권력의지', '초인', '영원회귀', '가치전도', '창조', '생명력', '개별성', '극복', '신의 죽음', '가치창조'],
        prompt: `니체주의 관점에서 이 뉴스를 분석해주세요. 권력의지, 초인, 영원회귀, 가치전도, 창조, 생명력, 개별성, 극복 등의 키워드를 중심으로 가치의 재평가, 개인의 창조적 힘, 전통적 가치의 극복 등을 고려하여 분석해주세요.`
      },
      {
        name: 'existentialism',
        koreanName: '실존주의',
        keywords: ['자유', '선택', '책임', '불안', '죽음', '의미창조', '진정성', '현존재', '존재선행', '절망'],
        prompt: `실존주의 관점에서 이 뉴스를 분석해주세요. 자유, 선택, 책임, 불안, 죽음, 의미창조, 진정성, 현존재 등의 키워드를 중심으로 인간의 자유와 책임, 존재의 의미, 진정한 삶의 방식 등을 고려하여 분석해주세요.`
      },
      {
        name: 'marxism',
        koreanName: '마르크스주의',
        keywords: ['계급', '자본', '착취', '변증법', '혁명', '생산관계', '이데올로기', '노동', '소외', '물질적 조건'],
        prompt: `마르크스주의 관점에서 이 뉴스를 분석해주세요. 계급, 자본, 착취, 변증법, 혁명, 생산관계, 이데올로기, 노동 등의 키워드를 중심으로 계급 갈등, 자본주의의 모순, 사회적 변혁의 필요성 등을 고려하여 분석해주세요.`
      }
    ];

    const analysisResults = {};

    // 각 철학적 관점별로 분석 수행
    for (const philosophy of philosophies) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: `당신은 ${philosophy.koreanName} 전문가입니다. 주어진 뉴스를 ${philosophy.koreanName} 관점에서 분석하고, 핵심 키워드 3-5개와 해석 문장을 제공해주세요.`
              },
              {
                role: 'user',
                content: `${philosophy.prompt}\n\n뉴스 내용: ${newsText}\n\n응답 형식: {"keywords": ["키워드1", "키워드2", "키워드3"], "interpretation": "해석 문장"}`
              }
            ],
            max_tokens: 500,
            temperature: 0.7
          })
        });

        const data = await response.json();
        
        if (response.ok && data.choices && data.choices[0]) {
          const content = data.choices[0].message.content;
          try {
            const parsed = JSON.parse(content);
            analysisResults[philosophy.name] = {
              keywords: parsed.keywords || philosophy.keywords.slice(0, 3),
              interpretation: parsed.interpretation || `${philosophy.koreanName} 관점에서의 분석이 필요합니다.`
            };
          } catch (parseError) {
            // JSON 파싱 실패 시 기본값 사용
            analysisResults[philosophy.name] = {
              keywords: philosophy.keywords.slice(0, 3),
              interpretation: content || `${philosophy.koreanName} 관점에서의 분석이 필요합니다.`
            };
          }
        } else {
          // API 호출 실패 시 기본값 사용
          analysisResults[philosophy.name] = {
            keywords: philosophy.keywords.slice(0, 3),
            interpretation: `${philosophy.koreanName} 관점에서 이 뉴스는 중요한 철학적 함의를 담고 있습니다.`
          };
        }
      } catch (error) {
        console.error(`${philosophy.name} 분석 에러:`, error);
        // 에러 발생 시 기본값 사용
        analysisResults[philosophy.name] = {
          keywords: philosophy.keywords.slice(0, 3),
          interpretation: `${philosophy.koreanName} 관점에서 이 뉴스는 중요한 철학적 함의를 담고 있습니다.`
        };
      }
    }

    res.json(analysisResults);
  } catch (error) {
    console.error('서버 에러:', error);
    res.status(500).json({ error: '서버 내부 오류' });
  }
});


// 나만의 철학적 관점 생성 엔드포인트 (철학적 렌즈 생성기 스키마 적용)
app.post('/api/create-custom-philosophy', async (req, res) => {
  try {
    const { newsText, strongKeywords, weakKeywords } = req.body;
    
    if (!newsText || !strongKeywords || !weakKeywords) {
      return res.status(400).json({ error: '뉴스 텍스트와 키워드가 필요합니다.' });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `당신은 "철학적 렌즈 생성기"입니다. 사용자가 선택한 키워드를 바탕으로 창의적인 개인 맞춤 철학적 관점을 생성합니다.

반드시 아래 JSON 스키마를 정확히 따라야 합니다:
{
  "perspectiveName": {
    "korean": "한국어 관점 이름",
    "english": "English Perspective Name"
  },
  "additionalPerspectives": [
    {
      "name": "추천 관점 이름",
      "reason": "현대 뉴스 해석과 연결되는 이유"
    }
  ],
  "analysis": {
    "event": {"weight": "크게/중간/작게"},
    "cause": {"weight": "크게/중간/작게"},
    "result": {"weight": "크게/중간/작게"},
    "subject": {"weight": "크게/중간/작게"},
    "context": {"weight": "크게/중간/작게"},
    "quotation": {"weight": "크게/중간/작게"},
    "framing": {"weight": "크게/중간/작게"},
    "past": {"weight": "크게/중간/작게"},
    "present": {"weight": "크게/중간/작게"},
    "future": {"weight": "크게/중간/작게"}
  },
  "headlineTemplate": "헤드라인 리프레이밍 템플릿",
  "visualGuide": {
    "primaryColor": "#색상코드",
    "secondaryColor": "#색상코드",
    "symbol": "대표 심볼/이모지"
  },
  "biasWarning": "위험요소/편향과 균형잡기 팁"
}

규칙:
1. 관점 이름은 한국어/영문 모두 제공
2. 과장된 수사 대신 핵심 의미와 적용 규칙을 크리에이티브하게 제시
3. 추천 관점은 현대 뉴스 해석과 연결되도록 이유 제시
4. 분석 파트에서는 키워드가 기사 구성요소와 시간성에서 어디를 강조하는지 가중치로 표시
5. 간결·명료·실전 적용 가능하게 작성`
          },
          {
            role: 'user',
            content: `뉴스 내용: ${newsText}

강하게 반영할 키워드: ${strongKeywords.join(', ')}
약하게 반영할 키워드: ${weakKeywords.join(', ')}

이 키워드들의 조합을 바탕으로 개인 맞춤 철학적 관점을 생성해주세요. 플라톤/칸트/니체/실존/마르크스주의 외의 창의적인 관점을 제시하고, 현대 뉴스 해석에 실용적으로 적용할 수 있도록 해주세요.`
          }
        ],
        max_tokens: 1500,
        temperature: 0.8
      })
    });

    const data = await response.json();
    
    if (response.ok && data.choices && data.choices[0]) {
      const content = data.choices[0].message.content;
      console.log('OpenAI 응답 내용:', content); // 디버깅용
      try {
        const parsed = JSON.parse(content);
        console.log('파싱된 JSON:', parsed); // 디버깅용
        res.json(parsed);
      } catch (parseError) {
        console.error('JSON 파싱 오류:', parseError); // 디버깅용
        // JSON 파싱 실패 시 기본값 사용
        res.json({
          perspectiveName: {
            korean: "키워드 중심주의",
            english: "Keyword-Centrism"
          },
          additionalPerspectives: [
            {
              name: "디지털 실용주의",
              reason: "현대 뉴스의 디지털 특성을 반영한 실용적 접근"
            }
          ],
          analysis: {
            event: {"weight": "중간"},
            cause: {"weight": "크게"},
            result: {"weight": "중간"},
            subject: {"weight": "작게"},
            context: {"weight": "크게"},
            quotation: {"weight": "작게"},
            framing: {"weight": "중간"},
            past: {"weight": "작게"},
            present: {"weight": "크게"},
            future: {"weight": "중간"}
          },
          headlineTemplate: "키워드 중심의 새로운 관점에서 보는 [사건]",
          visualGuide: {
            primaryColor: "#007aff",
            secondaryColor: "#ff6b6b",
            symbol: "🔍"
          },
          biasWarning: "키워드 중심적 편향을 인식하고 다양한 관점을 고려하세요."
        });
      }
    } else {
      res.status(500).json({ error: 'OpenAI API 호출 실패' });
    }
  } catch (error) {
    console.error('서버 에러:', error);
    res.status(500).json({ error: '서버 내부 오류' });
  }
});

// 기존 GPT API 엔드포인트 (호환성을 위해 유지)
app.post('/api/gpt', async (req, res) => {
  try {
    const { messages } = req.body;
    
    if (!messages) {
      return res.status(400).json({ error: '메시지가 필요합니다.' });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages,
        max_tokens: 1500,
        temperature: 0.7
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API 에러:', data);
      return res.status(response.status).json({ 
        error: 'OpenAI API 호출 실패', 
        details: data 
      });
    }

    res.json(data);
  } catch (error) {
    console.error('서버 에러:', error);
    res.status(500).json({ error: '서버 내부 오류' });
  }
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  console.log('OpenAI API 키가 설정되었는지 확인하세요.');
}); 