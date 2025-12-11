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
      arr.push({
        id: i + 1,
        x: 0.5 + (Math.random() - 0.5) * 0.3,
        y: 0.5 + (Math.random() - 0.5) * 0.25,
        vx: (Math.random() - 0.5) * 2e-3,
        vy: (Math.random() - 0.5) * 2e-3,
        color: ["#ff6b6b", "#ffd54f", "#6bcBFF", "#8de48d", "#f6a6ff"][i % 5]
      });
    }
    return arr;
  });
  const [spinning, setSpinning] = useState(false);
  const rafRef = useRef(null);
  const spinStartRef = useRef(0);
  const rotationRef = useRef(0);
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);
  const clampInside = (x, y, r2 = 0.49) => {
    const cx2 = x - 0.5, cy2 = y - 0.5;
    const dist = Math.sqrt(cx2 * cx2 + cy2 * cy2);
    if (dist > r2) {
      const scale = r2 / dist;
      return [0.5 + cx2 * scale, 0.5 + cy2 * scale];
    }
    return [x, y];
  };
  const step = (ts) => {
    if (!spinStartRef.current) spinStartRef.current = ts;
    const elapsed = ts - spinStartRef.current;
    const duration = 1400;
    const t = Math.min(1, elapsed / duration);
    const speed = (1 - Math.pow(t, 2)) * 0.015;
    rotationRef.current += speed * 16;
    setBalls((prev) => {
      const next = prev.map((b) => {
        const angle = Math.atan2(b.y - 0.5, b.x - 0.5) + rotationRef.current * 2e-3 + (Math.random() - 0.5) * 0.08;
        const radial = 0.012 + Math.random() * 4e-3;
        let nx = b.x + Math.cos(angle) * radial;
        let ny = b.y + Math.sin(angle) * radial;
        nx += (Math.random() - 0.5) * 8e-3;
        ny += (Math.random() - 0.5) * 6e-3;
        [nx, ny] = clampInside(nx, ny, 0.485);
        return { ...b, x: nx, y: ny };
      });
      return next;
    });
    if (elapsed < duration) {
      rafRef.current = requestAnimationFrame(step);
    } else {
      setSpinning(false);
      spinStartRef.current = 0;
      rotationRef.current = (Math.random() - 0.5) * 2;
      rafRef.current = null;
    }
  };
  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    spinStartRef.current = 0;
    rafRef.current = requestAnimationFrame(step);
  };
  const S = size;
  const r = S * 0.45;
  const cx = S / 2, cy = S / 2;
  return /* @__PURE__ */ jsxDEV("div", { style: { width: S, height: S, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }, children: /* @__PURE__ */ jsxDEV("div", { onClick: handleSpin, title: "Tap to spin", style: { width: S, height: S, position: "relative", cursor: "pointer", userSelect: "none" }, children: [
    /* @__PURE__ */ jsxDEV("svg", { width: S, height: S, viewBox: `0 0 ${S} ${S}`, style: { display: "block" }, children: [
      /* @__PURE__ */ jsxDEV("defs", { children: /* @__PURE__ */ jsxDEV("radialGradient", { id: "cageGlow", cx: "50%", cy: "45%", children: [
        /* @__PURE__ */ jsxDEV("stop", { offset: "0%", stopColor: "rgba(255,255,255,0.6)" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 140,
          columnNumber: 15
        }, this),
        /* @__PURE__ */ jsxDEV("stop", { offset: "100%", stopColor: "rgba(255,255,255,0)" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 141,
          columnNumber: 15
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 139,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 138,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("ellipse", { cx, cy: cy + r * 0.9, rx: r * 0.65, ry: r * 0.18, fill: "rgba(0,0,0,0.08)" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 146,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("rect", { x: cx - 6, y: cy + r * 0.85, width: 12, height: S * 0.18, rx: 6, fill: "#444" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 149,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("rect", { x: cx - S * 0.22, y: cy + r * 0.95, width: S * 0.44, height: S * 0.04, rx: 6, fill: "#333" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 150,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV("g", { style: { transformOrigin: `${cx}px ${cy}px`, transition: spinning ? "transform 0.08s linear" : "transform 0.6s ease-out", transform: spinning ? `rotate(${rotationRef.current}deg)` : "rotate(0deg)" }, children: [
        /* @__PURE__ */ jsxDEV("circle", { cx, cy, r, fill: "#fafafa", stroke: "none" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 155,
          columnNumber: 13
        }, this),
        /* @__PURE__ */ jsxDEV("circle", { cx, cy, r: r - 2, fill: "url(#cageGlow)", opacity: "0.55" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 156,
          columnNumber: 13
        }, this),
        [-0.6, -0.3, 0, 0.3, 0.6].map((t, i) => /* @__PURE__ */ jsxDEV("ellipse", { cx, cy, rx: r, ry: r * (1 - Math.abs(t) * 0.6), fill: "none", stroke: "#666", strokeWidth: 2, opacity: 0.7 }, i, false, {
          fileName: "<stdin>",
          lineNumber: 160,
          columnNumber: 15
        }, this)),
        Array.from({ length: 10 }).map((_, i) => {
          const ang = i / 10 * Math.PI * 2;
          const x = cx + Math.cos(ang) * r * 0.98;
          const y = cy + Math.sin(ang) * r * 0.98;
          return /* @__PURE__ */ jsxDEV("line", { x1: cx, y1: cy - r, x2: x, y2: y, stroke: "#666", strokeWidth: 1.6, opacity: 0.6 }, i, false, {
            fileName: "<stdin>",
            lineNumber: 168,
            columnNumber: 22
          }, this);
        }),
        /* @__PURE__ */ jsxDEV("path", { d: `M ${cx + r * 0.55} ${cy + r * 0.15} l ${S * 0.06} ${S * 0.06} l -${S * 0.2} ${S * 0.06} l -${S * 0.02} -${S * 0.08} z`, fill: "#f5f5f5", stroke: "#bdbdbd", strokeWidth: "1" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 172,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 153,
        columnNumber: 11
      }, this),
      balls.map((b) => {
        const bx = b.x * S;
        const by = b.y * S;
        const br = Math.max(10, Math.round(S * 0.06));
        return /* @__PURE__ */ jsxDEV("g", { children: [
          /* @__PURE__ */ jsxDEV("circle", { cx: bx, cy: by, r: br, fill: b.color, stroke: "#aa6b6b", strokeWidth: 2 }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 182,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("text", { x: bx, y: by + br * 0.35, textAnchor: "middle", fontSize: br * 0.8, fontWeight: "700", fill: "#2b2b2b", style: { fontFamily: "Arial, Helvetica, sans-serif", pointerEvents: "none" }, children: (b.id - 1) % 75 + 1 }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 183,
            columnNumber: 17
          }, this)
        ] }, b.id, true, {
          fileName: "<stdin>",
          lineNumber: 181,
          columnNumber: 15
        }, this);
      })
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 137,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV("div", { style: { position: "absolute", right: -S * 0.16, top: cy - 12, width: S * 0.14, height: 24, background: "#555", borderRadius: 6, transform: `rotate(${spinning ? 30 : 0}deg)`, transition: "transform 300ms" } }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 192,
      columnNumber: 9
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 136,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 135,
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
        lineNumber: 271,
        columnNumber: 15
      }, this) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 270,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ jsxDEV(HeaderSmall, {}, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 275,
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
                  lineNumber: 305,
                  columnNumber: 25
                }, this),
                /* @__PURE__ */ jsxDEV("div", { style: { zIndex: 1, fontSize: 20 }, children: isFree ? "FREE" : cell }, void 0, false, {
                  fileName: "<stdin>",
                  lineNumber: 315,
                  columnNumber: 23
                }, this)
              ]
            },
            `${rIdx}-${cIdx}`,
            true,
            {
              fileName: "<stdin>",
              lineNumber: 283,
              columnNumber: 21
            },
            this
          );
        })
      ) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 276,
        columnNumber: 13
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 257,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 245,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 243,
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
        lineNumber: 330,
        columnNumber: 11
      },
      this
    ) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 329,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 328,
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
            lineNumber: 349,
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
            lineNumber: 355,
            columnNumber: 11
          },
          this
        )
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 348,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { style: { width: "100%", fontSize: 12 }, children: [
        /* @__PURE__ */ jsxDEV("div", { style: { fontWeight: 700, marginBottom: 6 }, children: "Recorded actions JSON" }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 364,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("pre", { style: { whiteSpace: "pre-wrap", wordBreak: "break-word", background: "#f7f7f7", padding: 8, borderRadius: 6, maxHeight: 420, overflow: "auto" }, children: JSON.stringify(actions, null, 2) }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 365,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 363,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 347,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 241,
    columnNumber: 5
  }, this);
}
createRoot(document.getElementById("app")).render(/* @__PURE__ */ jsxDEV(InteractiveApp, {}, void 0, false, {
  fileName: "<stdin>",
  lineNumber: 374,
  columnNumber: 51
}));
