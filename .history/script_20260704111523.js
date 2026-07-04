/**
 * script.js
 * Comprehensive SPA Logic: Routing, API Communication, Filtering, Auth, and Interactivity.
 */

// --- 1. API Configuration ---
// Register at developer.adzuna.com for free keys
const API_CONFIG = {
    BASE_URL: 'https://api.adzuna.com/v1/api/jobs',
    COUNTRY: 'us', // Default search country
    APP_ID: 'YOUR_ADZUNA_APP_ID_HERE',
    APP_KEY: 'YOUR_ADZUNA_APP_KEY_HERE',
    RESULTS_PER_PAGE: 15
};

// --- 2. Global Application State ---
const AppState = {
    isLoggedIn: false,
    currentUser: null,
    currentView: 'dashboard',
    activeJobId: null,
    currentFilterTag: 'All',
    searchQuery: '',
    savedJobs: [],
    appliedJobs: [],
    liveJobsData: [], // Stores fetched API data
    isFetching: false
};

// --- 3. DOM References ---
const DOM = {
    spaViews: document.querySelectorAll('.spa-view'),
    navLinks: document.querySelectorAll('.nav-link'),
    feedTitle: document.getElementById('feed-title'),
    feedSubtitle: document.getElementById('feed-subtitle'),
    jobCardsContainer: document.getElementById('job-cards-container'),
    jobDetailSection: document.getElementById('job-detail-section'),
    applicationsContainer: document.getElementById('applications-container'),
    profileContainer: document.getElementById('profile-container'),
    searchInput: document.getElementById('search-input'),
    filterPills: document.querySelectorAll('.filter-tag'),
    searchContainer: document.getElementById('global-search-container'),
    authModal: document.getElementById('auth-modal'),
    closeModalBtn: document.getElementById('close-modal-btn'),
    authForm: document.getElementById('auth-form'),
    headerAuthBtn: document.getElementById('header-auth-btn'),
    headerAvatar: document.getElementById('header-avatar'),
    sidebar: document.getElementById('sidebar'),
    mobileToggle: document.getElementById('mobile-menu-toggle')
};

// --- 4. Asynchronous Data Pipeline & API Integration ---

/**
 * Strips raw HTML tags from API strings (Common in API job titles/descriptions)
 */
const stripHtml = (htmlStr) => {
    if (!htmlStr) return '';
    return htmlStr.replace(/(<([^>]+)>)/gi, "").trim();
};

/**
 * Structural Data Mapping Layer
 * Transforms messy nested API JSON into our exact UI schema format.
 */
const transformApiData = (apiResults) => {
    return apiResults.map(job => {
        // Construct dynamic salary string based on available API data
        let salaryStr = "Salary undisclosed";
        if (job.salary_min && job.salary_max) {
            // Format to thousands (e.g., $90k)
            const min = Math.round(job.salary_min / 1000);
            const max = Math.round(job.salary_max / 1000);
            salaryStr = `$${min}k - $${max}k`;
        } else if (job.salary_min) {
            salaryStr = `From $${Math.round(job.salary_min / 1000)}k`;
        }

        return {
            id: String(job.id), // Ensure string for robust comparisons
            title: stripHtml(job.title),
            company: job.company?.display_name || 'Confidential Company',
            location: job.location?.display_name || 'Remote/Unknown',
            shiftType: 'Full-Time', // Defaulting as some APIs don't specify
            salary: salaryStr,
            postedTime: new Date(job.created).toLocaleDateString(),
            logoIcon: "ph-briefcase", // Generic icon fallback for API data
            tags: [job.category?.label || "Tech", "API Sourced"],
            description: stripHtml(job.description),
            requirements: [
                "Requirements are detailed in the full job description.",
                "Please review the company application portal for specifics.",
                "Remote flexibility depends on company policy."
            ]
        };
    });
};

/**
 * Fallback Generator (If network fails or keys are missing)
 * Dynamically constructs mock cards based on the search keyword.
 */
