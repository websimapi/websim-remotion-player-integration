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
      const angle = Math.random() * Math.PI * 2;
      const radius = (Math.random() * 0.35 + 0.05) * 0.45;
      const x = 0.5 + Math.cos(angle) * radius;
      const y = 0.5 + Math.sin(angle) * radius;
      arr.push({
        id: i + 1,
        x,
        y,
        vx: (Math.random() - 0.5) * 25e-4,
        vy: (Math.random() - 0.5) * 25e-4,
        color: ["#ff6b6b", "#ffd54f", "#6bcBFF", "#8de48d", "#f6a6ff"][i % 5],
        radius: 0.06,
        // relative radius
        alive: true,
        // true = inside cage
        dropping: false,
        // dropping through chute
        dropY: 0
        // visual drop progress
      });
    }
    return arr;
  });
  const rafRef = useRef(null);
  const lastTsRef = useRef(performance.now());
  const spinningRef = useRef(false);
  const spinVelRef = useRef(0);
  const spinStartRef = useRef(0);
  const [spinning, setSpinning] = useState(false);
  const [queuedDrop, setQueuedDrop] = useState(null);
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);
  const clampInsidePoint = (x, y, r2 = 0.49) => {
    const cx2 = x - 0.5, cy2 = y - 0.5;
    const dist = Math.sqrt(cx2 * cx2 + cy2 * cy2);
    if (dist > r2) {
      const scale = r2 / dist;
      return [0.5 + cx2 * scale, 0.5 + cy2 * scale];
    }
    return [x, y];
  };
  const stepPhysics = (ts) => {
    const dt = Math.min(32, ts - lastTsRef.current);
    lastTsRef.current = ts;
    if (spinningRef.current) {
      const elapsed = ts - spinStartRef.current;
      const duration = 1400;
      const t = Math.min(1, elapsed / duration);
      spinVelRef.current = (1 - t) * 0.018 + 2e-3 * Math.random();
      if (t >= 1 && queuedDrop === null) {
        setQueuedDrop(true);
      }
    } else {
      spinVelRef.current = Math.max(0, spinVelRef.current - 6e-4 * (dt / 16));
    }
    setBalls((prev) => {
      const next = prev.map((b) => ({ ...b }));
      const S2 = 1;
      for (let i = 0; i < next.length; i++) {
        const b = next[i];
        if (!b.alive) continue;
        if (b.dropping) {
          b.dropY += dt * 28e-4;
          if (b.dropY > 1) {
            b.alive = false;
            b.dropping = false;
          }
          continue;
        }
        const cx2 = b.x - 0.5, cy2 = b.y - 0.5;
        const ang = Math.atan2(cy2, cx2);
        const push = spinVelRef.current * 8e-4;
        b.vx += Math.cos(ang) * push * (dt / 16);
        b.vy += Math.sin(ang) * push * (dt / 16);
        b.vx += (Math.random() - 0.5) * 2e-4;
        b.vy += (Math.random() - 0.5) * 15e-5;
        b.vx *= 0.995;
        b.vy *= 0.995;
        b.x += b.vx * (dt / 16);
        b.y += b.vy * (dt / 16);
        const R = 0.485 - b.radius * 0.45;
        const dx = b.x - 0.5, dy = b.y - 0.5;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > R) {
          const nx = dx / dist, ny = dy / dist;
          const vn = b.vx * nx + b.vy * ny;
          b.vx -= 1.9 * vn * nx;
          b.vy -= 1.9 * vn * ny;
          b.x = 0.5 + nx * R;
          b.y = 0.5 + ny * R;
        }
      }
      for (let i = 0; i < next.length; i++) {
        for (let j = i + 1; j < next.length; j++) {
          const a = next[i], b = next[j];
          if (!a.alive || !b.alive || a.dropping || b.dropping) continue;
          const dx = b.x - a.x, dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1e-6;
          const minDist = (a.radius + b.radius) * 0.9;
          if (dist < minDist) {
            const overlap = (minDist - dist) / 2;
            const nx = dx / dist, ny = dy / dist;
            a.x -= nx * overlap;
            a.y -= ny * overlap;
            b.x += nx * overlap;
            b.y += ny * overlap;
            const vx = a.vx, vy = a.vy;
            a.vx = a.vx * 0.7 + b.vx * 0.3;
            a.vy = a.vy * 0.7 + b.vy * 0.3;
            b.vx = b.vx * 0.7 + vx * 0.3;
            b.vy = b.vy * 0.7 + vy * 0.3;
          }
        }
      }
      for (let b of next) {
        if (!b.alive || b.dropping) continue;
        const [clx, cly] = clampInsidePoint(b.x, b.y, 0.485 - b.radius * 0.45);
        b.x = clx;
        b.y = cly;
      }
      return next;
    });
    if (queuedDrop && !spinningRef.current) {
      setBalls((prev) => {
        const candidates = prev.filter((b) => b.alive && !b.dropping).map((b) => ({ ...b }));
        if (candidates.length === 0) return prev;
        candidates.sort((a, b) => {
          const da = (a.x - 0.75) ** 2 + (a.y - 0.62) ** 2;
          const db = (b.x - 0.75) ** 2 + (b.y - 0.62) ** 2;
          return da - db;
        });
        const chosenId = candidates[0].id;
        return prev.map((b) => b.id === chosenId ? { ...b, dropping: true, dropY: 0, vx: 0, vy: 0 } : b);
      });
      setQueuedDrop(null);
    }
    rafRef.current = requestAnimationFrame(stepPhysics);
  };
  const handleSpin = () => {
    if (spinningRef.current) return;
    spinningRef.current = true;
    setSpinning(true);
    spinStartRef.current = performance.now();
    lastTsRef.current = performance.now();
    rafRef.current = requestAnimationFrame(stepPhysics);
    setTimeout(() => {
      spinningRef.current = false;
      setSpinning(false);
    }, 1400);
  };
  const S = size;
  const r = S * 0.45;
  const cx = S / 2, cy = S / 2;
  return /* @__PURE__ */ jsxDEV("div", { style: { width: S, height: S, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }, children: /* @__PURE__ */ jsxDEV("div", { onClick: handleSpin, title: "Tap to spin", style: { width: S, height: S, position: "relative", cursor: "pointer", userSelect: "none" }, children: [
    /* @__PURE__ */ jsxDEV("svg", { width: S, height: S, viewBox: `0 0 ${S} ${S}`, style: { display: "block" }, children: [
      /* @__PURE__ */ jsxDEV("defs", { children: /* @__PURE__ */ jsxDEV("radialGradient", { id: "cageGlow", cx: "50%", cy: "45%", children: [
        /* @__PURE__ */ jsxDEV("stop", { offset: "0%", stopColor: "rgba(255,255,255,0.6)" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 249,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("stop", { offset: "100%", stopColor: "rgba(255,255,255,0)" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 250,
          columnNumber: 15
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 248,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 247,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("ellipse", { cx, cy: cy + r * 0.9, rx: r * 0.65, ry: r * 0.18, fill: "rgba(0,0,0,0.08)" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 255,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("rect", { x: cx - 6, y: cy + r * 0.85, width: 12, height: S * 0.18, rx: 6, fill: "#444" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 258,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("rect", { x: cx - S * 0.22, y: cy + r * 0.95, width: S * 0.44, height: S * 0.04, rx: 6, fill: "#333" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 259,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("g", { children: [
        /* @__PURE__ */ jsxDEV("circle", { cx, cy, r, fill: "#fafafa", stroke: "none" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 263,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("circle", { cx, cy, r: r - 2, fill: "url(#cageGlow)", opacity: "0.55" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 264,
          columnNumber: 13
        }, this),
        [-0.6, -0.3, 0, 0.3, 0.6].map((t, i) => /* @__PURE__ */ jsxDEV("ellipse", { cx, cy, rx: r, ry: r * (1 - Math.abs(t) * 0.6), fill: "none", stroke: "#666", strokeWidth: 2, opacity: 0.7 }, i, false, {
          fileName: "<stdin>",
          lineNumber: 267,
          columnNumber: 15
        }, this)),
        Array.from({ length: 10 }).map((_, i) => {
          const ang = i / 10 * Math.PI * 2;
          const x = cx + Math.cos(ang) * r * 0.98;
          const y = cy + Math.sin(ang) * r * 0.98;
          return /* @__PURE__ */ jsxDEV("line", { x1: cx, y1: cy - r, x2: x, y2: y, stroke: "#666", strokeWidth: 1.6, opacity: 0.6 }, i, false, {
            fileName: "<stdin>",
            lineNumber: 274,
            columnNumber: 22
          }, this);
        }),
        /* @__PURE__ */ jsxDEV("path", { d: `M ${cx + r * 0.54} ${cy + r * 0.18} l ${S * 0.06} ${S * 0.06} l -${S * 0.2} ${S * 0.06} l -${S * 0.02} -${S * 0.08} z`, fill: "#f5f5f5", stroke: "#bdbdbd", strokeWidth: "1" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 278,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 262,
        columnNumber: 11
      }, this),
      balls.map((b) => {
        if (!b.alive) return null;
        const bx = b.x * S;
        const by = b.dropping ? cy + r * 0.24 + b.dropY * (S * 0.9) : b.y * S;
        const br = Math.max(10, Math.round(S * b.radius * 0.9));
        return /* @__PURE__ */ jsxDEV("g", { children: [
          /* @__PURE__ */ jsxDEV("circle", { cx: bx, cy: by, r: br, fill: b.color, stroke: "#aa6b6b", strokeWidth: 2 }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 289,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("text", { x: bx, y: by + br * 0.35, textAnchor: "middle", fontSize: br * 0.8, fontWeight: "700", fill: "#2b2b2b", style: { fontFamily: "Arial, Helvetica, sans-serif", pointerEvents: "none" }, children: (b.id - 1) % 75 + 1 }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 290,
            columnNumber: 17
          }, this)
        ] }, b.id, true, {
          fileName: "<stdin>",
          lineNumber: 288,
          columnNumber: 15
        }, this);
      })
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 246,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV("div", { style: { position: "absolute", right: -S * 0.16, top: cy - 12, width: S * 0.14, height: 24, background: "#555", borderRadius: 6, transform: `rotate(${spinning ? 30 : 0}deg)`, transition: "transform 300ms" } }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 299,
      columnNumber: 9
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 245,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 244,
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
        lineNumber: 378,
        columnNumber: 15
      }, this) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 377,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV(HeaderSmall, {}, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 382,
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
                  lineNumber: 412,
                  columnNumber: 25
                }, this),
                /* @__PURE__ */ jsxDEV("div", { style: { zIndex: 1, fontSize: 20 }, children: isFree ? "FREE" : cell }, void 0, false, {
                  fileName: "<stdin>",
                  lineNumber: 422,
                  columnNumber: 23
                }, this)
              ]
            },
            `${rIdx}-${cIdx}`,
            true,
            {
              fileName: "<stdin>",
              lineNumber: 390,
              columnNumber: 21
            },
            this
          );
        })
      ) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 383,
        columnNumber: 13
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 364,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 352,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 350,
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
        lineNumber: 437,
        columnNumber: 11
      },
      this
    ) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 436,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 435,
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
            lineNumber: 456,
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
            lineNumber: 462,
            columnNumber: 11
          },
          this
        )
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 455,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { style: { width: "100%", fontSize: 12 }, children: [
        /* @__PURE__ */ jsxDEV("div", { style: { fontWeight: 700, marginBottom: 6 }, children: "Recorded actions JSON" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 471,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("pre", { style: { whiteSpace: "pre-wrap", wordBreak: "break-word", background: "#f7f7f7", padding: 8, borderRadius: 6, maxHeight: 420, overflow: "auto" }, children: JSON.stringify(actions, null, 2) }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 472,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 470,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 454,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 348,
    columnNumber: 5
  }, this);
}
createRoot(document.getElementById("app")).render(/* @__PURE__ */ jsxDEV(InteractiveApp, {}, void 0, false, {
  fileName: "<stdin>",
  lineNumber: 481,
  columnNumber: 51
}));
