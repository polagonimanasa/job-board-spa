/**
 * script.js
 * 
 * Handles state management, dynamic DOM rendering, event delegation,
 * and live search filtering.
 */

// --- 1. System Mock Data ---
const jobsData = [
    {
        id: 1,
        // Requested Exact Details
        title: "Software Engineer",
        company: "TechCorp",
        location: "Hitech City, Hyderabad",
        shiftType: "Night Shift / Strictly Onsite",
        salary: "₹12L - ₹18L",
        postedTime: "2 hours ago",
        logoIcon: "ph-code",
        tags: ["Java", "Spring Boot", "React"],
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
        title: "Senior Frontend Developer",
        company: "Designify",
        location: "Remote",
        shiftType: "Flexible Shift",
        salary: "$90k - $120k",
        postedTime: "5 hours ago",
        logoIcon: "ph-paint-brush",
        tags: ["HTML", "CSS", "Vanilla JS"],
        description: "Join Designify as a Senior Frontend Developer where aesthetics meet performance. We value engineers who can build pixel-perfect interfaces without relying heavily on bulky frameworks. You'll architect design systems from the ground up.",
        requirements: [
            "5+ years of frontend architecture experience.",
            "Expertise in CSS layout engines (Grid/Flexbox) and raw JavaScript.",
            "Keen eye for UI/UX details, accessibility, and micro-animations.",
            "Experience collaborating closely with product designers."
        ]
    },
    {
        id: 3,
        title: "Backend Engineer",
        company: "CloudData Systems",
        location: "Bangalore, India",
        shiftType: "Day Shift",
        salary: "₹15L - ₹22L",
        postedTime: "1 day ago",
        logoIcon: "ph-database",
        tags: ["Node.js", "PostgreSQL", "AWS"],
        description: "CloudData Systems is seeking a Backend Engineer to optimize our data pipelines and API response times. You will architect robust solutions for high-volume transactions.",
        requirements: [
            "Deep knowledge of Node.js and asynchronous programming patterns.",
            "Experience designing RESTful APIs and GraphQL.",
            "Solid understanding of relational databases, indexing, and PostgreSQL.",
            "Familiarity with containerization and AWS cloud services."
        ]
    },
    {
        id: 4,
        title: "UI/UX Designer",
        company: "Creative Studio",
        location: "Remote",
        shiftType: "Flexible Shift",
        salary: "$70k - $95k",
        postedTime: "2 days ago",
        logoIcon: "ph-bezier-curve",
        tags: ["Figma", "Prototyping", "User Research"],
        description: "We need a visionary UI/UX designer to lead the revamp of our flagship product. You will work closely with frontend teams to ensure designs are perfectly translated into high-fidelity web experiences.",
        requirements: [
            "Strong portfolio demonstrating modern web and mobile design.",
            "Mastery of Figma, component libraries, and prototyping tools.",
            "Ability to conduct user research and execute usability testing.",
            "Basic understanding of HTML/CSS capabilities to ensure feasibility."
        ]
    }
];

// --- 2. DOM Node References ---
const jobCardsContainer = document.getElementById('job-cards-container');
const jobDetailSection = document.getElementById('job-detail-section');
const searchInput = document.getElementById('search-input');
const sidebar = document.getElementById('sidebar');
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');

// Application State
let activeJobId = null;

// --- 3. UI Rendering Engine ---

/**
 * Iterates through the data array and injects HTML for the job cards into the left pane.
 * Handles the "empty state" gracefully if the search yields no results.
 */
function renderJobs(jobs) {
    jobCardsContainer.innerHTML = '';

    if (jobs.length === 0) {
        jobCardsContainer.innerHTML = `
            <div style="text-align: center; color: var(--text-secondary); padding: 40px; border: 1px dashed var(--border-color); border-radius: var(--radius-md);">
                No jobs found matching your criteria.
            </div>`;
        return;
    }

    jobs.forEach(job => {
        const card = document.createElement('div');
        // Visually highlight the currently selected card
        card.className = `job-card ${job.id === activeJobId ? 'active' : ''}`;

        let tagsHtml = `<span class="tag tag-shift">${job.shiftType}</span>`;
        job.tags.forEach(tag => {
            tagsHtml += `<span class="tag tag-normal">${tag}</span>`;
        });

        card.innerHTML = `
            <div class="card-header">
                <div class="company-info">
                    <div class="company-logo">
                        <i class="ph ${job.logoIcon}"></i>
                    </div>
                    <div>
                        <h3 class="job-title">${job.title}</h3>
                        <p class="company-name">${job.company}</p>
                    </div>
                </div>
                <!-- Stop propagation so clicking save doesn't trigger the job card selection -->
                <button class="bookmark-btn" aria-label="Save Job" onclick="event.stopPropagation(); alert('Job saved to your profile!');">
                    <i class="ph ph-bookmark-simple"></i>
                </button>
            </div>
            <div class="card-tags">
                ${tagsHtml}
            </div>
            <div class="card-footer">
                <div class="card-footer-item">
                    <i class="ph ph-map-pin"></i> ${job.location}
                </div>
                <div class="card-footer-item">
                    <i class="ph ph-currency-circle-dollar"></i> ${job.salary}
                </div>
                <div class="card-footer-item">
                    <i class="ph ph-clock"></i> ${job.postedTime}
                </div>
            </div>
        `;

        card.addEventListener('click', () => selectJob(job.id));
        jobCardsContainer.appendChild(card);
    });
}

