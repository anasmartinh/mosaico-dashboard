// Mini librería de charts en SVG puro, sin dependencias externas.
// Pensada para series únicas (una hue) con crosshair/tooltip, siguiendo
// las specs del skill dataviz: línea 2px, marcadores >=8px, grid recesivo,
// hit targets más grandes que la marca.

const SVG_NS = "http://www.w3.org/2000/svg";

function el(tag, attrs) {
  const node = document.createElementNS(SVG_NS, tag);
  if (attrs) {
    for (const k in attrs) node.setAttribute(k, attrs[k]);
  }
  return node;
}

function niceMax(value) {
  if (value <= 0) return 1;
  const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
  const steps = [1, 2, 2.5, 5, 10];
  for (const step of steps) {
    const candidate = step * magnitude;
    if (candidate >= value) return candidate;
  }
  return 10 * magnitude;
}

function formatCompact(n) {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "") + "K";
  return String(Math.round(n));
}

function getTooltip(holder) {
  let tip = holder.querySelector(".chart-tooltip");
  if (!tip) {
    tip = document.createElement("div");
    tip.className = "chart-tooltip";
    tip.innerHTML = '<div class="tt-value"></div><div class="tt-label"></div>';
    holder.appendChild(tip);
  }
  return tip;
}

function showTooltip(holder, x, y, valueText, labelText) {
  const tip = getTooltip(holder);
  tip.querySelector(".tt-value").textContent = valueText;
  tip.querySelector(".tt-label").textContent = labelText;
  tip.style.left = x + "px";
  tip.style.top = y + "px";
  tip.classList.add("visible");
}

function hideTooltip(holder) {
  const tip = holder.querySelector(".chart-tooltip");
  if (tip) tip.classList.remove("visible");
}

/**
 * Line chart de una sola serie con crosshair + tooltip.
 * points: [{x: Date, y: number, label: string}]
 */
