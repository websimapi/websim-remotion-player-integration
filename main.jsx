import { jsxDEV } from "react/jsx-dev-runtime";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { Player } from "@websim/remotion/player";
import { BingoCardClip } from "./composition.jsx";
const exampleCard = [
  ["1", "18", "31", "48", "63"],
  ["2", "16", "30", "52", "66"],
  ["5", "20", "FREE", "57", "72"],
  ["12", "21", "39", "51", "68"],
  ["7", "24", "34", "46", "70"]
];
function HeaderSmall() {
  const letters = ["B", "I", "N", "G", "O"];
  return (
    // Render the letters in a matching grid so they align with the 5x5 numbers
    /* @__PURE__ */ jsxDEV("div", { style: { display: "grid", gridTemplateColumns: "repeat(5, 92px)", gap: 8, justifyContent: "center", marginBottom: 12 }, children: letters.map((L) => /* @__PURE__ */ jsxDEV(
      "div",
      {
        style: {
          width: 92,
          height: 92,
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
          boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
          border: `4px solid #2b2b2b`,
          // header thicker outline to match composition
          fontSize: 48,
          fontWeight: 900,
          // bolder letters
          color: "#1b1b1b",
          fontFamily: "Arial, Helvetica, sans-serif"
        },
        children: L
      },
      L,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 22,
        columnNumber: 9
      },
      this
    )) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 20,
      columnNumber: 5
    }, this)
  );
}
function BingoCage({ size = 300, ballCount = 14 }) {
  const [balls, setBalls] = useState(() => {
    const arr = [];
    for (let i = 0; i < ballCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() * 0.6 + 0.2) * Math.PI;
      const rRel = 0.32 + Math.random() * 0.08;
      const x = Math.sin(phi) * Math.cos(theta) * rRel;
      const y = Math.sin(phi) * Math.sin(theta) * rRel;
      const z = Math.cos(phi) * rRel;
      arr.push({
        id: i + 1,
        x,
        y,
        z,
        // 3D local coords centered at 0
        vx: (Math.random() - 0.5) * 3e-3,
        vy: (Math.random() - 0.5) * 3e-3,
        vz: (Math.random() - 0.5) * 3e-3,
        color: ["#ff6b6b", "#ffd54f", "#6bcBFF", "#8de48d", "#f6a6ff"][i % 5],
        radius: 0.05 + Math.random() * 0.015,
        inside: true,
        dropping: false,
        dropT: 0
      });
    }
    return arr;
  });
  const rafRef = useRef(null);
  const lastRef = useRef(performance.now());
  const spinningRef = useRef(false);
  const spinVelRef = useRef(0);
  const spinAxisRef = useRef([0, 0, 1]);
  const spinStartRef = useRef(0);
  const [spinning, setSpinning] = useState(false);
  const queuedDropRef = useRef(false);
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);
  const norm = (v) => {
    const s = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]) || 1;
    return [v[0] / s, v[1] / s, v[2] / s];
  };
  const rotateVec = (v, axis, ang) => {
    const [ux, uy, uz] = axis;
    const [x, y, z] = v;
    const cos = Math.cos(ang), sin = Math.sin(ang);
    const dot = ux * x + uy * y + uz * z;
    return [
      ux * dot * (1 - cos) + x * cos + (-uz * y + uy * z) * sin,
      uy * dot * (1 - cos) + y * cos + (uz * x - ux * z) * sin,
      uz * dot * (1 - cos) + z * cos + (-uy * x + ux * y) * sin
    ];
  };
  const step = (ts) => {
    const dt = Math.min(32, ts - lastRef.current);
    lastRef.current = ts;
    if (spinningRef.current) {
      const elapsed = ts - spinStartRef.current;
      const spinDuration = 1400;
      const t = Math.min(1, elapsed / spinDuration);
      spinVelRef.current = (1 - t) * 0.015 + 2e-3 * Math.random();
      if (t >= 1 && !queuedDropRef.current) {
        queuedDropRef.current = true;
      }
    } else {
      spinVelRef.current = Math.max(0, spinVelRef.current - 6e-4 * (dt / 16));
    }
    setBalls((prev) => {
      const next = prev.map((b) => ({ ...b }));
      const ang = spinVelRef.current * dt;
      const axis = spinAxisRef.current;
      for (let i = 0; i < next.length; i++) {
        const p = next[i];
        if (!p.inside) continue;
        if (p.dropping) {
          p.dropT += dt;
          if (p.dropT > 800) {
            p.inside = false;
            p.dropping = false;
          }
          continue;
        }
        const rotated = rotateVec([p.x, p.y, p.z], axis, ang * 0.9);
        p.x = rotated[0];
        p.y = rotated[1];
        p.z = rotated[2];
        const lateral = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
        const push = spinVelRef.current * 9e-4 * lateral * (dt / 16);
        const rx = p.x, ry = p.y, rz = p.z;
        const rlen = Math.sqrt(rx * rx + ry * ry + rz * rz) || 1;
        p.vx += rx / rlen * push;
        p.vy += ry / rlen * push;
        p.vz += rz / rlen * push;
        p.vx += (Math.random() - 0.5) * 2e-4;
        p.vy += (Math.random() - 0.5) * 2e-4;
        p.vz += (Math.random() - 0.5) * 18e-5;
        p.vx *= 0.996;
        p.vy *= 0.996;
        p.vz *= 0.996;
        p.x += p.vx * (dt / 16);
        p.y += p.vy * (dt / 16);
        p.z += p.vz * (dt / 16);
        const R = 0.48 - p.radius * 0.6;
        const dist = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
        if (dist > R) {
          const nx = p.x / dist, ny = p.y / dist, nz = p.z / dist;
          const vn = p.vx * nx + p.vy * ny + p.vz * nz;
          p.vx -= 1.9 * vn * nx;
          p.vy -= 1.9 * vn * ny;
          p.vz -= 1.9 * vn * nz;
          p.x = nx * R;
          p.y = ny * R;
          p.z = nz * R;
        }
      }
      for (let i = 0; i < next.length; i++) {
        for (let j = i + 1; j < next.length; j++) {
          const a = next[i], b = next[j];
          if (!a.inside || !b.inside || a.dropping || b.dropping) continue;
          const dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1e-6;
          const minDist = (a.radius + b.radius) * 0.9;
          if (dist < minDist) {
            const overlap = (minDist - dist) / 2;
            const nx = dx / dist, ny = dy / dist, nz = dz / dist;
            a.x -= nx * overlap;
            a.y -= ny * overlap;
            a.z -= nz * overlap;
            b.x += nx * overlap;
            b.y += ny * overlap;
            b.z += nz * overlap;
            const avx = a.vx, avy = a.vy, avz = a.vz;
            a.vx = a.vx * 0.75 + b.vx * 0.25;
            a.vy = a.vy * 0.75 + b.vy * 0.25;
            a.vz = a.vz * 0.75 + b.vz * 0.25;
            b.vx = b.vx * 0.75 + avx * 0.25;
            b.vy = b.vy * 0.75 + avy * 0.25;
            b.vz = b.vz * 0.75 + avz * 0.25;
          }
        }
      }
      for (let p of next) {
        if (!p.inside || p.dropping) continue;
        const d = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z) || 1;
        const maxR = 0.49 - p.radius * 0.6;
        if (d > maxR) {
          const s = maxR / d;
          p.x *= s;
          p.y *= s;
          p.z *= s;
        }
      }
      return next;
    });
    if (queuedDropRef.current && !spinningRef.current && spinVelRef.current < 45e-4) {
      const chute = [0.55, -0.15, -0.22];
      setBalls((prev) => {
        const candidates = prev.filter((b) => b.inside && !b.dropping);
        if (candidates.length === 0) return prev;
        candidates.sort((A, B) => {
          const da = (A.x - chute[0]) ** 2 + (A.y - chute[1]) ** 2 + (A.z - chute[2]) ** 2;
          const db = (B.x - chute[0]) ** 2 + (B.y - chute[1]) ** 2 + (B.z - chute[2]) ** 2;
          return da - db;
        });
        const chosenId = candidates[0].id;
        return prev.map((p) => p.id === chosenId ? { ...p, dropping: true, dropT: 0, vx: 0, vy: 0, vz: 0 } : p);
      });
      queuedDropRef.current = false;
    }
    rafRef.current = requestAnimationFrame(step);
  };
  const handleSpin = () => {
    if (spinningRef.current) return;
    spinningRef.current = true;
    setSpinning(true);
    spinStartRef.current = performance.now();
    lastRef.current = performance.now();
    const ax = (Math.random() - 0.5) * 0.4;
    const ay = (Math.random() - 0.5) * 0.4;
    const az = 1 - (Math.abs(ax) + Math.abs(ay)) * 0.5;
    spinAxisRef.current = norm([ax, ay, az]);
    rafRef.current = requestAnimationFrame(step);
    setTimeout(() => {
      spinningRef.current = false;
      setSpinning(false);
    }, 1400);
  };
  const project = (p, S2) => {
    const camZ = 1.6;
    const f = 1.2;
    const sx = p.x / (camZ - p.z) * f;
    const sy = p.y / (camZ - p.z) * f;
    const cx2 = S2 / 2, cy2 = S2 / 2;
    const scale = S2 * 0.55;
    return [cx2 + sx * scale, cy2 - sy * scale, camZ - p.z];
  };
  const S = size;
  const cx = S / 2, cy = S / 2;
  const r = S * 0.45;
  const projected = balls.map((b) => {
    if (!b.inside) return { b, px: 0, py: 0, depth: Infinity };
    const [px, py, depth] = project({ x: b.x, y: b.y, z: b.z }, S);
    const br = Math.max(8, Math.round(S * b.radius * 1.1 * (1 / Math.max(0.35, depth))));
    return { b, px, py, depth, br };
  }).filter((x) => x.b.inside).sort((a, b) => a.depth - b.depth);
  return /* @__PURE__ */ jsxDEV("div", { style: { width: S, height: S, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }, children: /* @__PURE__ */ jsxDEV("div", { onClick: handleSpin, title: "Tap to spin", style: { width: S, height: S, position: "relative", cursor: "pointer", userSelect: "none" }, children: [
    /* @__PURE__ */ jsxDEV("svg", { width: S, height: S, viewBox: `0 0 ${S} ${S}`, style: { display: "block" }, children: [
      /* @__PURE__ */ jsxDEV("defs", { children: /* @__PURE__ */ jsxDEV("radialGradient", { id: "cageGlow3", cx: "50%", cy: "45%", children: [
        /* @__PURE__ */ jsxDEV("stop", { offset: "0%", stopColor: "rgba(255,255,255,0.6)" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 308,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("stop", { offset: "100%", stopColor: "rgba(255,255,255,0)" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 309,
          columnNumber: 15
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 307,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 306,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("ellipse", { cx, cy: cy + r * 0.9, rx: r * 0.65, ry: r * 0.18, fill: "rgba(0,0,0,0.08)" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 314,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("rect", { x: cx - 6, y: cy + r * 0.85, width: 12, height: S * 0.18, rx: 6, fill: "#444" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 317,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("rect", { x: cx - S * 0.22, y: cy + r * 0.95, width: S * 0.44, height: S * 0.04, rx: 6, fill: "#333" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 318,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("g", { transform: `translate(${cx},${cy})`, children: [
        /* @__PURE__ */ jsxDEV("circle", { cx: 0, cy: 0, r, fill: "#fafafa", stroke: "none" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 322,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("circle", { cx: 0, cy: 0, r: r - 2, fill: "url(#cageGlow3)", opacity: "0.55" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 323,
          columnNumber: 13
        }, this),
        [-0.65, -0.4, -0.15, 0, 0.15, 0.4, 0.65].map((t, i) => /* @__PURE__ */ jsxDEV("ellipse", { cx: 0, cy: 0, rx: r, ry: r * (1 - Math.abs(t) * 0.6), fill: "none", stroke: "#666", strokeWidth: 1.6, opacity: 0.6 }, i, false, {
          fileName: "<stdin>",
          lineNumber: 325,
          columnNumber: 15
        }, this)),
        Array.from({ length: 12 }).map((_, i) => {
          const ang = i / 12 * Math.PI * 2;
          const x = Math.cos(ang) * r * 0.98;
          const y = Math.sin(ang) * r * 0.98;
          return /* @__PURE__ */ jsxDEV("line", { x1: 0 - r, y1: 0, x2: x, y2: y, stroke: "#666", strokeWidth: 1, opacity: 0.5 }, i, false, {
            fileName: "<stdin>",
            lineNumber: 331,
            columnNumber: 22
          }, this);
        }),
        /* @__PURE__ */ jsxDEV("path", { d: `M ${r * 0.52} ${r * 0.14} l ${S * 0.06} ${S * 0.06} l -${S * 0.2} ${S * 0.06} l -${S * 0.02} -${S * 0.08} z`, fill: "#f5f5f5", stroke: "#bdbdbd", strokeWidth: "1", transform: `translate(${0},${0})` }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 334,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 321,
        columnNumber: 11
      }, this),
      projected.map(({ b, px, py, depth, br }) => {
        const shade = Math.max(0.6, Math.min(1, 1 - (depth - 0.8) * 0.45));
        const fill = b.color;
        const stroke = `rgba(0,0,0,${0.08 + (1 - shade) * 0.25})`;
        return /* @__PURE__ */ jsxDEV("g", { children: [
          /* @__PURE__ */ jsxDEV("circle", { cx: px, cy: py, r: br, fill, stroke, strokeWidth: 2 }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 345,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("text", { x: px, y: py + br * 0.35, textAnchor: "middle", fontSize: br * 0.8, fontWeight: "700", fill: "#2b2b2b", style: { fontFamily: "Arial, Helvetica, sans-serif", pointerEvents: "none" }, children: (b.id - 1) % 75 + 1 }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 346,
            columnNumber: 17
          }, this)
        ] }, b.id, true, {
          fileName: "<stdin>",
          lineNumber: 344,
          columnNumber: 15
        }, this);
      })
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 305,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV("div", { style: { position: "absolute", right: -S * 0.16, top: cy - 12, width: S * 0.14, height: 24, background: "#555", borderRadius: 6, transform: `rotate(${spinning ? 30 : 0}deg)`, transition: "transform 300ms" } }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 355,
      columnNumber: 9
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 304,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 303,
    columnNumber: 5
  }, this);
}
function InteractiveApp() {
  const [actions, setActions] = useState([]);
  const [playerKey, setPlayerKey] = useState(0);
  const [isReplayMode, setIsReplayMode] = useState(false);
  const handleCellTap = (r, c) => {
    const t = Date.now();
    const next = [...actions, { r, c, t }];
    setActions(next);
  };
  const clearActions = () => {
    setActions([]);
    setIsReplayMode(false);
    setPlayerKey((k) => k + 1);
  };
  const matchForPlayer = useMemo(() => {
    if (!isReplayMode) return { card: exampleCard, highlights: [], durationInFrames: 150 };
    if (actions.length === 0) return { card: exampleCard, highlights: [], durationInFrames: 150 };
    const sorted = [...actions].sort((a, b) => a.t - b.t);
    const t0 = sorted[0].t;
    const actionsWithFrame = sorted.map((a, idx) => {
      const msOffset = a.t - t0;
      const frameFromTime = Math.round(msOffset / 1e3 * 30);
      const frame = Math.max(0, frameFromTime + idx * 6);
      return { r: a.r + 1, c: a.c, frame };
    });
    const maxFrame = actionsWithFrame.reduce((m, a) => Math.max(m, a.frame), 0);
    const durationInFrames = Math.max(150, maxFrame + 30);
    const lettersRow = ["B", "I", "N", "G", "O"];
    const cardWithHeader = [lettersRow, ...exampleCard];
    return { card: cardWithHeader, replayActions: actionsWithFrame, durationInFrames };
  }, [isReplayMode, actions]);
  return /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", height: "100%", gap: 12, alignItems: "center", padding: 12, boxSizing: "border-box", justifyContent: "center" }, children: [
    /* @__PURE__ */ jsxDEV("div", { style: { width: 360, boxSizing: "border-box", background: "#fff", borderRadius: 12, padding: 12 }, children: /* @__PURE__ */ jsxDEV("div", { style: {
      width: "100%",
      height: 640,
      marginTop: 8,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#fafafa",
      borderRadius: 12,
      boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
      overflow: "hidden"
    }, children: /* @__PURE__ */ jsxDEV("div", { style: {
      width: 620,
      padding: 28,
      borderRadius: 20,
      background: "#fff",
      /* scale preview down so it matches composition render size inside the 360px panel */
      transform: "scale(0.55)",
      transformOrigin: "center center",
      // changed from "top center" to center the scaled board
      /* ensure the scaled content stays centered in its container */
      /* removed marginLeft/marginRight:auto to let flex centering handle alignment */
      boxSizing: "content-box"
    }, children: [
      /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", justifyContent: "center", marginBottom: 6 }, children: /* @__PURE__ */ jsxDEV(BingoCage, { size: 220, ballCount: 14 }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 434,
        columnNumber: 15
      }, this) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 433,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV(HeaderSmall, {}, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 438,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV("div", { style: { display: "grid", gridTemplateColumns: "repeat(5, 92px)", gap: 8, justifyContent: "center", marginTop: 6 }, children: exampleCard.map(
        (row, rIdx) => row.map((cell, cIdx) => {
          const isFree = typeof cell === "string" && cell.toLowerCase().includes("free");
          const tapped = actions.some((a) => a.r === rIdx && a.c === cIdx);
          return /* @__PURE__ */ jsxDEV(
            "button",
            {
              onClick: () => handleCellTap(rIdx, cIdx),
              style: {
                width: 92,
                height: 92,
                borderRadius: 12,
                border: "3px solid #2b2b2b",
                // match composition thicker outline for cells
                background: isFree ? "#efefef" : "#fff",
                fontWeight: 700,
                fontSize: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                overflow: "hidden",
                cursor: "pointer",
                color: "#111",
                fontFamily: "Arial, Helvetica, sans-serif"
              },
              children: [
                tapped && /* @__PURE__ */ jsxDEV("div", { style: {
                  position: "absolute",
                  width: 74,
                  height: 74,
                  borderRadius: 999,
                  background: "#ff6b6b",
                  opacity: 0.95,
                  zIndex: 0
                } }, void 0, false, {
                  fileName: "<stdin>",
                  lineNumber: 468,
                  columnNumber: 25
                }, this),
                /* @__PURE__ */ jsxDEV("div", { style: { zIndex: 1, fontSize: 20 }, children: isFree ? "FREE" : cell }, void 0, false, {
                  fileName: "<stdin>",
                  lineNumber: 478,
                  columnNumber: 23
                }, this)
              ]
            },
            `${rIdx}-${cIdx}`,
            true,
            {
              fileName: "<stdin>",
              lineNumber: 446,
              columnNumber: 21
            },
            this
          );
        })
      ) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 439,
        columnNumber: 13
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 420,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 408,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 406,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { style: { width: 360, height: 640, display: "flex", alignItems: "center", justifyContent: "center" }, children: /* @__PURE__ */ jsxDEV("div", { style: { width: "100%", height: "100%", boxSizing: "border-box", borderRadius: 12, overflow: "hidden", boxShadow: "0 12px 36px rgba(0,0,0,0.12)" }, children: /* @__PURE__ */ jsxDEV(
      Player,
      {
        component: BingoCardClip,
        durationInFrames: matchForPlayer.durationInFrames || 150,
        fps: 30,
        compositionWidth: 1080,
        compositionHeight: 1920,
        loop: true,
        controls: true,
        inputProps: { match: matchForPlayer },
        autoplay: true,
        style: { width: "100%", height: "100%" }
      },
      playerKey + (isReplayMode ? "-replay" : ""),
      false,
      {
        fileName: "<stdin>",
        lineNumber: 493,
        columnNumber: 11
      },
      this
    ) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 492,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 491,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ jsxDEV("div", { style: { width: 360, boxSizing: "border-box", padding: 12, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }, children: [
      /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", gap: 8 }, children: [
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: () => {
              setIsReplayMode(true);
              setPlayerKey((k) => k + 1);
            },
            style: { padding: "8px 12px", borderRadius: 8, background: "#1b9fff", color: "#fff", border: "none", fontSize: 14 },
            children: "Render Replay"
          },
          void 0,
          false,
          {
            fileName: "<stdin>",
            lineNumber: 512,
            columnNumber: 11
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: clearActions,
            style: { padding: "8px 12px", borderRadius: 8, background: "#eee", border: "none", fontSize: 14 },
            children: "Clear"
          },
          void 0,
          false,
          {
            fileName: "<stdin>",
            lineNumber: 518,
            columnNumber: 11
          },
          this
        )
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 511,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { style: { width: "100%", fontSize: 12 }, children: [
        /* @__PURE__ */ jsxDEV("div", { style: { fontWeight: 700, marginBottom: 6 }, children: "Recorded actions JSON" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 527,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("pre", { style: { whiteSpace: "pre-wrap", wordBreak: "break-word", background: "#f7f7f7", padding: 8, borderRadius: 6, maxHeight: 420, overflow: "auto" }, children: JSON.stringify(actions, null, 2) }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 528,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 526,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 510,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 404,
    columnNumber: 5
  }, this);
}
createRoot(document.getElementById("app")).render(/* @__PURE__ */ jsxDEV(InteractiveApp, {}, void 0, false, {
  fileName: "<stdin>",
  lineNumber: 537,
  columnNumber: 51
}));