const generateLocalFallback = (keyword) => {
    const fallbackTerm = keyword || "Software Engineer";
    return [
        {
            id: `fallback-1-${Date.now()}`,
            title: `Senior ${fallbackTerm}`,
            company: "TechCorp (Fallback)",
            location: "Hitech City, Hyderabad",
            shiftType: "Night Shift / Strictly Onsite",
            salary: "₹12L - ₹18L",
            postedTime: "Just now",
            logoIcon: "ph-code",
            tags: ["Java", "Spring Boot", "React", fallbackTerm],
            description: `We are looking for a highly skilled ${fallbackTerm} to join our core engineering team. This is a local fallback response triggered by an API failure.`,
            requirements: [
                "Minimum 3+ years of experience.",
                "Strong understanding of CSS Grid, Flexbox.",
                "Must be able to commute daily."
            ]
        },
        {
            id: `fallback-2-${Date.now()}`,
            title: `${fallbackTerm} Specialist`,
            company: "DataSync Solutions",
            location: "Remote",
            shiftType: "Flexible Shift",
            salary: "$110k - $140k",
            postedTime: "5 hours ago",
            logoIcon: "ph-terminal-window",
            tags: ["Python", "Backend", "Remote", fallbackTerm],
            description: `DataSync is searching for a ${fallbackTerm} developer. Local fallback active.`,
            requirements: [
                "6+ years of engineering experience.",
                "Expertise in modern frameworks."
            ]
        }
    ];
};

/**
 * Core Network Fetcher
 * Handles active network requests with Strict Error Boundaries
 */
async function fetchLiveJobData(keyword = "Software Developer") {
    AppState.isFetching = true;
    renderJobFeed(); // Triggers loading state UI

    // URL Encoding for safe transmission
    const safeKeyword = encodeURIComponent(keyword);
    const endpoint = `${API_CONFIG.BASE_URL}/${API_CONFIG.COUNTRY}/search/1?app_id=${API_CONFIG.APP_ID}&app_key=${API_CONFIG.APP_KEY}&results_per_page=${API_CONFIG.RESULTS_PER_PAGE}&what=${safeKeyword}&content-type=application/json`;

    try {
        // If keys are placeholders, throw instantly to trigger local fallback mock
        if (API_CONFIG.APP_ID.includes('YOUR_')) {
            throw new Error("Missing API Keys");
        }

        const response = await fetch(endpoint);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const json = await response.json();

        if (json.results && json.results.length > 0) {
            AppState.liveJobsData = transformApiData(json.results);
        } else {
            AppState.liveJobsData = []; // No results found
        }

    } catch (error) {
        console.warn("API Fetch Failed, loading local dynamic fallback data. Reason:", error.message);
        // Execute dynamic local mock matching the user's search
        AppState.liveJobsData = generateLocalFallback(keyword);
    } finally {
        AppState.isFetching = false;
        renderJobFeed(); // Re-render feed with new data
    }
}


// --- 5. Input Debouncing for Performance ---

function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        // Clear previous timer if user is still typing
        clearTimeout(timeoutId);
        // Set new timer
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

// Create debounced API caller (500ms delay)
const handleLiveSearch = debounce((query) => {
    AppState.searchQuery = query;
    const searchTarget = query.trim() === "" ? "Developer" : query.trim();
    fetchLiveJobData(searchTarget);
}, 500);

// Attach debounced listener to search input
DOM.searchInput.addEventListener('input', (e) => {
    handleLiveSearch(e.target.value);
});


// --- 6. Rendering Logic ---

function getFilteredJobs(onlySaved = false) {
    let result = AppState.liveJobsData;

    // Filter by Saved State
    if (onlySaved) {
        result = result.filter(job => AppState.savedJobs.includes(job.id));
        return result;
    }

    // Filter by Category Pill locally (on already fetched API data)
    if (AppState.currentFilterTag !== 'All') {
        const tagFilter = AppState.currentFilterTag.toLowerCase();
        result = result.filter(job =>
            job.tags.some(t => t.toLowerCase().includes(tagFilter)) ||
            job.title.toLowerCase().includes(tagFilter)
        );
    }

    return result;
}

