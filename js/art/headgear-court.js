"use strict";

function courtHeadShape(alias) {
  if (alias === "tanggeon")
    return '<g stroke="#242521" stroke-width="2" fill="#494A43"><path d="M-27 3L-28-14Q-25-22-16-25L-15-40Q2-49 19-37L24-18L28 3Z"/><path d="M-26-12Q0-20 24-12M-14-35Q0-40 15-34" fill="none" stroke="#727267" stroke-width="1.2"/></g>';
  if (alias !== "myeonryugwan") return "";
  // The generated reference is simplified to the native character's flat ink.
  // Each of the nine front strings begins ON the same edge of the board;
  // nine beads are positioned along that continuous string.
  const colors = ["#E9D6A2", "#6C9984", "#B8564E", "#E9D6A2", "#374B59"];
  const strings = (back) =>
    Array.from({ length: 9 }, (_, i) => {
      const x = -35 + i * 8.75,
        y = back ? -37 : -25,
        length = back ? 34 : 38;
      return `<g data-ryu="${back ? "back" : "front"}"><path d="M${x} ${y}V${y + length}" fill="none" stroke="#C9AD71" stroke-width=".8"/>${Array.from({ length: 9 }, (_, j) => `<circle cx="${x}" cy="${y + 3 + j * 3.8}" r="1.25" fill="${colors[j % colors.length]}" stroke="none"/>`).join("")}</g>`;
    }).join("");
  return `<g stroke="#292A25" stroke-width="2" stroke-linejoin="round">
    ${strings(true)}
    <path d="M-26 5L-25-24Q0-32 25-24L26 5Q0 0-26 5Z" fill="#292E32"/>
    <path d="M-24-17Q0-23 24-17M-24-3Q0-8 24-3M-18-23V-7M18-23V-7" fill="none" stroke="#C5A568" stroke-width="1.2"/>
    <path d="M-44-30L-35-40H35L44-30L40-25H-40Z" fill="#A84345"/>
    <path d="M-44-30L-35-40H35L44-30Z" fill="#2A2D2E"/>
    <path d="M-42-29H42" fill="none" stroke="#D5B66C" stroke-width="1.4"/>
    ${strings(false)}
  </g>`;
}
