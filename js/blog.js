let currentFilter = "all";

function escapeHtml(e) {
    return e ? String(e).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;") : ""
}

function getTagClass(e) {
    if (!e) return "";
    const t = e.toLowerCase();
    return t.includes("warehousing") ? "gold" : t.includes("industry") ? "green" : t.includes("customs") ? "purple" : t.includes("tip") || t.includes("expert") ? "orange" : ""
}

function applyFilterAndSearch() {
    const e = document.getElementById("blogSearch"),
        t = document.getElementById("noArticlesState"),
        a = document.querySelectorAll(".blog-card"),
        l = e ? e.value.toLowerCase().trim() : "";
    let n = 0;
    a.forEach(e => {
        const t = e.dataset.category || "General",
            a = e.querySelector(".blog-card-title")?.textContent.toLowerCase() || "",
            c = e.querySelector(".blog-card-excerpt")?.textContent.toLowerCase() || "",
            r = "all" === currentFilter || t === currentFilter,
            s = !l || a.includes(l) || c.includes(l);
        r && s ? (e.style.display = "flex", n++) : e.style.display = "none"
    });
    t && (t.style.display = 0 === n ? "block" : "none")
}

async function loadBlogsFromApi() {
    const e = document.getElementById("blogGrid"),
        t = document.getElementById("sidebarRecentList");
    if (e || t) try {
        const a = "undefined" != typeof API_BASE_URL && API_BASE_URL ? `${API_BASE_URL}/api/public/blogs` : `${window.location.origin}/api/public/blogs`,
            l = await fetch(a);
        if (!l.ok) throw new Error(`HTTP ${l.status}: Failed to fetch articles`);
        const n = await l.json();
        n.success && Array.isArray(n.blogs) && n.blogs.length > 0 && (e && (e.innerHTML = ""), t && (t.innerHTML = ""), n.blogs.forEach((a, l) => {
            const n = a.slug || `article-${a.id||l+1}`,
                c = `article-${a.id||l+1}`;
            if ("undefined" != typeof ARTICLES_DATA && (ARTICLES_DATA[n] = ARTICLES_DATA[c] = {
                    id: a.id || l + 1,
                    slug: n,
                    key: c,
                    title: a.title,
                    category: a.category || "General",
                    date: a.publish_date || a.date || "Recent",
                    author: {
                        name: a.author_name || "BC Cargo Team",
                        role: a.author_role || "Logistics Specialist",
                        avatar: a.author_avatar || "BC"
                    },
                    image: a.image_url || a.image || "https://files.catbox.moe/lpf0lv.png",
                    summary: a.summary || "",
                    contentHtml: a.content_html || a.content || `<p>${escapeHtml(a.summary||a.title)}</p>`
                }), e) {
                const t = document.createElement("article");
                t.className = "blog-card" + (0 === l ? " featured" : "");
                t.dataset.id = n;
                t.dataset.category = a.category || "General";
                t.innerHTML = `
                    <div class="blog-card-img">
                        <a href="/blog/${n}">
                            <img src="${a.image_url||a.image||"https://files.catbox.moe/lpf0lv.png"}" alt="${escapeHtml(a.title)}" loading="lazy" decoding="async" width="400" height="260">
                        </a>
                        <span class="blog-card-tag ${getTagClass(a.category)}">${escapeHtml(a.category||"General")}</span>
                    </div>
                    <div class="blog-card-body">
                        <h2 class="blog-card-title"><a href="/blog/${n}" style="color:inherit;text-decoration:none;">${escapeHtml(a.title)}</a></h2>
                        <p class="blog-card-excerpt">${escapeHtml(a.summary||"")}</p>
                        <div class="blog-card-meta">
                            <span><i class="fas fa-calendar"></i> ${escapeHtml(a.publish_date||a.date||"Recent")}</span>
                            <span><i class="fas fa-tag"></i> ${escapeHtml(a.category||"General")}</span>
                        </div>
                        <a href="/blog/${n}" class="blog-card-read-more">${0===l?"Read Full Article":"Read Article"} <i class="fas fa-arrow-right"></i></a>
                    </div>`;
                t.addEventListener("click", (evt) => {
                    if (!evt.target.closest("a")) {
                        window.location.href = `/blog/${n}`;
                    }
                });
                e.appendChild(t)
            }
            if (t && l < 5) {
                const e = document.createElement("div");
                e.className = "sidebar-recent-item";
                e.dataset.id = n;
                e.innerHTML = `
                    <a href="/blog/${n}" style="display:flex;align-items:center;gap:0.75rem;text-decoration:none;color:inherit;width:100%;">
                        <img src="${a.image_url||a.image||"https://files.catbox.moe/lpf0lv.png"}" alt="" class="sidebar-recent-thumb" loading="lazy" decoding="async" width="80" height="80">
                        <div>
                            <div class="sidebar-recent-text">${escapeHtml(a.title)}</div>
                            <div class="sidebar-recent-date"><i class="fas fa-calendar"></i> ${escapeHtml(a.publish_date||a.date||"Recent")}</div>
                        </div>
                    </a>`;
                t.appendChild(e)
            }
        }), applyFilterAndSearch())
    } catch (e) {
        console.warn("API Error loading blog articles, falling back to local dataset:", e.message)
    }
}

