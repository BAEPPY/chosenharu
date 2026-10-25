function traditionalPaletteHtml() {
  return `<section class="traditional-palette" aria-label="전통 옷감 색 고르기"><h2>${icon("palette")} 우리 옷의 색</h2><p>백색·옥색·남색·연갈색 등 참고 자료의 옷감 색을 골라 보세요.</p>${[
    ["top", "웃옷"],
    ["bottom", "바지·치마"],
    ["layer", "장식"],
  ]
    .map(
      ([key, label]) =>
        `<div class="palette-row"><span>${label}</span><div class="palette-swatches" role="group" aria-label="${label} 전통색">${window.JOSEON_PALETTE.map((color) => `<button class="palette-swatch" style="--swatch:${color.hex}" data-palette="${key}" data-color="${color.hex}" aria-label="${label} ${color.name}" aria-pressed="${state[key].toUpperCase() === color.hex}" title="${color.name}"></button>`).join("")}</div></div>`,
    )
    .join("")}</section>`;
}