function renderJobFeed(onlySaved = false) {
    DOM.jobCardsContainer.innerHTML = '';

    // Handle Loading State
    if (AppState.isFetching) {
        DOM.jobCardsContainer.innerHTML = `
            <div style="text-align: center; color: var(--text-secondary); padding: 60px 20px;">
                <i class="ph ph-spinner-gap" style="font-size: 32px; animation: spin 1s linear infinite;"></i>
                <h3 style="margin-top: 16px;">Searching global database...</h3>
                <style>@keyframes spin { 100% { transform: rotate(360deg); } }</style>
            </div>`;
        return;
    }

    const jobs = getFilteredJobs(onlySaved);

    if (jobs.length === 0) {
        DOM.jobCardsContainer.innerHTML = `
            <div style="text-align: center; color: var(--text-secondary); padding: 60px 20px; border: 1px dashed var(--border-color); border-radius: var(--radius-md);">
                <i class="ph ph-magnifying-glass" style="font-size: 32px; margin-bottom: 12px; opacity: 0.5;"></i>
                <h3>No jobs found</h3>
                <p style="margin-top: 8px;">${onlySaved ? "You haven't saved any jobs yet." : "Try adjusting your search or filters."}</p>
            </div>`;
        return;
    }

    jobs.forEach(job => {
        const isSaved = AppState.savedJobs.includes(job.id);
        const card = document.createElement('div');
        card.className = `job-card ${job.id === AppState.activeJobId ? 'active' : ''}`;

        let tagsHtml = `<span class="tag tag-shift">${job.shiftType}</span>`;
        job.tags.forEach(tag => {
            tagsHtml += `<span class="tag tag-normal">${tag}</span>`;
        });

        card.innerHTML = `
            <div class="card-header">
                <div class="company-info">
                    <div class="company-logo"><i class="ph ${job.logoIcon}"></i></div>
                    <div>
                        <h3 class="job-title">${job.title}</h3>
                        <p class="company-name">${job.company}</p>
                    </div>
                </div>
                <button class="bookmark-btn ${isSaved ? 'saved' : ''}" aria-label="Save Job" onclick="event.stopPropagation(); toggleSaveJob('${job.id}');">
                    <i class="ph ${isSaved ? 'ph-bookmark-simple-fill' : 'ph-bookmark-simple'}"></i>
                </button>
            </div>
            <div class="card-tags">${tagsHtml}</div>
            <div class="card-footer">
                <div class="card-footer-item"><i class="ph ph-map-pin"></i> ${job.location}</div>
                <div class="card-footer-item"><i class="ph ph-currency-circle-dollar"></i> ${job.salary}</div>
                <div class="card-footer-item"><i class="ph ph-clock"></i> ${job.postedTime}</div>
            </div>
        `;

        card.addEventListener('click', () => loadJobDetails(job.id));
        DOM.jobCardsContainer.appendChild(card);
    });
}

function loadJobDetails(id) {
    AppState.activeJobId = id;
    const job = AppState.liveJobsData.find(j => j.id === String(id));

    // Re-render feed to apply active highlight
    renderJobFeed(AppState.currentView === 'saved');

    if (!job) return;

    const isSaved = AppState.savedJobs.includes(job.id);
    const hasApplied = AppState.appliedJobs.includes(job.id);
    const reqs = job.requirements.map(r => `<li>${r}</li>`).join('');

    DOM.jobDetailSection.innerHTML = `
        <div class="detail-content">
            <button class="mobile-back-btn" onclick="closeMobileDetail()">
                <i class="ph ph-arrow-left"></i> Back to List
            </button>

            <div class="detail-header-card">
                <div class="detail-company-logo"><i class="ph ${job.logoIcon}"></i></div>
                <h2 class="detail-title">${job.title}</h2>
                <p class="detail-company">${job.company}</p>
                
                <div class="detail-meta">
                    <div class="meta-item"><i class="ph ph-map-pin"></i> ${job.location}</div>
                    <div class="meta-item"><i class="ph ph-briefcase"></i> ${job.shiftType}</div>
                    <div class="meta-item"><i class="ph ph-currency-circle-dollar"></i> ${job.salary}</div>
                </div>

                <div class="detail-actions">
                    <button id="apply-btn-${job.id}" class="btn ${hasApplied ? 'btn-applied' : 'btn-primary'}" onclick="handleApply('${job.id}')" ${hasApplied ? 'disabled' : ''}>
                        ${hasApplied ? '<i class="ph ph-check-circle"></i> Applied' : 'Apply Now'}
                    </button>
                    <button id="save-btn-${job.id}" class="btn btn-secondary ${isSaved ? 'btn-saved' : ''}" onclick="toggleSaveJob('${job.id}', true)">
                        <i class="ph ${isSaved ? 'ph-bookmark-simple-fill' : 'ph-bookmark-simple'}"></i> ${isSaved ? 'Saved' : 'Save Job'}
                    </button>
                </div>
            </div>

            <div class="detail-body">
                <h3 class="section-title">Job Description</h3>
                <p class="detail-text">${job.description}</p>
                <h3 class="section-title">Requirements</h3>
                <ul class="requirements-list">${reqs}</ul>
            </div>
        </div>
    `;

    if (window.innerWidth <= 768) DOM.jobDetailSection.classList.add('active');
}


// --- 7. Router & Event Listeners ---

