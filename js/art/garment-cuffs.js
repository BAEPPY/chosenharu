"use strict";

// Wrist locations are in native pose coordinates; long ceremonial cuffs hang
// from the wrist instead of being painted as bands across the whole torso.
const GARMENT_WRISTS = {
  reading_writing_01: [
    [125, 186, -25],
    [193, 206, -10],
  ],
  reading_writing_03: [
    [180, 213, -35],
    [219, 226, 15],
  ],
  crafting_02: [
    [111, 156, -20],
    [205, 231, 20],
  ],
  crafting_03: [
    [166, 214, -25],
    [218, 213, 15],
  ],
  crafting_04: [
    [150, 220, -20],
    [258, 235, 10],
  ],
  holding_fan_01: [
    [142, 145, -30],
    [170, 141, -10],
  ],
  holding_fan_02: [
    [101, 120, -10],
    [204, 177, -5],
  ],
  holding_fan_03: [
    [94, 139, -20],
    [216, 165, 8],
  ],
  playing_music_01: [
    [124, 191, -20],
    [161, 194, 15],
  ],
  playing_music_04: [
    [147, 224, -10],
    [244, 219, 10],
  ],
  playing_music_05: [
    [112, 237, -20],
    [215, 254, 10],
  ],
  sitting_01: [[215, 229, -10]],
  sitting_02: [[162, 279, 15]],
  sitting_04: [
    [111, 250, -20],
    [174, 230, 15],
  ],
  eating_drinking_01: [
    [154, 182, -20],
    [190, 215, 5],
  ],
  eating_drinking_04: [
    [180, 190, -20],
    [218, 188, 10],
  ],
  trudging_01: [
    [162, 241, -10],
    [206, 240, 10],
  ],
  trudging_03: [[154, 222, 10]],
  with_child_02: [[160, 164, -15]],
  with_child_04: [[189, 235, 10]],
  cheering_04: [
    [75, 106, -35],
    [258, 91, 35],
  ],
  dancing_01: [[174, 170, -15]],
  dancing_02: [[150, 169, -15]],
  dancing_03: [[231, 132, 35]],
  dancing_05: [
    [211, 147, 15],
    [226, 227, 10],
  ],
  posing_01: [
    [141, 148, -15],
    [227, 116, 25],
  ],
  posing_02: [
    [161, 150, -15],
    [192, 149, 15],
  ],
  posing_03: [
    [97, 151, -30],
    [250, 56, 30],
  ],
  working_out_01: [[199, 185, 15]],
  working_out_02: [[263, 173, 35]],
  working_out_03: [
    [122, 183, -25],
    [215, 167, 20],
  ],
};

function ceremonialCuffs(pose, kind, pattern) {
  if (!["hwarot", "wonsam"].includes(kind)) return "";
  const baseLength = kind === "hwarot" ? 63 : 45;
  return (GARMENT_WRISTS[pose] || [])
    .map(([x, y, a]) => {
      const length = Math.max(
        24,
        Math.min(
          baseLength,
          window.GARMENT_LAYOUT[pose].skirt.y +
            window.GARMENT_LAYOUT[pose].skirt.h -
            y,
        ),
      );
      return `<g transform="translate(${x} ${y}) rotate(${a})" stroke="#453D32" stroke-width="${GARMENT_INK.outline}" stroke-linejoin="round">
    <path d="M-8 0L12 0L16 ${length}Q2 ${length + 7}-12 ${length}Z" fill="#FFFAEB"/>
    <path d="M-8 0H12L12.5 7H-8.5Z" fill="#EED276"/>
    <path d="M-8.5 7H12.5L13 14H-9Z" fill="#315F9F"/>
    <path d="M-9 14H13L13.5 21H-9.5Z" fill="#B83850"/>
    ${kind === "hwarot" ? `<g transform="translate(0 ${length - 13}) scale(.6)">${floralMotif()}</g>` : ""}
    <path d="M-3 26L-4 ${length - 3}M8 25L11 ${length - 2}" fill="none" opacity=".3" stroke-width=".7"/>
  </g>`;
    })
    .join("");
}
