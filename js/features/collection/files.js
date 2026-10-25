"use strict";

function download(blob, name) {
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

const fileName = (suffix, ext) =>
  "조선의하루_" +
  (state.name || "나의인물").replace(/[\\/:*?"<>|]/g, "_") +
  suffix +
  "." +
  ext;

function exportRecords(records, withBoard = false) {
  download(
    new Blob(
      [
        JSON.stringify(
          { format: "joseon-day-v2", records, board: withBoard ? board : [] },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    ),
    withBoard ? "조선의하루_우리반작품.json" : fileName("_작품", "json"),
  );
  toast(
    "작품 파일을 저장했어요. 다른 기기의 ‘작품 가져오기’에서 열 수 있어요.",
  );
}

async function importFiles(files) {
  try {
    let imported = [],
      positions = [];
    for (const f of files) {
      if (f.size > 2000000) throw Error("파일 하나는 2MB 이하여야 해요.");
      const data = JSON.parse(await f.text());
      if (
        !["joseon-day-v1", "joseon-day-v2"].includes(data.format) ||
        !Array.isArray(data.records) ||
        data.records.length > 100
      )
        throw Error("조선의 하루 작품 파일(JSON)을 골라 주세요.");
      for (const raw of data.records) {
        if (!raw || typeof raw !== "object")
          throw Error("작품 내용을 읽지 못했어요.");
        const s = normalize(raw);
        if (!s.status || !s.name.trim())
          throw Error("신분이나 이름이 없는 작품이 있어요.");
        s.id = s.id || uid();
        imported.push(s);
      }
      if (Array.isArray(data.board)) positions.push(...data.board);
    }
    const map = new Map(saved.map((s) => [s.id, s]));
    for (const s of imported) map.set(s.id, s);
    if (map.size > 100) throw Error("인물 모음은 100명까지 보관할 수 있어요.");
    const before = { saved, board };
    saved = [...map.values()];
    board = cleanBoard([...board, ...positions], saved);
    resolveBoard();
    if (!persist()) {
      saved = before.saved;
      board = before.board;
      return;
    }
    render();
    if ($("#modal").open) gallery();
    toast(imported.length + "명의 작품을 가져왔어요.");
  } catch (e) {
    toast("가져오기 실패: " + e.message);
  } finally {
    $("#importFile").value = "";
  }
}
