window.LESSON = {
statuses:[
{id:'royal',name:'왕·왕족',short:'왕·왕족',weight:0.5,color:'#aa6a42',text:'왕과 왕비, 왕의 자녀 등 왕실에 속한 사람들이에요.'},
{id:'yangban',name:'양반',short:'양반',weight:6,color:'#7d8c66',text:'학문을 익히거나 관직에 나아가 정치에 참여하던 지배층이에요.'},
{id:'technical',name:'기술관 계층',short:'기술관',weight:3.5,color:'#8da9ad',text:'의학·통역·법률 같은 전문 지식을 갖추고 관청에서 일했어요. 후대에는 중인으로 불린 사람들이 포함돼요.'},
{id:'common',name:'상민',short:'상민',weight:57,color:'#dab77a',text:'농업·상업·수공업 등 여러 일을 맡아 사회를 떠받쳤어요.'},
{id:'low',name:'천민',short:'천민',weight:33,color:'#b59789',text:'노비 등 신분 때문에 차별과 제약을 겪던 사람들이에요. 신분은 사람의 가치나 능력을 나타내지 않아요.'}
],
roles:[
['king','왕','royal','male','나라의 중요한 일을 신하들과 의논하고 결정했어요.','royal','audience','heuklip'],
['prince','왕자·세자','royal','male','왕의 아들이에요. 왕위를 이을 세자는 나라를 다스리는 공부를 했어요.','prince','study','yugeon'],
['queen','왕비','royal','female','왕의 배우자로서 왕실의 예법과 궁중의 여러 일을 살폈어요.','queen','audience','jjog_meori'],
['princess','공주','royal','female','왕과 왕비의 딸이에요. 왕실의 예법을 배우고 생활했어요.','princess','garden','jjog_meori'],
['civil','문관','yangban','male','문서를 다루고 나라나 고을의 일을 처리했어요.','official','writing','heuklip'],
['military','무관','yangban','male','군사를 훈련하고 나라를 지키는 일을 맡았어요.','military','guard','sangtu'],
['student','성균관 유생','yangban','male','성균관에서 유학을 공부한 학생이에요. 직업이라기보다 공부하는 역할이에요.','student','study','yugeon'],
['graduate','과거 급제자','yangban','male','과거 시험에 합격한 사람이에요. 급제는 직업이 아니라 시험에 합격한 상태예요.','graduate','celebrate','yugeon'],
['scholar','선비·학자','yangban','male','책을 읽고 학문을 연구하며 제자를 가르치기도 했어요.','scholar','reading_writing_01','yugeon'],
['artist','시인·예술가','yangban','female','시를 짓거나 그림을 그리며 생각을 표현했어요. 여성에게는 관직 진출 등 여러 기회가 제한되었어요.','yangbanwoman','writing','jjog_meori'],
['doctor','의관','technical','male','의학을 공부하여 사람의 병을 살피고 치료했어요.','scholar','medicine','yugeon'],
['medicalwoman','의녀','technical','female','의학을 배워 여성 환자를 돌보았어요. 관청 소속 노비 여성이 교육을 받기도 해, 신분과 역할이 늘 일치하지 않는 사례예요.','daily','medicine','jjog_meori'],
['interpreter','역관','technical','male','다른 나라 사람들과 말을 주고받도록 통역했어요.','scholar','market','heuklip'],
['law','율관','technical','male','법률을 익혀 관청의 재판과 법 해석을 도왔어요.','scholar','writing','yugeon'],
['accountant','산관','technical','male','수를 계산하여 나라의 재정과 행정 일을 도왔어요.','scholar','writing','yugeon'],
['painter','화원','technical','male','관청에서 왕실 행사나 지도 등을 그림으로 남겼어요.','scholar','reading_writing_03','sangtu'],
['farmer','농민','common','any','곡식과 채소를 길렀어요. 자기 땅이나 빌린 땅에서 농사짓기도 했어요.','daily','farming','headtowel'],
['merchant','상인','common','any','가게와 장터에서 생활에 필요한 물건을 사고팔았어요.','daily','market','pae_raeng_i'],
['artisan','장인','common','any','손기술로 옷감·그릇·가구 등 생활에 필요한 물건을 만들었어요.','daily','crafting_04','headtowel'],
['farmservant','노비의 농사일','low','any','노비는 직업이 아니라 신분이에요. 농사일을 하는 노비도 있었어요.','daily','farming','headtowel'],
['housework','노비의 집안일','low','any','집안 살림과 여러 노동을 맡았어요. 노비의 생활은 맡은 일과 상황에 따라 달랐어요.','daily','carrying','headtowel'],
['publicservant','관청 소속 노비','low','any','관청에 소속되어 물건을 나르거나 관청에서 필요한 일을 했어요.','daily','carrying','headtowel'],
['performer','광대·재인','low','any','음악과 춤, 여러 재주를 보여 주는 공연을 했어요.','performer','performance','sangtu'],
['gisaeng','기생·예인','low','female','관청에 소속되어 노래·춤·악기 연주 등을 맡았어요.','performer','playing_music_05','jjog_meori']
].map(([id,name,status,gender,text,outfit,pose,hair])=>({id,name,status,gender,text,outfit,pose,hair})),
figures:[
['sejong','royal','male','이도 · 세종','이도','king','1397–1450. 훈민정음을 만들고 농업·과학·음악의 발전을 이끈 왕이에요.','E0029857'],
['munjong','royal','male','이향 · 문종','이향','prince','1414–1452. 오랫동안 세자로서 나라의 일을 익혔고, 뒤에 문종이 되었어요.','E0019665'],
['anpyeong','royal','male','이용 · 안평대군','이용','prince','1418–1453. 세종의 셋째 아들로 글씨와 그림을 좋아하고 예술을 후원했어요.','E0035085'],
['soheon','royal','female','소헌왕후 심씨','소헌왕후 심씨','queen','1395–1446. 세종의 왕비예요. 왕비는 혼인 전 자신의 성씨를 사용했어요.','E0030354'],
['jeonghui','royal','female','정희왕후 윤씨','정희왕후 윤씨','queen','1418–1483. 세조의 왕비로, 어린 성종을 대신해 정치를 돌보기도 했어요.','E0051217'],
['munjeong','royal','female','문정왕후 윤씨','문정왕후 윤씨','queen','1501–1565. 중종의 왕비이자 명종의 어머니로 어린 왕을 대신해 정치를 맡았어요.','E0019662'],
['jeongui','royal','female','정의공주 · 이씨','정의공주','princess','세종의 둘째 딸이에요. 책력과 산술에 밝았고 불교 경전을 간행하는 데 참여했어요. 개인 이름 대신 알려진 칭호를 사용해요.','E0074105'],
['toegye','yangban','male','이황 · 퇴계','이황','scholar','1501–1570. 학문을 연구하고 제자를 가르친 학자예요. 퇴계는 이름이 아니라 호예요.','E0046626'],
['yulgok','yangban','male','이이 · 율곡','이이','scholar','1536–1584. 학문을 연구하고 관리로서 나라를 위한 여러 개혁을 제안했어요.','E0045546'],
['saimdang','yangban','female','신사임당','신사임당','artist','1504–1551. 풀벌레와 풍경 등을 그린 예술가예요. 사임당은 널리 알려진 호칭이에요.','E0033037'],
['nanseolheon','yangban','female','허초희 · 허난설헌','허초희','artist','1563–1589. 자신의 생각과 감정을 한시로 표현한 시인이에요. 난설헌은 호예요.','E0063034']
].map(([id,status,gender,label,name,role,bio,article])=>({id,status,gender,label,name,role,bio,url:'https://encykorea.aks.ac.kr/Article/'+article})),
names:{male:'삼돌이 삼보 식이 기덕 성두 길서 수룡 욱이 학보 득추 문수 박추 천수 윤패 명준 진수 뭉태 영득 치삼 득아 들께 쇠다리 시봉 철한 억쇠 득보 덕근 수택 돌쇠 길보 견만 기섭 대섭 윤섭 용칠이 장손 기선 만득이 복돌 준이 구길 돌이 붓들이 만이 칠성 바우'.split(' '),female:'복녀 순이 기특 얌전 확실이 이쁜이 모화 낭이 술이 중실 옥분 동이 분녀 순야 옥녀 을손 월손 섭춘 점순 봉필 덕순 분이 설희 용녀 정이 필련 기실 정아 필녀 선이 순녀 옥남 연이 춘례 구월이 화산댁 복술 해순 탄실 떠벌네 판례'.split(' '),lowMale:'복이 선이 돌쇠 곱단이 곱동 동고리 고맹이'.split(' '),lowFemale:'간난이 아기 언년 분해 서운 음전이 복이 선이 홍이 곱단이'.split(' ')},
recordNames:'강아지 개야지 삽사리 수캐 도야지 도아지 대야지 마아지 매아지 몽아지 가막이 가마귀 두로미 감실 거묵개 거묵이 곱단이 곱동 고온개 입분덕 어여비 입분이 족고만 고맹이 동고리'.split(' '),
outfits:[
['daily','생활 한복',['technical','common','low'],'#ddca9a'],['scholar','학자·기술관의 포',['yangban','technical'],'#b5c3bb'],['official','문관 관복',['yangban'],'#436f86'],['military','무관 차림',['yangban'],'#81574b'],['student','유생 차림',['yangban'],'#acc3d1'],['graduate','급제 축하 차림',['yangban'],'#b86254'],['yangbanwoman','양반 여성 한복',['yangban'],'#ab7077'],['royal','왕의 곤룡포',['royal'],'#a94d3d'],['prince','왕자·세자 예복',['royal'],'#3e6681'],['queen','왕비의 예복',['royal'],'#749987'],['princess','공주의 예복',['royal'],'#d5a25c'],['performer','풍물 공연복',['low'],'#7d9d87'],['dance_robe','황초삼 공연복',['low'],'#d4b150'],['palace','앞치마 나인복',['royal','low'],'#8fa48e']
].map(([id,name,statuses,color])=>({id,name,statuses,color})),
headgear:[{alias:'ikseongwan',name:'익선관 · 왕의 모자'},{alias:'samo',name:'사모 · 관리의 모자'}],
poses:[['audience','이야기 나누기'],['study','책 펼쳐 공부하기'],['writing','기록하고 그리기'],['guard','순찰 나가기'],['celebrate','기쁜 소식에 춤추기'],['garden','뜰 거닐기'],['medicine','처방 기록하기'],['farming','밭일 뒤 잠시 쉬기'],['market','장터에 물건 내놓기'],['carrying','일터로 걷기'],['performance','재주 펼치기']].map(([alias,label])=>({alias,label}))
};