function switchView(viewName) {
    AppState.currentView = viewName;

    // Update Sidebar Navigation States
    DOM.navLinks.forEach(link => link.classList.remove('active'));
    const targetLink = Array.from(DOM.navLinks).find(l => l.dataset.target === viewName);
    if (targetLink) targetLink.classList.add('active');

    // Toggle View Visibilities
    DOM.spaViews.forEach(view => view.classList.remove('active-view'));

    switch (viewName) {
        case 'dashboard':
            document.getElementById('view-dashboard').classList.add('active-view');
            DOM.feedTitle.textContent = "Find your dream job";
            DOM.feedSubtitle.textContent = "Explore live global opportunities";
            DOM.searchContainer.style.display = 'flex';
            document.getElementById('filter-pills').style.display = 'flex';
            renderJobFeed();
            break;

        case 'saved':
            document.getElementById('view-dashboard').classList.add('active-view');
            DOM.feedTitle.textContent = "Saved Jobs";
            DOM.feedSubtitle.textContent = "Jobs you've bookmarked for later";
            DOM.searchContainer.style.display = 'none';
            document.getElementById('filter-pills').style.display = 'none';
            renderJobFeed(true);
            break;

        case 'applications':
            document.getElementById('view-applications').classList.add('active-view');
            renderApplicationsHistory();
            break;

        case 'profile':
            document.getElementById('view-profile').classList.add('active-view');
            renderProfile();
            break;
    }

    if (window.innerWidth <= 768) DOM.sidebar.classList.remove('open');
}

DOM.navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        switchView(link.dataset.target);
    });
});

// Pill Filter Re-fetch Trigger
DOM.filterPills.forEach(pill => {
    pill.addEventListener('click', (e) => {
        DOM.filterPills.forEach(p => p.classList.remove('active'));
        e.target.classList.add('active');
        AppState.currentFilterTag = e.target.dataset.tag;

        // Execute API search using the pill category text as the search base
        const tag = AppState.currentFilterTag === 'All' ? 'Developer' : AppState.currentFilterTag;
        fetchLiveJobData(tag);
    });
});

window.closeMobileDetail = function () {
    DOM.jobDetailSection.classList.remove('active');
}

// --- 8. Applications & Profile Views ---

function renderApplicationsHistory() {
    DOM.applicationsContainer.innerHTML = '';

    if (AppState.appliedJobs.length === 0) {
        DOM.applicationsContainer.innerHTML = `
            <div style="color: var(--text-secondary); text-align: center; padding: 40px; border: 1px dashed var(--border-color); border-radius: var(--radius-md);">
                You haven't applied to any jobs yet.
            </div>`;
        return;
    }

    const appliedData = AppState.liveJobsData.filter(j => AppState.appliedJobs.includes(j.id));

    appliedData.forEach(job => {
        const card = document.createElement('div');
        card.className = 'history-card';
        card.innerHTML = `
            <div>
                <h3 style="margin-bottom: 4px;">${job.title}</h3>
                <p style="color: var(--text-secondary); font-size: 14px;">${job.company} • Application active</p>
            </div>
            <div class="history-status">Application Sent</div>
        `;
        DOM.applicationsContainer.appendChild(card);
    });
}