function renderLineChart(holder, points, opts) {
  opts = opts || {};
  const color = opts.color || "var(--data)";
  const width = opts.width || 640;
  const height = opts.height || 220;
  const margin = { top: 16, right: 16, bottom: 26, left: 40 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  holder.innerHTML = "";
  if (!points.length) {
    holder.innerHTML = '<p class="empty-state">Sin datos suficientes.</p>';
    return;
  }

  const svg = el("svg", { viewBox: `0 0 ${width} ${height}`, role: "img" });
  const maxY = niceMax(Math.max(...points.map(p => p.y)) * 1.1);
  const minX = points[0].x.getTime();
  const maxX = points[points.length - 1].x.getTime();
  const spanX = Math.max(1, maxX - minX);

  const xFor = (d) => margin.left + ((d.getTime() - minX) / spanX) * innerW;
  const yFor = (v) => margin.top + innerH - (v / maxY) * innerH;

  // gridlines (recessive, hairline)
  const gridSteps = 4;
  for (let i = 0; i <= gridSteps; i++) {
    const v = (maxY / gridSteps) * i;
    const y = yFor(v);
    svg.appendChild(el("line", {
      x1: margin.left, x2: width - margin.right, y1: y, y2: y,
      stroke: "var(--grid-line)", "stroke-width": 1
    }));
    const label = el("text", {
      x: margin.left - 8, y: y + 3, "text-anchor": "end",
      fill: "var(--text-muted)", "font-size": 10
    });
    label.textContent = formatCompact(v);
    svg.appendChild(label);
  }

  // area wash
  let areaPath = `M ${xFor(points[0].x)} ${yFor(0)}`;
  points.forEach(p => { areaPath += ` L ${xFor(p.x)} ${yFor(p.y)}`; });
  areaPath += ` L ${xFor(points[points.length - 1].x)} ${yFor(0)} Z`;
  svg.appendChild(el("path", { d: areaPath, fill: color, opacity: 0.1, stroke: "none" }));

  // line
  let linePath = `M ${xFor(points[0].x)} ${yFor(points[0].y)}`;
  points.forEach((p, i) => { if (i > 0) linePath += ` L ${xFor(p.x)} ${yFor(p.y)}`; });
  svg.appendChild(el("path", {
    d: linePath, fill: "none", stroke: color, "stroke-width": 2,
    "stroke-linejoin": "round", "stroke-linecap": "round"
  }));

  // end marker + label
  const last = points[points.length - 1];
  svg.appendChild(el("circle", {
    cx: xFor(last.x), cy: yFor(last.y), r: 5, fill: color,
    stroke: "var(--surface-card)", "stroke-width": 2
  }));
  const endLabel = el("text", {
    x: Math.min(xFor(last.x) + 6, width - margin.right - 2), y: yFor(last.y) - 8,
    "text-anchor": "end", fill: "var(--text-primary)", "font-size": 11, "font-weight": 600
  });
  endLabel.textContent = formatCompact(last.y);
  svg.appendChild(endLabel);

  // crosshair (hidden by default)
  const crosshair = el("line", {
    x1: 0, x2: 0, y1: margin.top, y2: margin.top + innerH,
    stroke: "var(--text-muted)", "stroke-width": 1, opacity: 0
  });
  svg.appendChild(crosshair);
  const hoverDot = el("circle", { r: 6, fill: color, stroke: "var(--surface-card)", "stroke-width": 2, opacity: 0 });
  svg.appendChild(hoverDot);

  // hit layer
  const hit = el("rect", {
    x: margin.left, y: margin.top, width: innerW, height: innerH,
    fill: "transparent"
  });
  svg.appendChild(hit);

  holder.appendChild(svg);

  function handleMove(evt) {
    const rect = svg.getBoundingClientRect();
    const scale = width / rect.width;
    const px = (evt.clientX - rect.left) * scale;
    let nearest = points[0];
    let nearestDist = Infinity;
    for (const p of points) {
      const d = Math.abs(xFor(p.x) - px);
      if (d < nearestDist) { nearestDist = d; nearest = p; }
    }
    const nx = xFor(nearest.x);
    const ny = yFor(nearest.y);
    crosshair.setAttribute("x1", nx);
    crosshair.setAttribute("x2", nx);
    crosshair.setAttribute("opacity", 1);
    hoverDot.setAttribute("cx", nx);
    hoverDot.setAttribute("cy", ny);
    hoverDot.setAttribute("opacity", 1);

    const holderRect = holder.getBoundingClientRect();
    const tipX = (nx / width) * holderRect.width;
    const tipY = (ny / height) * holderRect.height;
    showTooltip(holder, tipX, tipY, `${formatCompact(nearest.y)} ${opts.unit || ""}`.trim(), nearest.label);
  }
  function handleLeave() {
    crosshair.setAttribute("opacity", 0);
    hoverDot.setAttribute("opacity", 0);
    hideTooltip(holder);
  }
  svg.addEventListener("pointermove", handleMove);
  svg.addEventListener("pointerleave", handleLeave);
}

/**
 * Bar chart horizontal de una sola serie, con tooltip por barra.
 * items: [{label: string, value: number, href?: string}]
 */
function renderBarChart(holder, items, opts) {
  opts = opts || {};
  const color = opts.color || "var(--data)";
  const width = opts.width || 640;
  const rowH = 34;
  const margin = { top: 4, right: 46, bottom: 4, left: 4 };
  const height = margin.top + margin.bottom + items.length * rowH;

  holder.innerHTML = "";
  if (!items.length) {
    holder.innerHTML = '<p class="empty-state">Sin datos suficientes.</p>';
    return;
  }

  const svg = el("svg", { viewBox: `0 0 ${width} ${height}`, role: "img" });
  const maxV = niceMax(Math.max(...items.map(i => i.value)) * 1.05);
  const labelW = 210;
  const barX = margin.left + labelW;
  const barMaxW = width - barX - margin.right;

  items.forEach((item, i) => {
    const y = margin.top + i * rowH;
    const barW = Math.max(2, (item.value / maxV) * barMaxW);
    const barH = 18;
    const barY = y + (rowH - barH) / 2;

    const label = el("text", {
      x: margin.left, y: y + rowH / 2 + 4, "font-size": 11.5,
      fill: "var(--text-secondary)"
    });
    label.textContent = item.label.length > 30 ? item.label.slice(0, 29) + "…" : item.label;
    svg.appendChild(label);

    const group = el("g", { class: "bar-row", style: "cursor:pointer" });
    const bar = el("rect", {
      x: barX, y: barY, width: barW, height: barH, rx: 4,
      fill: color, opacity: 0.9
    });
    group.appendChild(bar);

    const value = el("text", {
      x: barX + barW + 8, y: y + rowH / 2 + 4, "font-size": 11.5,
      "font-weight": 600, fill: "var(--text-primary)"
    });
    value.textContent = formatCompact(item.value);
    group.appendChild(value);

    const hit = el("rect", {
      x: margin.left, y: y, width: width - margin.left - margin.right, height: rowH,
      fill: "transparent"
    });
    group.appendChild(hit);

    group.addEventListener("pointerenter", () => bar.setAttribute("opacity", 1));
    group.addEventListener("pointerleave", () => { bar.setAttribute("opacity", 0.9); hideTooltip(holder); });
    group.addEventListener("pointermove", (evt) => {
      const holderRect = holder.getBoundingClientRect();
      const svgRect = svg.getBoundingClientRect();
      const scaleY = svgRect.height / height;
      const tipX = ((barX + barW) / width) * holderRect.width;
      const tipY = ((y) * scaleY) + (evt.clientY - svgRect.top) * 0 + (y + rowH / 2) * (holderRect.height / height);
      showTooltip(holder, tipX, tipY, formatCompact(item.value) + (opts.unit ? " " + opts.unit : ""), item.label);
    });

    if (item.href) {
      group.style.cursor = "pointer";
      group.addEventListener("click", () => window.open(item.href, "_blank", "noopener"));
    }

    svg.appendChild(group);
  });

  holder.appendChild(svg);
}

window.MosaicoCharts = { renderLineChart, renderBarChart, formatCompact };
