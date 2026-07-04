/**
 * script.js
 * Comprehensive SPA Logic: Routing, Filtering, Auth, and Interactivity.
 */

// --- 1. Global Application State ---
const AppState = {
    isLoggedIn: false,
    currentUser: null,
    currentView: 'dashboard',
    activeJobId: null,
    currentFilterTag: 'All',
    searchQuery: '',
    savedJobs: [], // Array of job IDs
    appliedJobs: [] // Array of job IDs
};

// --- 2. Expanded Mock Database ---
const jobsData = [
    {
        id: 1,
        title: "Software Engineer",
        company: "TechCorp",
        location: "Hitech City, Hyderabad",
        shiftType: "Night Shift / Strictly Onsite",
        salary: "₹12L - ₹18L",
        postedTime: "2 hours ago",
        logoIcon: "ph-code",
        tags: ["Java", "Spring Boot", "React", "Fullstack"],
        description: "We are looking for a highly skilled Software Engineer to join our core engineering team in Hyderabad. You will be responsible for building scalable web applications and microservices. This is a highly collaborative role requiring strict onsite presence during the night shift to align with our US-based clients.",
        requirements: [
            "Minimum 3+ years of experience in full-stack development.",
            "Proficiency in Java, Spring Boot, and modern JavaScript frameworks (React).",
            "Strong understanding of CSS Grid, Flexbox, and vanilla web technologies.",
            "Willingness to work Night Shift exclusively.",
            "Must be able to commute to Hitech City, Hyderabad daily."
        ]
    },
    {
        id: 2,
        title: "Senior Python Backend Engineer",
        company: "DataSync Solutions",
        location: "Remote",
        shiftType: "Flexible Shift",
        salary: "$110k - $140k",
        postedTime: "5 hours ago",
        logoIcon: "ph-terminal-window",
        tags: ["Python", "Django", "PostgreSQL", "Backend", "Remote"],
        description: "DataSync is searching for a Senior Python developer to architect high-throughput data processing pipelines. You will lead the migration of our legacy systems to a modern Django/DRF microservice architecture.",
        requirements: [
            "6+ years of Python engineering experience.",
            "Expertise in Django, FastAPI, and ORM optimizations.",
            "Experience with message brokers like Kafka or RabbitMQ.",
            "Strong knowledge of PostgreSQL and complex query design."
        ]
    },
    {
        id: 3,
        title: "Senior Frontend Developer",
        company: "Designify",
        location: "Remote",
        shiftType: "Flexible Shift",
        salary: "$90k - $120k",
        postedTime: "1 day ago",
        logoIcon: "ph-paint-brush",
        tags: ["HTML", "CSS", "Vanilla JS", "Frontend", "Remote"],
        description: "Join Designify as a Senior Frontend Developer where aesthetics meet performance. We value engineers who can build pixel-perfect interfaces without relying heavily on bulky frameworks.",
        requirements: [
            "5+ years of frontend architecture experience.",
            "Expertise in CSS layout engines (Grid/Flexbox) and raw JavaScript.",
            "Keen eye for UI/UX details, accessibility, and micro-animations."
        ]
    },
    {
        id: 4,
        title: "Machine Learning Engineer (Python)",
        company: "AI Innovations",
        location: "Bangalore, India",
        shiftType: "Day Shift",
        salary: "₹20L - ₹35L",
        postedTime: "2 days ago",
        logoIcon: "ph-brain",
        tags: ["Python", "PyTorch", "TensorFlow", "Backend"],
        description: "Push the boundaries of NLP and Computer Vision. You will implement cutting-edge models into our production environment serving millions of requests daily.",
        requirements: [
            "Deep expertise in Python and ML libraries (PyTorch, TensorFlow).",
            "Experience deploying models to AWS Sagemaker or Kubernetes.",
            "Strong mathematical foundation and algorithmic thinking."
        ]
    },
    {
        id: 5,
        title: "Fullstack Web Developer",
        company: "StartupInc",
        location: "Pune, India",
        shiftType: "Hybrid",
        salary: "₹10L - ₹15L",
        postedTime: "3 days ago",
        logoIcon: "ph-rocket-launch",
        tags: ["Vue.js", "Node.js", "Fullstack"],
        description: "Fast-paced startup looking for a jack-of-all-trades. You will touch every part of our stack, from writing Vue components to deploying Node microservices.",
        requirements: [
            "Experience with reactive frameworks (Vue/React).",
            "Proficiency in Node.js and Express.",
            "Comfortable in a fast-paced, ambiguous environment."
        ]
    },
    {
        id: 6,
        title: "UI/UX Product Designer",
        company: "Creative Studio",
        location: "Remote",
        shiftType: "Flexible Shift",
        salary: "$70k - $95k",
        postedTime: "4 days ago",
        logoIcon: "ph-bezier-curve",
        tags: ["Figma", "Prototyping", "Remote"],
        description: "We need a visionary UI/UX designer to lead the revamp of our flagship product. You will work closely with frontend teams to ensure designs are perfectly translated into code.",
        requirements: [
            "Strong portfolio demonstrating modern web design.",
            "Mastery of Figma and prototyping tools.",
            "Basic understanding of HTML/CSS capabilities."
        ]
    }
];