function renderProfile() {
    if (!AppState.isLoggedIn) {
        DOM.profileContainer.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <i class="ph ph-user-circle" style="font-size: 48px; color: var(--text-secondary); margin-bottom: 16px;"></i>
                <h3>Guest User</h3>
                <p style="color: var(--text-secondary); margin-bottom: 24px; margin-top: 8px;">Sign in to view and manage your full profile.</p>
                <button class="btn btn-primary" onclick="openAuthModal()" style="margin: 0 auto;">Sign In</button>
            </div>`;
        return;
    }

    DOM.profileContainer.innerHTML = `
        <div style="display: flex; align-items: center; gap: 24px; margin-bottom: 32px; padding-bottom: 32px; border-bottom: 1px solid var(--border-color);">
            <img src="https://ui-avatars.com/api/?name=${AppState.currentUser}&background=2563eb&color=fff&size=80" alt="Avatar" style="border-radius: 50%;">
            <div>
                <h2 style="margin-bottom: 4px;">${AppState.currentUser}</h2>
                <p style="color: var(--text-secondary);">Verified Candidate • Active seeking</p>
            </div>
        </div>
        <div class="profile-stat">
            <span class="profile-label">Email Address</span>
            <span class="profile-value">${AppState.currentUser}@example.com</span>
        </div>
        <div class="profile-stat">
            <span class="profile-label">Total Applications</span>
            <span class="profile-value">${AppState.appliedJobs.length}</span>
        </div>
        <div class="profile-stat">
            <span class="profile-label">Saved Jobs</span>
            <span class="profile-value">${AppState.savedJobs.length}</span>
        </div>
    `;
}

// --- 9. Save & Apply Logic ---

window.toggleSaveJob = function (jobId, fromDetailView = false) {
    const idx = AppState.savedJobs.indexOf(jobId);
    if (idx > -1) {
        AppState.savedJobs.splice(idx, 1);
    } else {
        AppState.savedJobs.push(jobId);
    }

    if (AppState.currentView === 'dashboard' || AppState.currentView === 'saved') {
        renderJobFeed(AppState.currentView === 'saved');
    }

    if (fromDetailView && AppState.activeJobId === jobId) {
        const btn = document.getElementById(`save-btn-${jobId}`);
        const isSaved = AppState.savedJobs.includes(jobId);
        if (btn) {
            btn.className = `btn btn-secondary ${isSaved ? 'btn-saved' : ''}`;
            btn.innerHTML = `<i class="ph ${isSaved ? 'ph-bookmark-simple-fill' : 'ph-bookmark-simple'}"></i> ${isSaved ? 'Saved' : 'Save Job'}`;
        }
    }
}

window.handleApply = function (jobId) {
    if (!AppState.isLoggedIn) {
        openAuthModal();
        return;
    }

    if (!AppState.appliedJobs.includes(jobId)) {
        AppState.appliedJobs.push(jobId);
        const btn = document.getElementById(`apply-btn-${jobId}`);
        if (btn) {
            btn.className = 'btn btn-applied';
            btn.disabled = true;
            btn.innerHTML = `<i class="ph ph-check-circle"></i> Applied`;
        }
    }
}


// --- 10. Authentication Modal ---

window.openAuthModal = function () { DOM.authModal.classList.add('open'); }
function closeAuthModal() { DOM.authModal.classList.remove('open'); }

DOM.headerAuthBtn.addEventListener('click', () => {
    if (AppState.isLoggedIn) {
        AppState.isLoggedIn = false;
        AppState.currentUser = null;
        DOM.headerAuthBtn.textContent = 'Login';
        DOM.headerAuthBtn.classList.replace('btn-secondary', 'btn-primary');
        DOM.headerAvatar.classList.remove('logged-in');
        DOM.headerAvatar.src = "https://ui-avatars.com/api/?name=Guest&background=1e1e1e&color=a0a0a0";
        if (AppState.currentView === 'profile') renderProfile();
    } else {
        openAuthModal();
    }
});

DOM.closeModalBtn.addEventListener('click', closeAuthModal);
DOM.authModal.addEventListener('click', (e) => {
    if (e.target === DOM.authModal) closeAuthModal();
});

DOM.authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const nameStr = email.split('@')[0];

    AppState.isLoggedIn = true;
    AppState.currentUser = nameStr;

    DOM.headerAuthBtn.textContent = 'Sign Out';
    DOM.headerAuthBtn.classList.replace('btn-primary', 'btn-secondary');
    DOM.headerAvatar.classList.add('logged-in');
    DOM.headerAvatar.src = `https://ui-avatars.com/api/?name=${nameStr}&background=2563eb&color=fff`;

    closeAuthModal();
    DOM.authForm.reset();

    if (AppState.currentView === 'profile') renderProfile();
});

DOM.mobileToggle.addEventListener('click', () => DOM.sidebar.classList.toggle('open'));

// --- 11. Intent-Driven Search & Auto-Reset ---

// 1. Intent-Driven Enter Trigger
DOM.searchInput.addEventListener('keydown', (e) => {
    // Only execute the heavy network request when 'Enter' is explicitly pressed
    if (e.key === 'Enter') {
        e.preventDefault(); // Prevent default form submission or page reload behavior

        const query = e.target.value.trim();

        if (query) {
            AppState.searchQuery = query;
            // Trigger the live API data fetch
            fetchLiveJobData(query);

            // Note: We intentionally DO NOT clear e.target.value (Query Retention)
            // This provides the user with a continuous visual anchor of their active search context.
        }
    }
});

// 2. Smart Auto-Reset Listener
DOM.searchInput.addEventListener('input', (e) => {
    // Detect if the user manually highlighted and deleted all text
    if (e.target.value === '') {
        // Reset the internal state
        AppState.searchQuery = '';

        // Smoothly fetch the default fallback parameters to restore the dashboard
        fetchLiveJobData('software engineer');
    }
});

// --- 12. Boot Up System ---
// Trigger initial API call to populate the dashboard with default developer roles
fetchLiveJobData("Software Developer");