/**
 * Updates the right-hand split-screen panel with the full detailed view
 * of the clicked job. Replaces the empty state placeholder.
 */
function renderJobDetail(job) {
    const requirementsHtml = job.requirements.map(req => `<li>${req}</li>`).join('');

    jobDetailSection.innerHTML = `
        <div class="detail-content">
            <!-- Mobile Navigation (Only visible on small viewports) -->
            <button class="mobile-back-btn" onclick="closeMobileDetail()">
                <i class="ph ph-arrow-left"></i> Back to Jobs
            </button>

            <div class="detail-header-card">
                <div class="detail-company-logo">
                    <i class="ph ${job.logoIcon}"></i>
                </div>
                <h2 class="detail-title">${job.title}</h2>
                <p class="detail-company">${job.company}</p>
                
                <div class="detail-meta">
                    <div class="meta-item">
                        <i class="ph ph-map-pin"></i> ${job.location}
                    </div>
                    <div class="meta-item">
                        <i class="ph ph-briefcase"></i> ${job.shiftType}
                    </div>
                    <div class="meta-item">
                        <i class="ph ph-currency-circle-dollar"></i> ${job.salary}
                    </div>
                </div>

                <div class="detail-actions">
                    <button class="btn btn-primary" onclick="alert('Application process initiated for: ${job.title}\\nCompany: ${job.company}')">
                        Apply Now
                    </button>
                    <button class="btn btn-secondary" onclick="alert('Job added to saved list.')">
                        <i class="ph ph-bookmark-simple"></i> Save Job
                    </button>
                </div>
            </div>

            <div class="detail-body">
                <h3 class="section-title">Job Description</h3>
                <p class="detail-text">${job.description}</p>
                
                <h3 class="section-title">Requirements</h3>
                <ul class="requirements-list">
                    ${requirementsHtml}
                </ul>
            </div>
        </div>
    `;

    // On mobile view, sliding click-through to the detail panel
    if (window.innerWidth <= 768) {
        jobDetailSection.classList.add('active');
    }
}

// --- 4. Logic & Event Controllers ---

/**
 * Triggered when a card is clicked. Updates UI state and re-renders lists.
 */
function selectJob(id) {
    activeJobId = id;
    const selectedJob = jobsData.find(j => j.id === id);

    // Re-render list to ensure the current search filter isn't wiped out 
    // when we apply the '.active' CSS class to the newly selected card.
    const searchTerm = searchInput.value.toLowerCase();
    renderJobs(filterData(searchTerm));

    if (selectedJob) {
        renderJobDetail(selectedJob);
    }
}

// Global exposure for the dynamically injected mobile back button
window.closeMobileDetail = function () {
    jobDetailSection.classList.remove('active');
}

/**
 * Core filtering algorithm supporting partial matches across Titles, Companies, and Tags.
 */
function filterData(query) {
    if (!query) return jobsData;

    const q = query.toLowerCase();
    return jobsData.filter(job => {
        const titleMatch = job.title.toLowerCase().includes(q);
        const companyMatch = job.company.toLowerCase().includes(q);
        const tagsMatch = job.tags.some(tag => tag.toLowerCase().includes(q));

        return titleMatch || companyMatch || tagsMatch;
    });
}

// Attach Live Search Listener
searchInput.addEventListener('input', (e) => {
    const filteredJobs = filterData(e.target.value);
    renderJobs(filteredJobs);
});

// Mobile Hamburger Menu Toggles
mobileMenuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
});

// Collapse mobile sidebar when clicking outside of it
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
        const isClickInsideMenu = sidebar.contains(e.target) || mobileMenuToggle.contains(e.target);
        if (!isClickInsideMenu && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }
    }
});

// --- 5. Boot Up ---
// Initialize Dashboard with all default data
renderJobs(jobsData);
