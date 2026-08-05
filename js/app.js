(function () {
  const DATE_FMT = new Intl.DateTimeFormat("es-VE", { day: "2-digit", month: "short", year: "numeric" });
  const TYPE_LABELS = {
    clips: "Reel",
    carousel_container: "Carrusel",
    feed: "Foto",
  };

  function typeLabel(post) {
    return TYPE_LABELS[post.productType] || post.type || "Post";
  }

  function interactions(post) {
    return (post.likes || 0) + (post.comments || 0);
  }

  function average(arr) {
    if (!arr.length) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  function round1(n) {
    return Math.round(n * 10) / 10;
  }

  function excerpt(caption, max) {
    if (!caption) return "(sin descripción)";
    const oneLine = caption.replace(/\s+/g, " ").trim();
    return oneLine.length > max ? oneLine.slice(0, max - 1) + "…" : oneLine;
  }

  function getSelectedPosts(allPosts, limit) {
    // allPosts viene más-reciente-primero; ordenamos por fecha desc para el corte,
    // y devolvemos igual en desc (el consumidor reordena si necesita asc).
    const sorted = [...allPosts].sort((a, b) => new Date(b.date) - new Date(a.date));
    return limit === "all" ? sorted : sorted.slice(0, Number(limit));
  }

  function renderStats(posts) {
    const grid = document.getElementById("stat-grid");
    grid.innerHTML = "";

    const likes = posts.map(p => p.likes || 0);
    const comments = posts.map(p => p.comments || 0);
    const best = posts.reduce((a, b) => (interactions(b) > interactions(a) ? b : a), posts[0]);

    const tiles = [
      { label: "Posts analizados", value: String(posts.length) },
      { label: "Likes promedio", value: round1(average(likes)).toLocaleString("es-VE") },
      { label: "Comentarios promedio", value: round1(average(comments)).toLocaleString("es-VE") },
      {
        label: "Post con más interacción",
        value: MosaicoCharts.formatCompact(interactions(best)),
        sub: excerpt(best.caption, 46),
        href: best.url,
        highlight: true,
      },
    ];

    tiles.forEach(t => {
      const card = document.createElement("div");
      card.className = "card stat-tile" + (t.highlight ? " highlight" : "");
      card.innerHTML = `
        <p class="stat-label">${t.label}</p>
        <p class="stat-value">${t.value}</p>
        ${t.sub ? `<p class="stat-sub" title="${t.sub.replace(/"/g, "&quot;")}">${t.sub}</p>` : ""}
      `;
      if (t.href) {
        card.style.cursor = "pointer";
        card.addEventListener("click", () => window.open(t.href, "_blank", "noopener"));
      }
      grid.appendChild(card);
    });
  }

  function renderCharts(posts) {
    const chronological = [...posts].sort((a, b) => new Date(a.date) - new Date(b.date));

    const likePoints = chronological.map(p => ({
      x: new Date(p.date), y: p.likes || 0, label: DATE_FMT.format(new Date(p.date))
    }));
    MosaicoCharts.renderLineChart(document.getElementById("chart-likes"), likePoints, { unit: "likes" });

    const commentPoints = chronological.map(p => ({
      x: new Date(p.date), y: p.comments || 0, label: DATE_FMT.format(new Date(p.date))
    }));
    MosaicoCharts.renderLineChart(document.getElementById("chart-comments"), commentPoints, { unit: "comentarios" });

    const top5 = [...posts]
      .sort((a, b) => interactions(b) - interactions(a))
      .slice(0, 5)
      .map(p => ({
        label: excerpt(p.caption, 34),
        value: interactions(p),
        href: p.url,
      }));
    MosaicoCharts.renderBarChart(document.getElementById("chart-top"), top5, { unit: "interacciones" });
  }

  function renderTable(posts) {
    const tbody = document.getElementById("posts-tbody");
    tbody.innerHTML = "";

    posts.forEach(p => {
      const tr = document.createElement("tr");

      const thumbTd = document.createElement("td");
      const img = document.createElement("img");
      img.className = "post-thumb";
      img.loading = "lazy";
      img.src = p.image || "";
      img.alt = "";
      img.onerror = () => { img.style.visibility = "hidden"; };
      thumbTd.appendChild(img);
      tr.appendChild(thumbTd);

      const dateTd = document.createElement("td");
      dateTd.textContent = DATE_FMT.format(new Date(p.date));
      tr.appendChild(dateTd);

      const typeTd = document.createElement("td");
      const badge = document.createElement("span");
      badge.className = "type-badge";
      badge.textContent = typeLabel(p);
      typeTd.appendChild(badge);
      tr.appendChild(typeTd);

      const captionTd = document.createElement("td");
      captionTd.className = "post-caption-cell";
      captionTd.textContent = excerpt(p.caption, 90);
      captionTd.title = p.caption || "";
      tr.appendChild(captionTd);

      const likesTd = document.createElement("td");
      likesTd.className = "num";
      likesTd.textContent = (p.likes ?? 0).toLocaleString("es-VE");
      tr.appendChild(likesTd);

      const commentsTd = document.createElement("td");
      commentsTd.className = "num";
      commentsTd.textContent = (p.comments ?? 0).toLocaleString("es-VE");
      tr.appendChild(commentsTd);

      const linkTd = document.createElement("td");
      const a = document.createElement("a");
      a.className = "post-link";
      a.href = p.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = "Ver post ↗";
      linkTd.appendChild(a);
      tr.appendChild(linkTd);

      tbody.appendChild(tr);
    });
  }

  function renderMeta() {
    const meta = document.getElementById("header-meta");
    const fetched = new Date(POSTS_DATA.fetchedAt);
    meta.innerHTML = `
      Última actualización: ${fetched.toLocaleString("es-VE", { dateStyle: "medium", timeStyle: "short" })}<br>
      <a href="https://www.instagram.com/${POSTS_DATA.username}/" target="_blank" rel="noopener">@${POSTS_DATA.username}</a>
    `;
  }

  function render() {
    const limit = document.getElementById("post-limit").value;
    const posts = getSelectedPosts(POSTS_DATA.posts, limit);
    renderStats(posts);
    renderCharts(posts);
    renderTable(posts);
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderMeta();
    document.getElementById("post-limit").addEventListener("change", render);
    render();
  });
})();
