"use strict";

function courtHeadShape(alias) {
  if (alias === "tanggeon")
    return '<g stroke="#242521" stroke-width="2" fill="#494A43"><path d="M-27 3L-28-14Q-25-22-16-25L-15-40Q2-49 19-37L24-18L28 3Z"/><path d="M-26-12Q0-20 24-12M-14-35Q0-40 15-34" fill="none" stroke="#727267" stroke-width="1.2"/></g>';
  if (alias !== "myeonryugwan") return "";
  const colors = ["#D7BB69", "#649889", "#F6E7CB", "#B9615C", "#364A69"];
  return `<g stroke="#242521" stroke-width="2" stroke-linejoin="round"><path d="M-25 4L-25-31Q0-40 25-31L25 4Z" fill="#272C32"/><path d="M-25-7H25M-19-31V-10M18-31V-10" stroke="#D7BB69" stroke-width="1.4"/><path d="M-39-38L17-46L39-35L-17-27Z" fill="#AF3942"/><path d="M-39-38L-17-27L39-35" fill="none" stroke="#D7BB69" stroke-width="2"/>${Array.from(
    { length: 9 },
    (_, i) => {
      const x = -36 + i * 7.5,
        y = -37 + i * 0.33;
      return `<g><path d="M${x} ${y}v33" stroke="#C9BA91" stroke-width=".65"/>${Array.from({ length: 7 }, (_, j) => `<circle cx="${x}" cy="${y + 5 + j * 4.3}" r="1.5" fill="${colors[j % 5]}" stroke="none"/>`).join("")}</g>`;
    },
  ).join("")}</g>`;
}
