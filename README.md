# Job Board Dashboard SPA

An immersive, high-performance Job Board Dashboard built entirely with Vanilla web technologies. Designed for speed, aesthetic excellence, and robust data handling, this Single Page Application (SPA) integrates with a live global Job API to fetch real-time opportunities.

## 📌 Project Overview & Context

This project was engineered specifically as an **Onsite Night Shift Software Engineer Dashboard**, heavily optimized to feature and filter highly specific technical roles (e.g., Software Engineers in Hitech City, Hyderabad working night shifts). 

The dashboard provides a seamless, app-like experience without the overhead of heavy frameworks like React or Angular. By relying on native browser capabilities, it demonstrates a deep understanding of core web fundamentals, state management, and modern UI/UX design paradigms.

## 🏗️ Architecture & Tech Stack

The application is built on a strict "No Framework" methodology, utilizing:

*   **Semantic HTML5:** Clean, accessible markup structured for screen readers and SEO optimization.
*   **Modern CSS3:** 
    *   **CSS Grid & Flexbox:** Powers the master layout, specifically the fluid dual-pane dashboard view and the off-canvas mobile sidebar.
    *   **Dark-Mode UI:** A curated palette of deep grays (`#121212`, `#1e1e1e`) paired with vibrant electric blue (`#2563eb`) accents for high contrast and premium aesthetics.
    *   **Micro-interactions:** Smooth `0.15s` transitions and CSS-driven modal overlays for a polished tactile feel.
*   **Modular ES6+ JavaScript:** 
    *   **Async/Await API Pipeline:** Robust asynchronous data fetching wrapped in strict `try/catch` boundaries.
    *   **State Management:** A centralized `AppState` object globally tracks user authentication, search queries, active tags, and saved/applied job arrays.

## ✨ Core Feature Breakdown

### 1. Single Page Application (SPA) Routing
A custom vanilla JS routing engine handles multi-view interactivity without page reloads. The DOM dynamically swaps between the main Dashboard feed, the user's Application History, their Saved Jobs, and their Profile overview based on data attributes mapped to the sidebar navigation.

### 2. Intent-Driven Live Search & Filtering
The search pipeline is highly optimized to protect API rate limits:
*   **Enter-to-Submit Mechanics:** The global search bar utilizes a strict `keydown` listener, firing heavy network requests *only* when the user explicitly presses 'Enter'.
*   **Instant Stage Clear:** Upon execution, the search bar instantly clears to provide a clean slate for the user.
*   **Smart Auto-Reset:** If a user manually deletes text to empty the input, the application detects this and automatically triggers a reset fetch to seamlessly restore the default job listings.
*   **Category Pills:** Interactive UI tags (e.g., Frontend, Python, Remote) that cross-filter the active fetched data array instantly without triggering redundant network calls.

### 3. Active State Tracking (Save & Apply)
User interactions are tracked in real-time. Clicking "Save Job" instantly updates the global `savedJobs` array and visually toggles the UI button state. Clicking "Apply Now" triggers an authentication check before pushing the job into the `appliedJobs` history ledger.

### 4. Global Authentication Modal Wrapper
A beautiful, center-aligned CSS modal overlay intercepts sensitive user actions (like applying for a job). It safely tracks a mock `isLoggedIn` boolean state, updates the global profile, and seamlessly alters header UI elements (e.g., swapping "Login" for an avatar and a "Sign Out" button).

### 5. API Fallback Generator
To ensure the UI never breaks, the asynchronous data pipeline includes an intelligent fallback mock generator. If network connectivity drops or API keys are missing/invalid, the `catch` block automatically synthesizes a realistic, 2-card fallback response matching the user's exact searched keyword on the fly.

## 🤖 AI Methodology

This dashboard was rapidly constructed and iterated upon using advanced **Prompt Engineering**. By defining strict architectural boundaries (e.g., "Vanilla JS only", "No Tailwind") and specific behavioral requirements (e.g., "Intent-driven Enter Trigger"), AI was leveraged to generate production-ready boilerplate, optimize algorithmic filtering logic, and synthesize a cohesive CSS design system. This approach allowed for rapid prototyping while maintaining exact engineering standards.
