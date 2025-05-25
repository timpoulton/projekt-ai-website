// Portfolio Manager - Simple Modal System for Automation Showcases
// Handles clickable portfolio cards with animated workflow demonstrations

class PortfolioManager {
    constructor() {
        this.portfolioData = {};
        this.init();
    }

    init() {
        this.createModal();
        this.bindEvents();
        this.loadPortfolioData();
    }

    createModal() {
        const modal = document.createElement('div');
        modal.className = 'portfolio-modal';
        modal.id = 'portfolioModal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 id="modalTitle">Automation Showcase</h2>
                    <button class="modal-close" id="modalClose">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div id="modalDescription"></div>
                    <div class="workflow-animation" id="workflowAnimation">
                        <div class="workflow-steps" id="workflowSteps">
                            <!-- Workflow steps will be dynamically generated -->
                        </div>
                    </div>
                    <div class="download-section">
                        <h3>Get This Automation</h3>
                        <p>Download the complete blueprint and implementation guide</p>
                        <a href="#" class="download-btn" id="downloadBtn">
                            <i class="fas fa-download"></i>
                            Download Blueprint
                        </a>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    bindEvents() {
        // Close modal events
        document.getElementById('modalClose').addEventListener('click', () => this.closeModal());
        document.getElementById('portfolioModal').addEventListener('click', (e) => {
            if (e.target.id === 'portfolioModal') this.closeModal();
        });

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeModal();
        });

        // Portfolio card clicks
        this.bindPortfolioCards();
    }

    bindPortfolioCards() {
        const portfolioCards = document.querySelectorAll('#portfolio .card');
        portfolioCards.forEach((card, index) => {
            card.classList.add('portfolio-card');
            card.addEventListener('click', () => this.openModal(index));
        });
    }

    loadPortfolioData() {
        // Real portfolio data - only actual implemented automations
        this.portfolioData = {
            0: {
                title: "Club77 Content Pipeline",
                description: "Automated Instagram content creation and posting system for nightlife industry. Generates event promotions, manages guest lists, and tracks engagement metrics.",
                industry: "Nightlife Industry",
                results: "Increased social media efficiency by 400%",
                workflow: [
                    { icon: "fas fa-calendar", title: "Event Detection", desc: "Monitors event calendar" },
                    { icon: "fas fa-robot", title: "AI Content Gen", desc: "Creates promotional content" },
                    { icon: "fas fa-image", title: "Visual Design", desc: "Generates branded graphics" },
                    { icon: "fas fa-share", title: "Auto Posting", desc: "Publishes to Instagram" },
                    { icon: "fas fa-chart-line", title: "Analytics", desc: "Tracks engagement" }
                ],
                technologies: ["Make.com", "Instagram API", "AI Content"],
                blueprintUrl: "blueprints/club77-content-pipeline.json"
            },
            1: {
                title: "Club77 Blog Post Generator",
                description: "Automated content pipeline that takes news article links, rewrites them in Club77's tone, publishes to website, and creates social media content across multiple platforms.",
                industry: "Media/Entertainment Industry",
                results: "Reduced content creation time by 80%",
                workflow: [
                    { icon: "fas fa-link", title: "Article Input", desc: "Receives article URL via webhook" },
                    { icon: "fas fa-spider", title: "Content Extraction", desc: "Scrapes article with Apify" },
                    { icon: "fas fa-robot", title: "AI Rewriting", desc: "Rewrites in Club77 tone" },
                    { icon: "fas fa-globe", title: "Website Publishing", desc: "Publishes to Webflow CMS" },
                    { icon: "fas fa-share-alt", title: "Social Distribution", desc: "Posts to Instagram & Facebook" }
                ],
                technologies: ["Make.com", "OpenAI GPT-4", "Webflow", "Instagram API", "Creatomate"],
                blueprintUrl: "blueprints/club77-blog-post-generator.json"
            }
        };
    }

    openModal(cardIndex) {
        const data = this.portfolioData[cardIndex];
        if (!data) return;

        // Update modal content
        document.getElementById('modalTitle').textContent = data.title;
        document.getElementById('modalDescription').innerHTML = `
            <h3>${data.industry}</h3>
            <p>${data.description}</p>
            <div style="margin: 1rem 0; padding: 1rem; background: var(--bg-secondary); border-radius: var(--border-radius);">
                <strong>Results:</strong> ${data.results}
            </div>
        `;

        // Generate workflow animation
        this.generateWorkflowAnimation(data.workflow);

        // Update download button
        document.getElementById('downloadBtn').href = data.blueprintUrl;

        // Show modal
        document.getElementById('portfolioModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    generateWorkflowAnimation(workflow) {
        const container = document.getElementById('workflowSteps');
        container.innerHTML = '';

        workflow.forEach((step, index) => {
            const stepElement = document.createElement('div');
            stepElement.className = 'workflow-step';
            stepElement.innerHTML = `
                <i class="${step.icon}" style="font-size: 2rem; color: var(--accent-primary); margin-bottom: 0.5rem;"></i>
                <h4 style="margin-bottom: 0.5rem; font-size: 0.9rem;">${step.title}</h4>
                <p style="font-size: 0.8rem; color: var(--text-secondary);">${step.desc}</p>
            `;
            container.appendChild(stepElement);

            // Add arrow between steps (except last)
            if (index < workflow.length - 1) {
                const arrow = document.createElement('div');
                arrow.className = 'workflow-arrow';
                arrow.innerHTML = '<i class="fas fa-arrow-right"></i>';
                container.appendChild(arrow);
            }
        });
    }

    closeModal() {
        document.getElementById('portfolioModal').classList.remove('active');
        document.body.style.overflow = '';
    }

    // Method to add new portfolio items (for future use)
    addPortfolioItem(data) {
        const newIndex = Object.keys(this.portfolioData).length;
        this.portfolioData[newIndex] = data;
        this.bindPortfolioCards(); // Rebind events
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.portfolioManager = new PortfolioManager();
}); 