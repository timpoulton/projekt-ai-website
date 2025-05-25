// Portfolio Manager - Dynamic Automation Showcase Integration
// This script manages the portfolio section and integrates with the AI showcase generator

class PortfolioManager {
    constructor() {
        this.portfolioContainer = null;
        this.showcases = [];
        this.init();
    }

    init() {
        console.log('🚀 Initializing Portfolio Manager...');
        
        // Find the portfolio container
        this.portfolioContainer = document.querySelector('#portfolio .services-grid');
        if (!this.portfolioContainer) {
            console.warn('❌ Portfolio container not found');
            return;
        }
        console.log('✅ Portfolio container found');

        // Load saved showcases from localStorage
        this.loadSavedShowcases();
        
        // Add management controls
        this.addManagementControls();
        
        console.log('✅ Portfolio Manager initialized successfully');
    }

    // Add a new automation showcase to the portfolio
    addShowcase(showcase) {
        const portfolioCard = this.generatePortfolioCard(showcase);
        
        // Add to the portfolio grid
        const cardElement = document.createElement('div');
        cardElement.innerHTML = portfolioCard;
        cardElement.className = 'portfolio-item';
        cardElement.dataset.showcaseId = showcase.id;
        
        // Insert before the last card (or at the end)
        this.portfolioContainer.appendChild(cardElement.firstElementChild);
        
        // Save to localStorage
        this.showcases.push(showcase);
        this.saveShowcases();
        
        // Animate in
        this.animateCardIn(cardElement.firstElementChild);
        
        return true;
    }

    // Generate portfolio card HTML that matches website style
    generatePortfolioCard(showcase) {
        const technologies = this.detectTechnologies(showcase);
        const techTags = technologies.map(tech => 
            `<span style="background: rgba(0,255,136,0.2); color: #00ff88; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.8rem; margin-right: 0.5rem;">${tech}</span>`
        ).join('');
        
        const metrics = showcase.metrics || {};
        
        return `
            <div class="card" data-showcase-id="${showcase.id}">
                <div class="service-icon">
                    <i class="${this.getIconForCategory(showcase.category)}"></i>
                </div>
                <h3>${this.cleanTitle(showcase.content.title)}</h3>
                <p><strong>${this.getCategoryDisplayName(showcase.category)}</strong><br>
                ${showcase.content.description}</p>
                <div class="automation-metrics" style="margin: 1rem 0; padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px;">
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; font-size: 0.85rem;">
                        <div>⏱️ Time Saved: <strong>${metrics.timeSaved || 0}%</strong></div>
                        <div>🎯 Accuracy: <strong>${metrics.accuracy || 0}%</strong></div>
                        <div>📊 Volume: <strong>${metrics.volume || 0}+</strong></div>
                        <div>💰 ROI: <strong>${metrics.roi || 0}%</strong></div>
                    </div>
                </div>
                <div style="margin-top: 1.5rem;">
                    ${techTags}
                </div>
                <div class="showcase-actions" style="margin-top: 1rem; display: flex; gap: 0.5rem; justify-content: flex-end;">
                    <button onclick="portfolioManager.editShowcase('${showcase.id}')" style="background: rgba(0,128,255,0.2); color: #0080ff; border: none; padding: 0.3rem 0.8rem; border-radius: 6px; font-size: 0.8rem; cursor: pointer;">Edit</button>
                    <button onclick="portfolioManager.removeShowcase('${showcase.id}')" style="background: rgba(255,0,128,0.2); color: #ff0080; border: none; padding: 0.3rem 0.8rem; border-radius: 6px; font-size: 0.8rem; cursor: pointer;">Remove</button>
                </div>
            </div>`;
    }

    // Clean title by removing emoji prefixes
    cleanTitle(title) {
        return title.replace(/^[🎯📊📧🛒📱⚡🔗📈]\s*/, '').trim();
    }

    // Detect technologies from showcase content
    detectTechnologies(showcase) {
        const description = (showcase.content.description + ' ' + (showcase.workflow || []).map(step => step.title + ' ' + step.description).join(' ')).toLowerCase();
        const technologies = [];
        
        // Automation platforms
        if (description.includes('make.com') || description.includes('make')) technologies.push('Make.com');
        if (description.includes('zapier')) technologies.push('Zapier');
        if (description.includes('n8n')) technologies.push('n8n');
        
        // AI services
        if (description.includes('openai') || description.includes('gpt') || description.includes('ai')) technologies.push('OpenAI');
        if (description.includes('claude')) technologies.push('Claude');
        
        // Social platforms
        if (description.includes('instagram')) technologies.push('Instagram API');
        if (description.includes('facebook')) technologies.push('Facebook');
        if (description.includes('twitter') || description.includes('x.com')) technologies.push('Twitter/X');
        if (description.includes('linkedin')) technologies.push('LinkedIn');
        
        // Business tools
        if (description.includes('google')) technologies.push('Google Workspace');
        if (description.includes('slack')) technologies.push('Slack');
        if (description.includes('notion')) technologies.push('Notion');
        if (description.includes('airtable')) technologies.push('Airtable');
        if (description.includes('shopify')) technologies.push('Shopify');
        if (description.includes('wordpress')) technologies.push('WordPress');
        
        // Development
        if (description.includes('webhook')) technologies.push('Webhooks');
        if (description.includes('api')) technologies.push('APIs');
        if (description.includes('python')) technologies.push('Python');
        
        return technologies.length > 0 ? technologies.slice(0, 3) : ['Automation', 'AI', 'Integration'];
    }

