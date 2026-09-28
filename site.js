/* usepren.com: the road scene in the closing band, drawn in ASCII.
   The truck is hand-drawn and holds still; the hills, the power line and the road are separate layers that glide
   past at their own depths on GPU transforms, so nothing jumps a character at a time. The wheels turn, the cab rides
   the bumps and the stack puffs. The scene pauses off screen and stands still for anyone who asks for reduced motion. */
(function () {
  "use strict";
  var host = document.querySelector("[data-road]");
  if (!host) return;
  var reduce = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  var TOP = [
    "                                                       __               ",
    "                                                       ||______         "
  ];
  var BODY = [
    " ____________________________________________________  ||  |   \\        ",
    "|                                                    |  |  |    \\       ",
    "|                                                    |  |  |_____\\_____ ",
    "|                    p r e n .                       |  |            [_|",
    "|                                                    |  |              |",
    "|___.-.__.-._________________________________.-.__.-.|==|_________.-.__|"
  ];
  var WHEELS = [
    "   ( @ )( @ )                               ( @ )( @ )           ( @ )  ",
    "    '-'  '-'                                 '-'  '-'             '-'   "
  ];
  var SUB = ["_", "-", "¯"];          // low, middle, high in one character cell

  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;"); }
  // A smooth line across `rows` rows: height h(i) in rows, drawn with low, middle and high strokes.
  function profile(n, rows, h) {
    var grid = [];
    for (var r = 0; r < rows; r++) grid.push(new Array(n + 1).join(" ").split(""));
    for (var i = 0; i < n; i++) {
      var y = Math.max(0, Math.min(rows - 0.001, h(i)));       // 0 = bottom row's floor
      var row = rows - 1 - Math.floor(y), sub = Math.floor((y % 1) * 3);
      grid[row][i] = SUB[sub];
    }
    return grid.map(function (r) { return r.join(""); });
  }
  function twice(lines) { return lines.map(function (l) { return l + l; }).join("\n"); }

  // far hills: a long ridge that repeats seamlessly
  var HN = 480;
  var hills = profile(HN, 3, function (i) {
    var a = (i / HN) * Math.PI * 2;
    return 1.3 + 0.8 * Math.sin(a * 3) + 0.5 * Math.sin(a * 7 + 1) + 0.25 * Math.sin(a * 17);
  });
  // the power line: a pole every 48 columns, the line sagging between them
  var PN = 48, PR = 6, poleRows = [];
  var wire = profile(PN, PR, function (i) { var u = i / PN; return PR - 1.2 - 10 * u * (1 - u); });
  for (var r = 0; r < PR; r++) {
    var line = wire[r].split("");
    line[0] = r === 0 ? "+" : "|";
    if (r === 0) { line[PN - 1] = "-"; line[1] = "-"; }
    poleRows.push(line.join(""));
  }
  var poleLine = poleRows.map(function (l) { return new Array(16).join(l); });
  // the road: the far edge, the lane marks, gravel on the near edge
  var RN = 60, dash = "", grav = "";
  for (var i = 0; i < RN; i++) { dash += i % 10 < 5 ? "=" : " "; grav += i % 6 === 0 ? "." : i % 17 === 0 ? "'" : " "; }
  var road = {
    edge: new Array(RN * 12 + 1).join("_"),
    dash: new Array(13).join(dash),
    grav: new Array(13).join(grav)
  };

  host.innerHTML =
    '<pre class="rl rl-hills">' + esc(twice(hills)) + "</pre>" +
    '<pre class="rl rl-poles">' + esc(twice(poleLine)) + "</pre>" +
    '<pre class="rl rl-edge">' + esc(road.edge + road.edge) + "</pre>" +
    '<div class="rl-truck"><pre class="rl-top">' + esc(TOP.join("\n")) + "</pre>" +
    '<pre class="rl-body">' + esc(BODY.join("\n")) + "</pre>" +
    '<pre class="rl-wheels">' + esc(WHEELS.join("\n")).replace(/@/g, '<b class="hub">|</b>') + "</pre>" +
    '<i class="puff p1">o</i><i class="puff p2">o</i><i class="puff p3">.</i></div>' +
    '<pre class="rl rl-dash">' + esc(road.dash + road.dash) + "</pre>" +
    '<pre class="rl rl-grav">' + esc(road.grav + road.grav) + "</pre>";
  host.classList.add("on");
  if (reduce) return;

  // wheels turn with the road; everything else is CSS
  var hubs = host.querySelectorAll(".hub"), spin = "|/-\\", k = 0, timer = null;
  function turn() { k = (k + 1) & 3; for (var j = 0; j < hubs.length; j++) hubs[j].textContent = spin.charAt(k); }
  function play(on) {
    host.classList.toggle("paused", !on);
    if (on && !timer) timer = setInterval(turn, 70);
    if (!on && timer) { clearInterval(timer); timer = null; }
  }
  if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { play(e[0].isIntersecting && !document.hidden); }).observe(host);
  else play(true);
  document.addEventListener("visibilitychange", function () { play(!document.hidden); });
})();
