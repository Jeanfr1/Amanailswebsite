// Prints the section contours as objectBoundingBox clip paths.
// Desktop curves are the boundaries measured on the approved board (board px),
// each mapped into its section box; phone curves keep the same character with
// a fixed share of the section height. Paste the output into index.html <defs>.
const smooth = (pts) => {
  // Catmull-Rom through the points, written as cubic Béziers (tension 1/6)
  const f = (n) => +n.toFixed(4);
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
};
const box = (pts, top, h) => pts.map(([x, y]) => [x / 760, (y - top) / h]);

export const desktop = {
  detail: box([[0, 476], [120, 465], [200, 437], [280, 419], [360, 411], [440, 428], [520, 446], [600, 450], [680, 449], [760, 432]], 405, 505),
  work: box([[0, 860], [120, 853], [200, 849], [320, 866], [400, 881], [480, 895], [600, 908], [680, 909], [760, 906]], 845, 500),
  services: box([[0, 1311], [200, 1311], [280, 1312], [360, 1318], [440, 1335], [520, 1339], [600, 1332], [680, 1321], [760, 1312]], 1300, 370),
  studio: box([[0, 1636], [80, 1624], [160, 1615], [240, 1620], [320, 1632], [440, 1647], [520, 1657], [600, 1663], [680, 1659], [760, 1645]], 1610, 570),
};
export const phone = {
  detail: [[0, .07], [.25, .035], [.5, .012], [.72, .04], [1, .03]],
  work: [[0, .03], [.3, .012], [.62, .04], [1, .062]],
  services: [[0, .045], [.35, .015], [.62, .05], [1, .02]],
  studio: [[0, .055], [.22, .022], [.6, .06], [1, .035]],
};

for (const [set, suffix] of [[desktop, ''], [phone, '-m']]) {
  for (const [name, pts] of Object.entries(set)) {
    console.log(`    <clipPath id="clip-${name}${suffix}" clipPathUnits="objectBoundingBox"><path d="${smooth(pts)}V1H0Z"/></clipPath>`);
  }
}
