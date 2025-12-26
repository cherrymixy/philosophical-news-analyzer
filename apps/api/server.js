require('dotenv').config();

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// OpenAI API 키 확인
if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠️  OPENAI_API_KEY가 설정되지 않았습니다. .env 파일을 확인하세요.');
}

// 미들웨어 설정
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

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
    
    if (!newsText) {
      return res.status(400).json({ error: '뉴스 텍스트가 필요합니다.' });
    }
    
    // 키워드가 비어있으면 기본값 설정
    const finalStrongKeywords = strongKeywords && strongKeywords.length > 0 ? strongKeywords : ['자유', '선택'];
    const finalWeakKeywords = weakKeywords && weakKeywords.length > 0 ? weakKeywords : ['책임', '의미'];

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
            content: `당신은 창의적인 "철학적 렌즈 생성기"입니다. 주어진 키워드들을 바탕으로 독창적이고 실용적인 철학적 관점을 생성합니다.

중요: 반드시 유효한 JSON 형식으로만 응답하세요. 다른 설명이나 텍스트는 포함하지 마세요.

JSON 스키마:
{
  "perspectiveName": {
    "korean": "창의적인 한국어 관점 이름 (예: 디지털 자유주의, 현실적 이상주의 등)",
    "english": "Creative English Perspective Name"
  },
  "additionalPerspectives": [
    {
      "name": "관련 철학적 관점 이름",
      "reason": "현대 뉴스 해석에 유용한 이유"
    },
    {
      "name": "보완적 관점 이름", 
      "reason": "균형잡힌 시각을 위한 이유"
    }
  ],
  "analysis": {
    "event": {"weight": "크게"},
    "cause": {"weight": "중간"},
    "result": {"weight": "크게"},
    "subject": {"weight": "중간"},
    "context": {"weight": "크게"},
    "quotation": {"weight": "작게"},
    "framing": {"weight": "중간"},
    "past": {"weight": "작게"},
    "present": {"weight": "크게"},
    "future": {"weight": "중간"}
  },
  "headlineTemplate": "[주체]의 [키워드]적 관점에서 바라본 [사건명]",
  "visualGuide": {
    "primaryColor": "#667eea",
    "secondaryColor": "#764ba2", 
    "symbol": "🎯"
  },
  "biasWarning": "이 관점의 한계와 균형잡힌 시각을 위한 조언"
}

지침:
- 키워드의 의미를 창의적으로 해석하여 독특한 관점명 생성
- 현실적이고 실용적인 내용으로 구성
- JSON 형식만 응답하고 다른 텍스트는 절대 포함하지 않음`
          },
          {
            role: 'user',
            content: `뉴스 내용: ${newsText}

강하게 반영할 키워드: ${finalStrongKeywords.join(', ')}
약하게 반영할 키워드: ${finalWeakKeywords.join(', ')}

위 키워드들을 바탕으로 창의적이고 독창적인 철학적 관점을 생성해주세요. 

요구사항:
1. 관점명은 키워드의 의미를 반영하되 독창적으로 만드세요
2. 추천 관점 2개를 현대적이고 실용적으로 제시하세요
3. 분석 가중치는 키워드의 특성을 고려하여 설정하세요
4. 헤드라인 템플릿은 실제 뉴스에 바로 적용할 수 있는 구체적인 문장으로 작성하세요 (예: "○○의 관점에서 보는 [사건명]", "[주체]의 [키워드]적 선택이 [결과]로 이어지다" 등)
5. 색상과 심볼은 관점의 성격에 맞게 선택하세요
6. 편향 경고는 현실적이고 도움이 되는 조언으로 작성하세요

반드시 JSON 형식으로만 응답하세요.`
          }
        ],
        max_tokens: 1500,
        temperature: 0.8
      })
    });

    const data = await response.json();
    
    if (response.ok && data.choices && data.choices[0]) {
      const content = data.choices[0].message.content.trim();
      console.log('OpenAI 응답 내용:', content); // 디버깅용
      
      try {
        // JSON 코드 블록이 있는 경우 추출
        let jsonContent = content;
        if (content.includes('```json')) {
          const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
          if (jsonMatch) {
            jsonContent = jsonMatch[1];
          }
        } else if (content.includes('```')) {
          const codeMatch = content.match(/```\s*([\s\S]*?)\s*```/);
          if (codeMatch) {
            jsonContent = codeMatch[1];
          }
        }
        
        const parsed = JSON.parse(jsonContent);
        console.log('파싱된 JSON:', parsed); // 디버깅용
        res.json(parsed);
      } catch (parseError) {
        console.error('JSON 파싱 오류:', parseError); // 디버깅용
        console.error('원본 내용:', content); // 디버깅용
        
        // 키워드 기반으로 동적으로 기본값 생성
        const strongKeyword = finalStrongKeywords[0] || '자유';
        const weakKeyword = finalWeakKeywords[0] || '책임';
        
        res.json({
          perspectiveName: {
            korean: `${strongKeyword} 중심주의`,
            english: `${strongKeyword}-Centrism`
          },
          additionalPerspectives: [
            {
              name: "현대 실용주의",
              reason: "실제 뉴스 해석에 바로 적용할 수 있는 실용적 접근"
            },
            {
              name: "균형적 관점",
              reason: `${weakKeyword}을 고려한 균형잡힌 시각 제공`
            }
          ],
          analysis: {
            event: {"weight": "크게"},
            cause: {"weight": "중간"},
            result: {"weight": "크게"},
            subject: {"weight": "중간"},
            context: {"weight": "크게"},
            quotation: {"weight": "작게"},
            framing: {"weight": "중간"},
            past: {"weight": "작게"},
            present: {"weight": "크게"},
            future: {"weight": "중간"}
          },
          headlineTemplate: `[주체]의 ${strongKeyword}적 관점에서 바라본 [사건명]`,
          visualGuide: {
            primaryColor: "#667eea",
            secondaryColor: "#764ba2",
            symbol: "🎯"
          },
          biasWarning: `${strongKeyword} 중심적 편향을 인식하고 ${weakKeyword}의 관점도 함께 고려하여 균형잡힌 해석을 하세요.`
        });
      }
    } else {
      console.error('OpenAI API 오류:', data);
      res.status(500).json({ error: 'OpenAI API 호출 실패', details: data });
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