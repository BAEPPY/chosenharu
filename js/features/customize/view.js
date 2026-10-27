"use strict";

function thumbChoice(items, key) {
  return `<div class="choice-grid picture-options">${items
    .map((x) => {
      let art = "";
      if (key === "pose") {
        art = D.lessonPoses.some((p) => p.alias === x.alias)
          ? `<img src="${A["assets/images/options/poses/" + x.alias + "@2x.png"]}" alt="">`
          : avatarSvg({ ...state, pose: x.alias });
      } else if (
        key === "hair" &&
        L.headgear.some((h) => h.alias === x.alias)
      ) {
        const n = nativeLook(state),
          p = window.ART_LAYOUT[n.pose];
        art = avatarSvg({ ...state, hair: x.alias }).replace(
          'viewBox="0 0 360 360"',
          `viewBox="${p.x - 60} ${p.y - 65} 120 145"`,
        );
      } else if (key === "hair")
        art = `<img src="${A["assets/images/options/hairs/" + x.alias + "_overlay@2x.png"]}" alt="">`;
      else if (key === "emotion")
        art = `<svg viewBox="0 0 100 100"><ellipse cx="50" cy="52" rx="29" ry="34" fill="${D.skintones[state.skin].rgba}"/><image href="${A["assets/images/options/emotions/" + x.alias + "_overlay@2x.png"]}" width="100" height="100"/></svg>`;
      else
        art = `<img src="${A["assets/images/options/clothes/" + x.alias + "_overlay@2x.png"]}" alt="">`;
      return `<button class="choice ${state[key] === x.alias ? "selected" : ""}" data-choice="${key}" data-value="${x.alias}" aria-pressed="${state[key] === x.alias}">${art}<span>${esc(x.label || x.name)}</span></button>`;
    })
    .join("")}</div>`;
}

function lookHtml() {
  let h =
    heading(
      3,
      "옷차림에 삶을 담아 볼까요?",
      "옷·모자·표정을 직접 골라 나만의 인물을 만들어 보세요.",
    ) +
    `<div class="style-tabs" role="group" aria-label="꾸미기 종류">${[
      ["outfit", "의상"],
      ["hair", "머리·모자"],
      ["emotion", "표정·피부"],
    ]
      .map(
        ([v, t]) =>
          `<button data-style="${v}" class="${styleTab === v ? "active" : ""}" aria-pressed="${styleTab === v}">${t}</button>`,
      )
      .join("")}</div>`;
  if (styleTab === "outfit") {
    const recommendations = recommendedOutfits(state);
    h += `<p class="outfit-guide">${recommendationBadge()} ${esc(roleOf(state)?.name || "선택한 역할")} · ${state.gender === "female" ? "여성" : "남성"} 인물에게 어울리는 옷이에요. 다른 옷도 자유롭게 골라요.</p><div class="choice-grid outfit-grid">${outfitsFor(
      state,
    )
      .map(
        (o) =>
          `<button data-choice="outfit" data-value="${o.id}" class="choice ${state.outfit === o.id ? "selected" : ""}" aria-pressed="${state.outfit === o.id}"><span class="outfit-badge-slot">${recommendations.includes(o.id) ? recommendationBadge() : ""}</span>${avatarSvg(outfitState(state, o.id))}<span>${o.name}</span></button>`,
      )
      .join("")}</div>`;
    if (state.outfit === "daily")
      h += `<details><summary>생활 한복 모양 더 고르기</summary>${thumbChoice(
        D.clothes.filter((c) =>
          ["baji", "chima", "dopo_baeja", "chima_baeja"].includes(c.alias),
        ),
        "cloth",
      )}</details>`;
    h += ["hwangchosam", "nainbok"].includes(nativeLook(state).cloth)
      ? '<p class="small-note">이 옷은 그림에 정해진 색으로 표현해요.</p>'
      : `${traditionalPaletteHtml()}<div class="color-controls">${[
          ["top", "웃옷"],
          ["bottom", "바지·치마"],
          ["layer", "장식"],
        ]
          .map(
            ([k, t]) =>
              `<label>${t}<input type="color" data-field="${k}" value="${state[k]}"></label>`,
          )
          .join(
            "",
          )}</div><p class="small-note">옷을 고르면 기본 배색이 적용돼요. 색은 다시 바꿀 수 있어요.</p>`;
  }
  if (styleTab === "hair")
    h +=
      thumbChoice(hairsFor(state), "hair") +
      '<p class="small-note">옷과 모자는 따로 골라요. 왕실 전용 의복과 관모는 신분과 역할에 맞는 인물만 고를 수 있어요.</p>';
  if (styleTab === "emotion") {
    h +=
      `<div class="skin-choices"><span>피부 색</span>${D.skintones.map((s, i) => `<button class="swatch ${i === state.skin ? "selected" : ""}" data-choice="skin" data-value="${i}" style="--swatch:${s.rgba}" aria-label="피부 색 ${i + 1}" aria-pressed="${i === state.skin}"></button>`).join("")}</div>` +
      thumbChoice(D.emotions, "emotion");
  }
  return (
    h +
    `<div class="look-tools"><button class="text-button" data-action="changePose">동작 바꾸기</button><button class="text-button" data-action="undo" ${undo.length ? "" : "disabled"}>↶ 꾸미기 되돌리기</button></div>`
  );
}

function recommendationBadge() {
  return '<span class="recommendation-badge">추천</span>';
}
