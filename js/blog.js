/**
 * The BC Cargo & Courier - Blog JavaScript Module
 * Handles article filtering, search, dynamic API loading, article modal rendering,
 * and SEO-friendly URL pushState deep-linking.
 */

let currentFilter = "all";

function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function getTagClass(cat) {
    if (!cat) return "";
    const lower = cat.toLowerCase();
    if (lower.includes("warehousing")) return "gold";
    if (lower.includes("industry")) return "green";
    if (lower.includes("customs")) return "purple";
    if (lower.includes("tip") || lower.includes("expert")) return "orange";
    return "";
}

function applyFilterAndSearch() {
    const searchInput = document.getElementById("blogSearch");
    const noArticlesState = document.getElementById("noArticlesState");
    const blogCards = document.querySelectorAll(".blog-card");
    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";

    let matchCount = 0;
    blogCards.forEach(card => {
        const cat = card.dataset.category || "General";
        const title = card.querySelector(".blog-card-title")?.textContent.toLowerCase() || "";
        const excerpt = card.querySelector(".blog-card-excerpt")?.textContent.toLowerCase() || "";
        
        const matchesCategory = currentFilter === "all" || cat === currentFilter;
        const matchesSearch = !query || title.includes(query) || excerpt.includes(query);

        if (matchesCategory && matchesSearch) {
            card.style.display = "flex";
            matchCount++;
        } else {
            card.style.display = "none";
        }
    });

    if (noArticlesState) {
        noArticlesState.style.display = matchCount === 0 ? "block" : "none";
    }
}