    // Get icon for category
    getIconForCategory(category) {
        const icons = {
            'content': 'fas fa-edit',
            'data': 'fas fa-database', 
            'communication': 'fas fa-comments',
            'ecommerce': 'fas fa-shopping-cart',
            'social': 'fas fa-share-alt',
            'productivity': 'fas fa-tasks',
            'integration': 'fas fa-plug',
            'analytics': 'fas fa-chart-line'
        };
        return icons[category] || 'fas fa-cogs';
    }

    // Get display name for category
    getCategoryDisplayName(category) {
        const names = {
            'content': 'Content Automation',
            'data': 'Data Processing',
            'communication': 'Communication',
            'ecommerce': 'E-commerce',
            'social': 'Social Media',
            'productivity': 'Productivity',
            'integration': 'System Integration',
            'analytics': 'Analytics'
        };
        return names[category] || 'Automation';
    }

    // Animate card entrance
    animateCardIn(cardElement) {
        cardElement.style.opacity = '0';
        cardElement.style.transform = 'translateY(20px)';
        cardElement.style.transition = 'all 0.6s ease';
        
        setTimeout(() => {
            cardElement.style.opacity = '1';
            cardElement.style.transform = 'translateY(0)';
        }, 100);
    }

    // Remove showcase from portfolio
    removeShowcase(showcaseId) {
        const cardElement = document.querySelector(`[data-showcase-id="${showcaseId}"]`);
        if (cardElement) {
            cardElement.style.transition = 'all 0.3s ease';
            cardElement.style.opacity = '0';
            cardElement.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                cardElement.remove();
            }, 300);
        }
        
        // Remove from array and save
        this.showcases = this.showcases.filter(s => s.id !== showcaseId);
        this.saveShowcases();
    }

    // Edit showcase (placeholder for future enhancement)
    editShowcase(showcaseId) {
        const showcase = this.showcases.find(s => s.id === showcaseId);
        if (showcase) {
            // For now, just show the showcase data
            console.log('Edit showcase:', showcase);
            alert('Edit functionality coming soon! For now, you can remove and recreate the showcase.');
        }
    }

    // Save showcases to localStorage
    saveShowcases() {
        localStorage.setItem('portfolio_showcases', JSON.stringify(this.showcases));
    }

    // Load showcases from localStorage
    loadSavedShowcases() {
        try {
            const saved = localStorage.getItem('portfolio_showcases');
            if (saved) {
                this.showcases = JSON.parse(saved);
                // Re-add saved showcases to the portfolio
                this.showcases.forEach(showcase => {
                    // Check if already exists in DOM
                    if (!document.querySelector(`[data-showcase-id="${showcase.id}"]`)) {
                        this.addShowcaseToDOM(showcase);
                    }
                });
            }
        } catch (error) {
            console.warn('Error loading saved showcases:', error);
        }
    }

    // Add showcase to DOM without saving (for loading saved ones)
    addShowcaseToDOM(showcase) {
        const portfolioCard = this.generatePortfolioCard(showcase);
        const cardElement = document.createElement('div');
        cardElement.innerHTML = portfolioCard;
        this.portfolioContainer.appendChild(cardElement.firstElementChild);
    }

    // Add management controls
    addManagementControls() {
        // Check if button already exists (either from HTML or previous JS execution)
        const existingButton = document.querySelector('a[href="automation-showcase-generator.html"]');
        if (existingButton) {
            console.log('✅ Automation showcase button already exists');
            return;
        }
        
        // Add a "Manage Portfolio" button to the portfolio section
        const portfolioSection = document.querySelector('#portfolio');
        if (portfolioSection) {
            const manageBtn = document.createElement('div');
            manageBtn.innerHTML = `
                <div style="text-align: center; margin-top: 2rem;">
                    <a href="automation-showcase-generator.html" class="btn btn-primary" style="display: inline-flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-plus"></i>
                        Add New Automation Showcase
                    </a>
                </div>
            `;
            portfolioSection.appendChild(manageBtn);
            console.log('✅ Added automation showcase button via JavaScript');
        } else {
            console.warn('❌ Portfolio section not found - cannot add button');
        }
    }

    // Export all showcases
    exportShowcases() {
        const data = {
            showcases: this.showcases,
            exported: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'portfolio-showcases.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Import showcases
    importShowcases(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.showcases && Array.isArray(data.showcases)) {
                    data.showcases.forEach(showcase => {
                        if (!this.showcases.find(s => s.id === showcase.id)) {
                            this.addShowcase(showcase);
                        }
                    });
                }
            } catch (error) {
                console.error('Error importing showcases:', error);
            }
        };
        reader.readAsText(file);
    }
}

// Initialize portfolio manager when DOM is loaded
let portfolioManager;
document.addEventListener('DOMContentLoaded', function() {
    portfolioManager = new PortfolioManager();
});

// Make it globally available for the showcase generator
window.portfolioManager = portfolioManager; 