"use strict";

function guide() {
  openModal(
    "수업과 저장 도움말",
    `<p>초등 사회 시간에 조선 시대 사람의 생활을 상상하는 활동이에요.</p><ol><li><b>신분 뽑기</b> — 최대 네 번 뽑고, 회차별 결과 중 하나를 골라요. 네 번째 추첨 뒤에도 직접 선택하며, 마음에 드는 결과가 있으면 중간에도 시작할 수 있어요.</li><li><b>인물 정하기</b> — 성별, 이름, 대표적인 역할을 골라요.</li><li><b>꾸미고 쓰기</b> — 옷과 동작을 고르고, 만난 사람과 하루의 사건을 상상해요.</li><li><b>함께 만들기</b> — 완성 화면에서 작품 파일(JSON)을 내려받아 선생님께 전달해요. 선생님 기기에서 여러 파일을 가져온 뒤 최대 26명을 배치해요.</li></ol><h3>작품 보관</h3><p>작품과 배치는 현재 브라우저에 저장돼요. 다른 기기와 자동으로 동기화되지는 않아요. 브라우저 데이터를 지우면 사라질 수 있으니 작품 파일로 보관해 주세요. 학생 실명 대신 가상 인물 이름을 사용해도 돼요.</p><h3>함께 이야기해요</h3><p>누구의 노동이 다른 사람의 하루를 도왔을까요? 신분 때문에 기회가 달랐던 사회와 오늘날을 비교해 보세요.</p>`,
  );
}

function sources() {
  openModal(
    "수업 자료와 그림 출처",
    `<p>15~16세기 조선의 사회를 중심으로 구성했어요. 신분·직업·이름·복식에는 시기와 개인에 따른 차이가 있어요. 꾸미기 그림은 여러 시기의 요소를 간단히 표현했으며, 복식의 정밀한 고증 자료는 아니에요.</p><h3>신분과 역할</h3><ul><li><a target="_blank" rel="noopener" href="https://contents.history.go.kr/front/hm/print.do?levelId=hm_084_0040&tabId=01&treeId=010503">국사편찬위원회 — 기술관에 대한 차별</a></li><li><a target="_blank" rel="noopener" href="https://contents.history.go.kr/eh_kk/teach/notebook/hacsoob/v/42/42.html">국사편찬위원회 — 중인 계층의 형성</a></li><li><a target="_blank" rel="noopener" href="https://contents.history.go.kr/front/ta/view.do?levelId=ta_m61_0080_0020">국사편찬위원회 — 상민의 생활</a></li><li><a target="_blank" rel="noopener" href="https://encykorea.aks.ac.kr/Article/E0012757">한국민족문화대백과사전 — 노비</a></li></ul><p>왕실·양반의 실제 인물 설명은 이름 추천 아래의 한국민족문화대백과사전 링크에서 확인할 수 있어요. 조선 전기에는 ‘기술관 계층’으로 안내하며, ‘중인’이라는 명칭이 후대에 널리 쓰였음을 구분해요.</p>${probabilityHistoryHtml()}<h3>글꼴과 아이콘</h3><p>본문은 <a href="https://github.com/orioncactus/pretendard" target="_blank" rel="noopener">Pretendard</a>, 아이콘은 <a href="https://github.com/toss/tossface" target="_blank" rel="noopener">Tossface</a>를 사용해요.</p><h3>그림</h3><p>원본 그림 부품: <a href="https://pungsokdo.com/main" target="_blank" rel="noopener">모두의 풍속도 2026 · 국가유산진흥원</a>. 추가 의상·생활 도구·배경은 이 수업을 위해 간단히 그린 그림이에요. 이 사이트는 공식 서비스와 별개입니다.</p><p><a href="https://kh.or.kr/program/view/menu/527?idx=852&viewType=date" target="_blank" rel="noopener">공식 콘텐츠 이용 안내</a>에 따라 재사용 범위를 확인해 주세요. 다운로드가 자유로운 재배포 허가를 의미하지 않아요. 문의: royalculture1@kh.or.kr</p>`,
  );
}

function padletGuide() {
  openModal(
    "패들렛에 우리 작품 올리기",
    `<ol><li>완성 화면의 <b>인물 카드 PNG 저장</b> 또는 풍속화의 <b>풍속화 PNG 저장</b>을 눌러요.</li><li>선생님이 공유한 패들렛 보드를 열고 새 게시물을 만들어요.</li><li>첨부에서 저장한 PNG 그림을 선택하고 소개 글을 함께 올려요.</li></ol><p>이렇게 직접 첨부할 때는 API가 필요하지 않아요. 자동 게시를 개발하려면 패들렛 API를 사용할 수 있는 요금제와 보드 관리 권한 등이 필요해요. 이 사이트는 자동 게시 대신 파일 저장과 직접 첨부를 지원해요.</p><a href="https://docs.padlet.dev/reference/introduction" target="_blank" rel="noopener">패들렛 API 공식 안내 ↗</a>`,
  );
}