async function loadBlogStatsFromApi() {
    try {
        const e = "undefined" != typeof API_BASE_URL && API_BASE_URL ? `${API_BASE_URL}/api/public/blog-stats` : `${window.location.origin}/api/public/blog-stats`,
            t = await fetch(e);
        if (!t.ok) return;
        const a = await t.json();
        if (a.success && a.stats) {
            const {
                articlesPublished: e,
                monthlyReaders: t,
                countriesCovered: l,
                expertAuthors: n
            } = a.stats, c = document.getElementById("statArticlesPublished"), r = document.getElementById("statMonthlyReaders"), s = document.getElementById("statCountriesCovered"), o = document.getElementById("statExpertAuthors");
            c && (c.textContent = e), r && (r.textContent = t), s && (s.textContent = l), o && (o.textContent = n)
        }
    } catch (e) {
        console.warn("Could not load dynamic blog stats from backend:", e.message)
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const e = document.querySelectorAll(".filter-chip"),
        t = document.getElementById("blogSearch"),
        a = document.getElementById("resetFilterBtn"),
        l = document.getElementById("nlForm");
    e.forEach(t => {
        t.addEventListener("click", () => {
            e.forEach(e => e.classList.remove("active")), t.classList.add("active"), currentFilter = t.dataset.filter || "all", applyFilterAndSearch()
        })
    }), document.querySelectorAll(".sidebar-tag").forEach(t => {
        t.addEventListener("click", a => {
            a.preventDefault();
            const l = t.dataset.filter;
            e.forEach(e => {
                e.dataset.filter === l && e.click()
            });
            const n = document.getElementById("filterBar");
            n && window.scrollTo({
                top: n.offsetTop - 80,
                behavior: "smooth"
            })
        })
    }), t && t.addEventListener("input", applyFilterAndSearch), a && a.addEventListener("click", () => {
        t && (t.value = ""), e.forEach(e => e.classList.remove("active")), e[0] && e[0].classList.add("active"), currentFilter = "all", applyFilterAndSearch()
    }), l && l.addEventListener("submit", function(e) {
        e.preventDefault();
        const t = this.querySelector("button"),
            a = t ? t.innerHTML : "";
        t && (t.innerHTML = '<i class="fas fa-check"></i> Subscribed!', t.style.background = "linear-gradient(135deg,#10b981,#059669)", t.style.color = "#fff"), setTimeout(() => {
            t && (t.innerHTML = a, t.style.background = "", t.style.color = ""), this.reset()
        }, 3e3)
    }), document.querySelectorAll(".blog-card, .news-card").forEach(e => {
        e.addEventListener("click", t => {
            if (!t.target.closest("a")) {
                const a = e.dataset.slug || e.dataset.id || "air-freight-expansion-2025";
                window.location.href = `/blog/${a}`;
            }
        })
    }), loadBlogsFromApi(), loadBlogStatsFromApi()
});