async function loadBlogsFromApi() {
    const blogGrid = document.getElementById("blogGrid");
    const sidebarRecentList = document.getElementById("sidebarRecentList");
    if (!blogGrid && !sidebarRecentList) return;

    try {
        const apiEndpoint = (typeof API_BASE_URL !== "undefined" && API_BASE_URL) 
            ? `${API_BASE_URL}/api/public/blogs` 
            : `${window.location.origin}/api/public/blogs`;
        const res = await fetch(apiEndpoint);
        if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch articles`);
        const data = await res.json();

        if (data.success && Array.isArray(data.blogs) && data.blogs.length > 0) {
            if (blogGrid) blogGrid.innerHTML = "";
            if (sidebarRecentList) sidebarRecentList.innerHTML = "";

            data.blogs.forEach((blog, idx) => {
                const slug = blog.slug || `article-${blog.id || idx + 1}`;
                const key = `article-${blog.id || idx + 1}`;

                // Populate shared ARTICLES_DATA object
                if (typeof ARTICLES_DATA !== "undefined") {
                    ARTICLES_DATA[slug] = ARTICLES_DATA[key] = {
                        id: blog.id || idx + 1,
                        slug: slug,
                        key: key,
                        title: blog.title,
                        category: blog.category || "General",
                        date: blog.publish_date || blog.date || "Recent",
                        author: {
                            name: blog.author_name || "BC Cargo Team",
                            role: blog.author_role || "Logistics Specialist",
                            avatar: blog.author_avatar || "BC"
                        },
                        image: blog.image_url || blog.image || "https://files.catbox.moe/lpf0lv.png",
                        summary: blog.summary || "",
                        contentHtml: blog.content_html || blog.content || `<p>${escapeHtml(blog.summary || blog.title)}</p>`
                    };
                }

                // Render blog card
                if (blogGrid) {
                    const card = document.createElement("article");
                    card.className = "blog-card" + (idx === 0 ? " featured" : "");
                    card.dataset.id = slug;
                    card.dataset.category = blog.category || "General";
                    card.innerHTML = `
                        <div class="blog-card-img">
                            <img src="${blog.image_url || blog.image || "https://files.catbox.moe/lpf0lv.png"}" alt="${escapeHtml(blog.title)}" loading="lazy">
                            <span class="blog-card-tag ${getTagClass(blog.category)}">${escapeHtml(blog.category || "General")}</span>
                        </div>
                        <div class="blog-card-body">
                            <h2 class="blog-card-title">${escapeHtml(blog.title)}</h2>
                            <p class="blog-card-excerpt">${escapeHtml(blog.summary || "")}</p>
                            <div class="blog-card-meta">
                                <span><i class="fas fa-calendar"></i> ${escapeHtml(blog.publish_date || blog.date || "Recent")}</span>
                                <span><i class="fas fa-tag"></i> ${escapeHtml(blog.category || "General")}</span>
                            </div>
                            <span class="blog-card-read-more">${idx === 0 ? "Read Full Article" : "Read Article"} <i class="fas fa-arrow-right"></i></span>
                        </div>
                    `;
                    card.addEventListener("click", () => {
                        if (typeof openArticleModal === "function") {
                            openArticleModal(slug);
                        }
                    });
                    blogGrid.appendChild(card);
                }

                // Render sidebar recent list
                if (sidebarRecentList && idx < 5) {
                    const item = document.createElement("div");
                    item.className = "sidebar-recent-item";
                    item.dataset.id = slug;
                    item.innerHTML = `
                        <img src="${blog.image_url || blog.image || "https://files.catbox.moe/lpf0lv.png"}" alt="" class="sidebar-recent-thumb" loading="lazy">
                        <div>
                            <div class="sidebar-recent-text">${escapeHtml(blog.title)}</div>
                            <div class="sidebar-recent-date"><i class="fas fa-calendar"></i> ${escapeHtml(blog.publish_date || blog.date || "Recent")}</div>
                        </div>
                    `;
                    item.addEventListener("click", (e) => {
                        e.preventDefault();
                        if (typeof openArticleModal === "function") {
                            openArticleModal(slug);
                        }
                    });
                    sidebarRecentList.appendChild(item);
                }
            });

            applyFilterAndSearch();
        }
    } catch (err) {
        console.warn("API Error loading blog articles, falling back to local dataset:", err.message);
    }
}

async function loadBlogStatsFromApi() {
    try {
        const apiEndpoint = (typeof API_BASE_URL !== "undefined" && API_BASE_URL) 
            ? `${API_BASE_URL}/api/public/blog-stats` 
            : `${window.location.origin}/api/public/blog-stats`;
        const res = await fetch(apiEndpoint);
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && data.stats) {
            const { articlesPublished, monthlyReaders, countriesCovered, expertAuthors } = data.stats;
            const elArticles = document.getElementById("statArticlesPublished");
            const elReaders = document.getElementById("statMonthlyReaders");
            const elCountries = document.getElementById("statCountriesCovered");
            const elAuthors = document.getElementById("statExpertAuthors");

            if (elArticles) elArticles.textContent = articlesPublished;
            if (elReaders) elReaders.textContent = monthlyReaders;
            if (elCountries) elCountries.textContent = countriesCovered;
            if (elAuthors) elAuthors.textContent = expertAuthors;
        }
    } catch (err) {
        console.warn("Could not load dynamic blog stats from backend:", err.message);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const filterChips = document.querySelectorAll(".filter-chip");
    const blogSearch = document.getElementById("blogSearch");
    const resetFilterBtn = document.getElementById("resetFilterBtn");
    const nlForm = document.getElementById("nlForm");

    filterChips.forEach(chip => {
        chip.addEventListener("click", () => {
            filterChips.forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
            currentFilter = chip.dataset.filter || "all";
            applyFilterAndSearch();
        });
    });

    document.querySelectorAll(".sidebar-tag").forEach(tag => {
        tag.addEventListener("click", e => {
            e.preventDefault();
            const targetFilter = tag.dataset.filter;
            filterChips.forEach(c => {
                if (c.dataset.filter === targetFilter) c.click();
            });
            const filterBar = document.getElementById("filterBar");
            if (filterBar) window.scrollTo({ top: filterBar.offsetTop - 80, behavior: "smooth" });
        });
    });

    if (blogSearch) {
        blogSearch.addEventListener("input", applyFilterAndSearch);
    }

    if (resetFilterBtn) {
        resetFilterBtn.addEventListener("click", () => {
            if (blogSearch) blogSearch.value = "";
            filterChips.forEach(c => c.classList.remove("active"));
            if (filterChips[0]) filterChips[0].classList.add("active");
            currentFilter = "all";
            applyFilterAndSearch();
        });
    }

    if (nlForm) {
        nlForm.addEventListener("submit", function(e) {
            e.preventDefault();
            const btn = this.querySelector("button");
            const btnOrig = btn ? btn.innerHTML : "";
            if (btn) {
                btn.innerHTML = '<i class="fas fa-check"></i> Subscribed!';
                btn.style.background = "linear-gradient(135deg,#10b981,#059669)";
                btn.style.color = "#fff";
            }
            setTimeout(() => {
                if (btn) {
                    btn.innerHTML = btnOrig;
                    btn.style.background = "";
                    btn.style.color = "";
                }
                this.reset();
            }, 3000);
        });
    }

    // Attach click listener to any static blog/news cards present on page load
    document.querySelectorAll(".blog-card, .news-card").forEach(card => {
        card.addEventListener("click", (e) => {
            e.preventDefault();
            const slug = card.dataset.slug || card.dataset.id || "air-freight-expansion-2025";
            if (typeof openArticleModal === "function") {
                openArticleModal(slug);
            }
        });
    });

    loadBlogsFromApi();
    loadBlogStatsFromApi();
});