// --- 3. DOM References ---
const DOM = {
    // Views
    spaViews: document.querySelectorAll('.spa-view'),
    navLinks: document.querySelectorAll('.nav-link'),
    feedTitle: document.getElementById('feed-title'),
    feedSubtitle: document.getElementById('feed-subtitle'),

    // Containers
    jobCardsContainer: document.getElementById('job-cards-container'),
    jobDetailSection: document.getElementById('job-detail-section'),
    applicationsContainer: document.getElementById('applications-container'),
    profileContainer: document.getElementById('profile-container'),

    // Controls
    searchInput: document.getElementById('search-input'),
    filterPills: document.querySelectorAll('.filter-tag'),
    searchContainer: document.getElementById('global-search-container'),

    // Auth & Header
    authModal: document.getElementById('auth-modal'),
    closeModalBtn: document.getElementById('close-modal-btn'),
    authForm: document.getElementById('auth-form'),
    headerAuthBtn: document.getElementById('header-auth-btn'),
    headerAvatar: document.getElementById('header-avatar'),

    // Mobile
    sidebar: document.getElementById('sidebar'),
    mobileToggle: document.getElementById('mobile-menu-toggle')
};

// --- 4. Core Routing & View Management ---

function switchView(viewName) {
    AppState.currentView = viewName;

    // Update Sidebar Active State
    DOM.navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.target === viewName ||
            (viewName === 'saved' && link.dataset.target === 'saved') ||
            (viewName === 'dashboard' && link.dataset.target === 'dashboard')) {
            // Find the specific link that triggered this (handling multiple links to dashboard)
        }
    });

    // Exact match highlighting
    const targetLink = Array.from(DOM.navLinks).find(l => l.dataset.target === viewName);
    if (targetLink) {
        DOM.navLinks.forEach(l => l.classList.remove('active'));
        targetLink.classList.add('active');
    }

    // Hide all views, show target view
    DOM.spaViews.forEach(view => view.classList.remove('active-view'));

    // Handle view-specific logic
    switch (viewName) {
        case 'dashboard':
            document.getElementById('view-dashboard').classList.add('active-view');
            DOM.feedTitle.textContent = "Find your dream job";
            DOM.feedSubtitle.textContent = "Explore the latest opportunities";
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
            renderJobFeed(true); // pass true to render only saved jobs
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

    // Close mobile menu if open
    if (window.innerWidth <= 768) {
        DOM.sidebar.classList.remove('open');
    }
}

// Attach Router Listeners
DOM.navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        switchView(link.dataset.target);
    });
});

// --- 5. Data Filtering Engine ---

function getFilteredJobs(onlySaved = false) {
    let result = jobsData;

    // 1. Filter by Saved State (if in Saved View)
    if (onlySaved) {
        result = result.filter(job => AppState.savedJobs.includes(job.id));
        return result; // Skip text/pill filters for saved view
    }

    // 2. Filter by Category Pill
    if (AppState.currentFilterTag !== 'All') {
        result = result.filter(job => job.tags.includes(AppState.currentFilterTag));
    }

    // 3. Filter by Search Text
    if (AppState.searchQuery) {
        const q = AppState.searchQuery.toLowerCase();
        result = result.filter(job => {
            const titleMatch = job.title.toLowerCase().includes(q);
            const compMatch = job.company.toLowerCase().includes(q);
            const tagMatch = job.tags.some(t => t.toLowerCase().includes(q));
            return titleMatch || compMatch || tagMatch;
        });
    }

    return result;
}

