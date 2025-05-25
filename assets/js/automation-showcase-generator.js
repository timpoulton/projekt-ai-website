// AI Automation Showcase Generator - Connected to Real API
document.addEventListener('DOMContentLoaded', function() {
    
    const form = document.getElementById('automation-form');
    const loadingSpinner = document.getElementById('loading-spinner');
    const workflowPreview = document.getElementById('workflow-preview');
    const generateBtn = document.querySelector('.generate-btn');
    
    // API Configuration
    const API_BASE_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:3000/api' 
        : 'https://automation-api.projekt-ai.net/api';
    
    // Store generated showcase data
    let currentShowcase = null;
    
    // Form submission handler
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('automation-name').value,
            category: document.getElementById('automation-category').value,
            description: document.getElementById('automation-description').value,
            blueprint: document.getElementById('automation-blueprint').value,
            audience: document.getElementById('target-audience').value
        };
        
        await generateShowcase(formData);
    });
    
    // Main showcase generation function - now connects to real API
    async function generateShowcase(data) {
        showLoading();
        
        try {
            console.log('🤖 Sending request to AI API...');
            
            const response = await fetch(`${API_BASE_URL}/generate-showcase`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to generate showcase');
            }
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'API returned unsuccessful response');
            }
            
            console.log('✅ AI showcase generated successfully!');
            
            // Display the AI-generated showcase
            displayShowcase(result.showcase);
            
            // Store for export
            currentShowcase = result.showcase;
            
        } catch (error) {
            console.error('❌ Error generating showcase:', error);
            
            // Fallback to local generation if API fails
            console.log('🔄 Falling back to local generation...');
            const fallbackShowcase = await generateFallbackShowcase(data);
            displayShowcase(fallbackShowcase);
            currentShowcase = fallbackShowcase;
            
            showNotification('API temporarily unavailable. Generated showcase using local fallback.', 'warning');
        } finally {
            hideLoading();
        }
    }
    
    // Fallback showcase generation (original logic)
    async function generateFallbackShowcase(data) {
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const showcase = {
            id: 'fallback-' + Date.now(),
            content: generateFallbackContent(data),
            workflow: generateFallbackWorkflowSteps(data),
            metrics: generateFallbackMetrics(data),
            timestamp: new Date().toISOString()
        };
        
        return showcase;
    }
    
    // Display the generated showcase (works with both API and fallback)
    function displayShowcase(showcase) {
        // Update title and description
        document.getElementById('preview-title').textContent = showcase.content.title;
        document.getElementById('preview-description').textContent = showcase.content.description;
        
        // Generate stats
        const statsContainer = document.getElementById('preview-stats');
        statsContainer.innerHTML = '';
        
        const statsToShow = [
            { label: 'Time Saved', value: `${showcase.metrics.timeSaved}%` },
            { label: 'Accuracy Rate', value: `${showcase.metrics.accuracy}%` },
            { label: 'Items Processed', value: `${showcase.metrics.volume}+` },
            { label: 'ROI Increase', value: `${showcase.metrics.roi}%` }
        ];
        
        statsToShow.forEach(stat => {
            const statCard = document.createElement('div');
            statCard.className = 'stat-card';
            statCard.innerHTML = `
                <span class="stat-value">${stat.value}</span>
                <div class="stat-label">${stat.label}</div>
            `;
            statsContainer.appendChild(statCard);
        });
        statsContainer.style.display = 'grid';
        
        // Generate workflow steps
        const stepsContainer = document.getElementById('preview-steps');
        stepsContainer.innerHTML = '';
        showcase.workflow.forEach((step, index) => {
            const stepElement = document.createElement('div');
            stepElement.className = 'workflow-step';
            stepElement.innerHTML = `
                <div class="step-number">${index + 1}</div>
                <div class="step-title">
                    <i class="${step.icon}"></i> ${step.title}
                </div>
                <div class="step-description">${step.description}</div>
            `;
            stepsContainer.appendChild(stepElement);
        });
        
        // Show export section
        document.getElementById('export-section').style.display = 'block';
        
        // Animate the preview
        workflowPreview.classList.add('visible');
    }
    
    // Loading state management
    function showLoading() {
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> AI is analyzing...';
        loadingSpinner.style.display = 'block';
        workflowPreview.classList.remove('visible');
    }
    
    function hideLoading() {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generate Showcase';
        loadingSpinner.style.display = 'none';
    }
    
    // Export functions - now connect to API endpoints
    window.exportToHTML = async function() {
        if (!currentShowcase) return;
        
        try {
            const response = await fetch(`${API_BASE_URL}/showcase/${currentShowcase.id}/export/html`);
            if (response.ok) {
                const blob = await response.blob();
                downloadBlob(blob, 'automation-showcase.html');
            } else {
                // Fallback to local generation
                const html = generateLocalHTMLExport(currentShowcase);
                downloadFile('automation-showcase.html', html, 'text/html');
            }
        } catch (error) {
            console.warn('API export failed, using local export:', error);
            const html = generateLocalHTMLExport(currentShowcase);
            downloadFile('automation-showcase.html', html, 'text/html');
        }
    };
    
    window.exportToJSON = async function() {
        if (!currentShowcase) return;
        
        try {
            const response = await fetch(`${API_BASE_URL}/showcase/${currentShowcase.id}/export/json`);
            if (response.ok) {
                const blob = await response.blob();
                downloadBlob(blob, 'automation-showcase.json');
            } else {
                // Fallback to local generation
                const json = JSON.stringify(currentShowcase, null, 2);
                downloadFile('automation-showcase.json', json, 'application/json');
            }
        } catch (error) {
            console.warn('API export failed, using local export:', error);
            const json = JSON.stringify(currentShowcase, null, 2);
            downloadFile('automation-showcase.json', json, 'application/json');
        }
    };
    
    window.addToWebsite = async function() {
        if (!currentShowcase) return;
        
        try {
            // Check if we're on the main website (has portfolio manager)
            if (window.parent && window.parent.portfolioManager) {
                // We're in an iframe or popup - use parent's portfolio manager
                const success = window.parent.portfolioManager.addShowcase(currentShowcase);
                if (success) {
                    showNotification('✅ Automation showcase added to your website portfolio!', 'success');
                    // Optionally close the generator window/iframe
                    setTimeout(() => {
                        if (window.parent !== window) {
                            window.parent.focus();
                        }
                    }, 2000);
                    return;
                }
            }
            
            // Check if portfolio manager is available in current window
            if (window.portfolioManager) {
                const success = window.portfolioManager.addShowcase(currentShowcase);
                if (success) {
                    showNotification('✅ Automation showcase added to your website portfolio!', 'success');
                    return;
                }
            }
            
            // Fallback: Generate downloadable HTML
            const portfolioCard = generatePortfolioCard(currentShowcase);
            showPortfolioPreview(portfolioCard);
            
            const htmlSnippet = `<!-- Add this to your portfolio section -->\n${portfolioCard}`;
            downloadFile('portfolio-card.html', htmlSnippet, 'text/html');
            
            showNotification('Portfolio card generated! Add the downloaded HTML to your website portfolio section.', 'success');
            
        } catch (error) {
            console.error('Error adding to website:', error);
            showNotification('Error adding to portfolio. Please try the download option.', 'error');
        }
    };
    
    // Generate portfolio card HTML that matches your website style
    function generatePortfolioCard(showcase) {
        const technologies = detectTechnologies(showcase);
        const techTags = technologies.map(tech => 
            `<span style="background: rgba(0,255,136,0.2); color: #00ff88; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.8rem; margin-right: 0.5rem;">${tech}</span>`
        ).join('');
        
        return `
                <div class="card">
                    <div class="service-icon">
                        <i class="${getIconForCategory(showcase.category)}"></i>
                    </div>
                    <h3>${showcase.content.title.replace(/🎯|📊|📧|🛒|📱|⚡|🔗|📈/g, '').trim()}</h3>
                    <p><strong>${getCategoryDisplayName(showcase.category)}</strong><br>
                    ${showcase.content.description}</p>
                    <div class="automation-metrics" style="margin: 1rem 0; padding: 1rem; background: rgba(255,255,255,0.05); border-radius: 8px;">
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; font-size: 0.85rem;">
                            <div>⏱️ Time Saved: <strong>${showcase.metrics.timeSaved}%</strong></div>
                            <div>🎯 Accuracy: <strong>${showcase.metrics.accuracy}%</strong></div>
                            <div>📊 Volume: <strong>${showcase.metrics.volume}+</strong></div>
                            <div>💰 ROI: <strong>${showcase.metrics.roi}%</strong></div>
                        </div>
                    </div>
                    <div style="margin-top: 1.5rem;">
                        ${techTags}
                    </div>
                </div>`;
    }
    
    // Detect technologies from the showcase
    function detectTechnologies(showcase) {
        const description = showcase.content.description.toLowerCase();
        const technologies = [];
        
        // Common automation platforms
        if (description.includes('make.com') || description.includes('make')) technologies.push('Make.com');
        if (description.includes('zapier')) technologies.push('Zapier');
        if (description.includes('n8n')) technologies.push('n8n');
        
        // AI/ML services
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
        if (description.includes('discord')) technologies.push('Discord');
        if (description.includes('notion')) technologies.push('Notion');
        if (description.includes('airtable')) technologies.push('Airtable');
        if (description.includes('shopify')) technologies.push('Shopify');
        if (description.includes('wordpress')) technologies.push('WordPress');
        
        // Development
        if (description.includes('webhook')) technologies.push('Webhooks');
        if (description.includes('api')) technologies.push('APIs');
        if (description.includes('python')) technologies.push('Python');
        if (description.includes('javascript')) technologies.push('JavaScript');
        
        return technologies.length > 0 ? technologies.slice(0, 3) : ['Automation', 'AI', 'Integration'];
    }
    
    // Get appropriate icon for category
    function getIconForCategory(category) {
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
    function getCategoryDisplayName(category) {
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
    
    // Show preview of portfolio card
    function showPortfolioPreview(cardHtml) {
        const preview = document.createElement('div');
        preview.className = 'portfolio-preview';
        preview.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 2rem;">
                <div style="background: var(--bg-card); border-radius: 12px; padding: 2rem; max-width: 600px; width: 100%; max-height: 80vh; overflow-y: auto;">
                    <h3 style="margin-bottom: 1rem; color: var(--text-primary);">Portfolio Card Preview</h3>
                    <div style="border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                        ${cardHtml}
                    </div>
                    <p style="color: var(--text-secondary); margin-bottom: 1rem;">This card will be downloaded as HTML. Add it to your website's portfolio section.</p>
                    <button onclick="this.closest('.portfolio-preview').remove()" style="background: var(--accent-gradient); color: var(--bg-primary); border: none; padding: 0.5rem 1rem; border-radius: 8px; cursor: pointer;">Close Preview</button>
                </div>
            </div>
        `;
        document.body.appendChild(preview);
    }
    
    window.generateBlueprint = async function() {
        if (!currentShowcase) return;
        
        try {
            const response = await fetch(`${API_BASE_URL}/showcase/${currentShowcase.id}/export/makeBlueprint`);
            if (response.ok) {
                const blob = await response.blob();
                downloadBlob(blob, 'make-blueprint.json');
            } else {
                // Fallback to local generation
                const blueprint = generateLocalMakeBlueprint(currentShowcase);
                downloadFile('make-blueprint.json', blueprint, 'application/json');
            }
        } catch (error) {
            console.warn('API export failed, using local export:', error);
            const blueprint = generateLocalMakeBlueprint(currentShowcase);
            downloadFile('make-blueprint.json', blueprint, 'application/json');
        }
    };
    
    // Utility functions
    function downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    function downloadFile(filename, content, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        downloadBlob(blob, filename);
    }
    
    // Notification system
    function showNotification(message, type = 'info') {
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
    
    // Fallback content generation functions (original logic preserved)
    function generateFallbackContent(data) {
        const categoryTitles = {
            'content': '🎯 AI-Powered Content Automation',
            'data': '📊 Intelligent Data Processing Pipeline',
            'communication': '📧 Smart Communication Workflow',
            'ecommerce': '🛒 E-commerce Automation Suite',
            'social': '📱 Social Media Automation Engine',
            'productivity': '⚡ Productivity Enhancement System',
            'integration': '🔗 Seamless System Integration',
            'analytics': '📈 Advanced Analytics Automation'
        };
        
        const audienceContext = {
            'small-business': 'small business owners looking to scale efficiently',
            'marketing': 'marketing teams seeking to optimize their campaigns',
            'ecommerce': 'e-commerce stores wanting to increase conversions',
            'content-creators': 'content creators aiming to streamline their workflow',
            'agencies': 'digital agencies managing multiple clients',
            'startups': 'startups needing to do more with less',
            'enterprise': 'enterprise organizations requiring scalable solutions',
            'developers': 'developers building automated systems'
        };
        
        const context = audienceContext[data.audience] || 'businesses';
        
        return {
            title: categoryTitles[data.category] || `🤖 ${data.name}`,
            description: `This intelligent automation is specifically designed for ${context}. ${data.description} By leveraging cutting-edge AI and seamless integrations, this workflow eliminates manual tasks, reduces errors, and delivers consistent results at scale.`
        };
    }
    
    function generateFallbackWorkflowSteps(data) {
        const steps = [];
        const description = data.description.toLowerCase();
        
        // Common automation patterns
        if (description.includes('trigger') || description.includes('webhook')) {
            steps.push({
                title: 'Smart Trigger Detection',
                description: 'Automatically detects when specific events occur and initiates the workflow instantly.',
                icon: 'fas fa-play-circle'
            });
        }
        
        if (description.includes('ai') || description.includes('gpt') || description.includes('openai')) {
            steps.push({
                title: 'AI Content Processing',
                description: 'Advanced AI analyzes and processes content using state-of-the-art language models.',
                icon: 'fas fa-brain'
            });
        }
        
        if (description.includes('email') || description.includes('notification')) {
            steps.push({
                title: 'Intelligent Notifications',
                description: 'Sends personalized notifications and updates to relevant stakeholders automatically.',
                icon: 'fas fa-envelope'
            });
        }
        
        if (description.includes('database') || description.includes('sheet') || description.includes('airtable')) {
            steps.push({
                title: 'Data Synchronization',
                description: 'Seamlessly syncs data across multiple platforms and maintains consistency.',
                icon: 'fas fa-sync'
            });
        }
        
        if (description.includes('social') || description.includes('instagram') || description.includes('facebook')) {
            steps.push({
                title: 'Multi-Platform Publishing',
                description: 'Automatically publishes content across multiple social media platforms.',
                icon: 'fas fa-share-alt'
            });
        }
        
        // Add generic steps if none detected
        if (steps.length === 0) {
            steps.push(
                {
                    title: 'Data Collection',
                    description: 'Automatically gathers data from specified sources and triggers.',
                    icon: 'fas fa-download'
                },
                {
                    title: 'Processing & Analysis',
                    description: 'Processes collected data using intelligent algorithms and rules.',
                    icon: 'fas fa-cogs'
                },
                {
                    title: 'Action Execution',
                    description: 'Executes predefined actions based on processed data and conditions.',
                    icon: 'fas fa-rocket'
                }
            );
        }
        
        return steps;
    }
    
    function generateFallbackMetrics(data) {
        const baseMetrics = {
            'content': { timeSaved: 85, accuracy: 99, volume: 500, roi: 400 },
            'data': { timeSaved: 90, accuracy: 99.9, volume: 10000, roi: 500 },
            'communication': { timeSaved: 75, accuracy: 98, volume: 1000, roi: 300 },
            'ecommerce': { timeSaved: 80, accuracy: 99, volume: 2000, roi: 450 },
            'social': { timeSaved: 95, accuracy: 97, volume: 100, roi: 350 },
            'productivity': { timeSaved: 70, accuracy: 99, volume: 50, roi: 250 },
            'integration': { timeSaved: 85, accuracy: 99.5, volume: 5000, roi: 400 },
            'analytics': { timeSaved: 90, accuracy: 99.8, volume: 1000000, roi: 600 }
        };
        
        return baseMetrics[data.category] || baseMetrics['productivity'];
    }
    
    // Local export generation functions
    function generateLocalHTMLExport(showcase) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${showcase.content.title}</title>
    <style>
        body { font-family: 'Inter', sans-serif; background: #0a0a0a; color: #ffffff; margin: 0; padding: 2rem; }
        .container { max-width: 1200px; margin: 0 auto; }
        .title { font-size: 2.5rem; font-weight: 800; text-align: center; margin-bottom: 1rem; background: linear-gradient(135deg, #00ff88, #ff0080); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .description { font-size: 1.2rem; color: #b0b0b0; text-align: center; margin-bottom: 3rem; line-height: 1.6; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 2rem 0; }
        .metric-card { background: #1a1a1a; padding: 1.5rem; border-radius: 12px; text-align: center; border: 1px solid rgba(255, 255, 255, 0.1); }
        .metric-value { font-size: 2rem; font-weight: 800; color: #00ff88; display: block; }
        .metric-label { color: #b0b0b0; margin-top: 0.5rem; }
        .workflow { display: grid; gap: 1rem; margin: 2rem 0; }
        .step { background: #1a1a1a; padding: 1.5rem; border-radius: 12px; position: relative; border: 1px solid rgba(255, 255, 255, 0.1); }
        .step-number { position: absolute; top: -10px; left: 1.5rem; background: linear-gradient(135deg, #00ff88, #ff0080); color: #0a0a0a; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; }
        .step-title { font-weight: 600; margin: 0.5rem 0; }
        .step-description { color: #b0b0b0; }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="title">${showcase.content.title}</h1>
        <p class="description">${showcase.content.description}</p>
        
        <div class="metrics">
            <div class="metric-card">
                <span class="metric-value">${showcase.metrics.timeSaved}%</span>
                <div class="metric-label">Time Saved</div>
            </div>
            <div class="metric-card">
                <span class="metric-value">${showcase.metrics.accuracy}%</span>
                <div class="metric-label">Accuracy Rate</div>
            </div>
            <div class="metric-card">
                <span class="metric-value">${showcase.metrics.volume}+</span>
                <div class="metric-label">Items Processed</div>
            </div>
            <div class="metric-card">
                <span class="metric-value">${showcase.metrics.roi}%</span>
                <div class="metric-label">ROI Increase</div>
            </div>
        </div>
        
        <div class="workflow">
            ${showcase.workflow.map((step, index) => `
                <div class="step">
                    <div class="step-number">${index + 1}</div>
                    <div class="step-title"><i class="${step.icon}"></i> ${step.title}</div>
                    <div class="step-description">${step.description}</div>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;
    }
    
    function generateLocalMakeBlueprint(showcase) {
        const blueprint = {
            name: showcase.content.title,
            description: showcase.content.description,
            version: "1.0.0",
            modules: showcase.workflow.map((step, index) => ({
                id: index + 1,
                module: step.title.replace(/[^a-zA-Z0-9]/g, '').toLowerCase(),
                version: 1,
                parameters: {},
                mapper: {},
                metadata: {
                    designer: {
                        x: 100 + (index * 200),
                        y: 100
                    }
                }
            })),
            metadata: {
                instant: false,
                version: 1,
                scenario: {
                    roundtrips: 1,
                    maxErrors: 3,
                    autoCommit: true,
                    autoCommitTriggerLast: true,
                    sequential: false,
                    confidential: false,
                    dataloss: false,
                    dlq: false
                },
                designer: {
                    orphans: []
                },
                zone: "us1.make.com"
            }
        };
        
        return JSON.stringify(blueprint, null, 2);
    }
    
    // Demo data for testing
    window.loadDemoData = function() {
        document.getElementById('automation-name').value = 'Club77 Content Pipeline';
        document.getElementById('automation-category').value = 'content';
        document.getElementById('automation-description').value = 'Automatically monitors RSS feeds for nightlife industry news, uses AI to generate engaging blog posts, publishes to WordPress, and shares on social media platforms. Includes SEO optimization and performance tracking.';
        document.getElementById('target-audience').value = 'small-business';
    };
    
    // Add demo button for testing
    const demoBtn = document.createElement('button');
    demoBtn.textContent = '🎯 Load Demo Data';
    demoBtn.className = 'export-btn';
    demoBtn.style.marginBottom = '1rem';
    demoBtn.onclick = window.loadDemoData;
    form.insertBefore(demoBtn, form.firstChild);
    
    // API Health Check on page load
    checkAPIHealth();
    
    async function checkAPIHealth() {
        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            if (response.ok) {
                const health = await response.json();
                console.log('✅ API is healthy:', health);
                
                if (!health.services.openai) {
                    showNotification('OpenAI integration not configured. Some features may be limited.', 'warning');
                }
            }
        } catch (error) {
            console.warn('⚠️ API health check failed:', error);
            showNotification('API connection issues detected. Fallback mode enabled.', 'warning');
        }
    }
}); 