// Search Input Listener
DOM.searchInput.addEventListener('input', (e) => {
    AppState.searchQuery = e.target.value;
    if (AppState.currentView === 'dashboard') renderJobFeed();
});

// Category Pills Listener
DOM.filterPills.forEach(pill => {
    pill.addEventListener('click', (e) => {
        DOM.filterPills.forEach(p => p.classList.remove('active'));
        e.target.classList.add('active');
        AppState.currentFilterTag = e.target.dataset.tag;
        renderJobFeed();
    });
});

// --- 6. Rendering Logic ---

function renderJobFeed(onlySaved = false) {
    const jobs = getFilteredJobs(onlySaved);
    DOM.jobCardsContainer.innerHTML = '';

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
                <button class="bookmark-btn ${isSaved ? 'saved' : ''}" aria-label="Save Job" onclick="event.stopPropagation(); toggleSaveJob(${job.id});">
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
    const job = jobsData.find(j => j.id === id);

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
                    <button id="apply-btn-${job.id}" class="btn ${hasApplied ? 'btn-applied' : 'btn-primary'}" onclick="handleApply(${job.id})" ${hasApplied ? 'disabled' : ''}>
                        ${hasApplied ? '<i class="ph ph-check-circle"></i> Applied' : 'Apply Now'}
                    </button>
                    <button id="save-btn-${job.id}" class="btn btn-secondary ${isSaved ? 'btn-saved' : ''}" onclick="toggleSaveJob(${job.id}, true)">
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

window.closeMobileDetail = function () {
    DOM.jobDetailSection.classList.remove('active');
}

// --- 7. Applications & Profile Views ---

function renderApplicationsHistory() {
    DOM.applicationsContainer.innerHTML = '';

    if (AppState.appliedJobs.length === 0) {
        DOM.applicationsContainer.innerHTML = `
            <div style="color: var(--text-secondary); text-align: center; padding: 40px; border: 1px dashed var(--border-color); border-radius: var(--radius-md);">
                You haven't applied to any jobs yet.
            </div>`;
        return;
    }

    const appliedData = jobsData.filter(j => AppState.appliedJobs.includes(j.id));

    appliedData.forEach(job => {
        const card = document.createElement('div');
        card.className = 'history-card';
        card.innerHTML = `
            <div>
                <h3 style="margin-bottom: 4px;">${job.title}</h3>
                <p style="color: var(--text-secondary); font-size: 14px;">${job.company} • Applied recently</p>
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
                <p style="color: var(--text-secondary);">Senior Developer • Active seeking</p>
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

// --- 8. User Actions (Save & Apply) ---

window.toggleSaveJob = function (jobId, fromDetailView = false) {
    const idx = AppState.savedJobs.indexOf(jobId);
    if (idx > -1) {
        AppState.savedJobs.splice(idx, 1); // Remove
    } else {
        AppState.savedJobs.push(jobId); // Add
    }

    // Refresh UI based on current view
    if (AppState.currentView === 'dashboard' || AppState.currentView === 'saved') {
        renderJobFeed(AppState.currentView === 'saved');
    }

    if (fromDetailView && AppState.activeJobId === jobId) {
        // Soft update detail panel button to avoid full re-render jump
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
        // Soft update button
        const btn = document.getElementById(`apply-btn-${jobId}`);
        if (btn) {
            btn.className = 'btn btn-applied';
            btn.disabled = true;
            btn.innerHTML = `<i class="ph ph-check-circle"></i> Applied`;
        }
    }
}

// --- 9. Authentication Modal System ---

function openAuthModal() { DOM.authModal.classList.add('open'); }
function closeAuthModal() { DOM.authModal.classList.remove('open'); }

DOM.headerAuthBtn.addEventListener('click', () => {
    if (AppState.isLoggedIn) {
        // Logout logic
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

    // Login Success State Change
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

// Mobile Sidebar Toggle
DOM.mobileToggle.addEventListener('click', () => DOM.sidebar.classList.toggle('open'));

// --- 10. Initialization ---
renderJobFeed();
