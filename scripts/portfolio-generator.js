#!/usr/bin/env node

/**
 * PROJEKT AI - Portfolio Generation System
 * Generates portfolio pages from configuration data
 * Long-term solution for scalable portfolio management
 */

const fs = require('fs');
const path = require('path');

class PortfolioGenerator {
    constructor() {
        this.configPath = './portfolio-config.json';
        this.templatesDir = './templates';
        this.outputDir = './';
        this.config = null;
        
        this.loadConfig();
    }

    loadConfig() {
        try {
            const configData = fs.readFileSync(this.configPath, 'utf8');
            this.config = JSON.parse(configData);
            console.log('✅ Portfolio configuration loaded');
        } catch (error) {
            console.error('❌ Failed to load portfolio configuration:', error.message);
            process.exit(1);
        }
    }

    generatePortfolioPage(project) {
        console.log(`🎨 Generating portfolio page: ${project.title}`);
        
        const template = this.loadTemplate(this.config.global_settings.theme);
        const html = this.populateTemplate(template, project);
        const filename = `${project.id.replace(/_/g, '-')}.html`;
        
        fs.writeFileSync(path.join(this.outputDir, filename), html);
        console.log(`✅ Generated: ${filename}`);
        
        return filename;
    }

    loadTemplate(theme) {
        const templateConfig = this.config.portfolio_templates[`${theme}_theme_v1`];
        if (!templateConfig) {
            throw new Error(`Template not found for theme: ${theme}`);
        }

        return this.getDefaultTemplate(); // For now, return embedded template
    }

    populateTemplate(template, project) {
        const globalSettings = this.config.global_settings;
        
        // Replace template variables
        let html = template
            .replace(/{{TITLE}}/g, project.title)
            .replace(/{{CLIENT}}/g, project.client)
            .replace(/{{DESCRIPTION}}/g, project.description)
            .replace(/{{CHALLENGE}}/g, project.challenge)
            .replace(/{{APPROACH}}/g, project.approach)
            .replace(/{{HEADER_IMAGE}}/g, project.header_image)
            .replace(/{{LIVE_URL}}/g, project.live_url || '#')
            .replace(/{{PRIMARY_COLOR}}/g, globalSettings.brand_colors.primary)
            .replace(/{{BACKGROUND_COLOR}}/g, globalSettings.brand_colors.background)
            .replace(/{{TEXT_PRIMARY}}/g, globalSettings.brand_colors.text_primary)
            .replace(/{{TEXT_SECONDARY}}/g, globalSettings.brand_colors.text_secondary);

        // Generate services list
        const servicesList = project.services.map(service => `<li>${service}</li>`).join('\n                        ');
        html = html.replace(/{{SERVICES_LIST}}/g, servicesList);

        // Generate process steps
        const processSteps = (project.process_steps || []).map(step => `
            <div class="process-item">
                <div class="process-number">${step.number}</div>
                <h4>${step.title}</h4>
                <p>${step.description}</p>
            </div>`).join('\n            ');
        html = html.replace(/{{PROCESS_STEPS}}/g, processSteps);

        // Generate highlights
        const highlights = (project.highlights || []).map(highlight => `
            <div class="highlight-item">
                <div class="highlight-content">
                    <h3>${highlight.title}</h3>
                    <p>${highlight.description}</p>
                </div>
            </div>`).join('\n            ');
        html = html.replace(/{{HIGHLIGHTS}}/g, highlights);

        // Add SEO meta tags
        html = this.addSEOTags(html, project);

        return html;
    }

    addSEOTags(html, project) {
        const seoTags = `
    <meta name="description" content="${project.description}">
    <meta name="keywords" content="${project.technologies.join(', ')}, ${this.config.seo.default_meta.keywords}">
    <meta name="author" content="${this.config.seo.default_meta.author}">
    
    <!-- Open Graph -->
    <meta property="og:title" content="${project.title} - Projekt AI">
    <meta property="og:description" content="${project.description}">
    <meta property="og:image" content="${this.config.portfolio_system.base_url}/${project.header_image}">
    <meta property="og:url" content="${this.config.portfolio_system.base_url}${project.portfolio_url}">
    <meta property="og:type" content="website">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${project.title} - Projekt AI">
    <meta name="twitter:description" content="${project.description}">
    <meta name="twitter:image" content="${this.config.portfolio_system.base_url}/${project.header_image}">`;

        return html.replace('</head>', `    ${seoTags}\n</head>`);
    }

    updateMainPagePortfolio() {
        console.log('🔄 Updating main page portfolio section...');
        
        const indexPath = './index.html';
        let indexHtml = fs.readFileSync(indexPath, 'utf8');
        
        // Generate portfolio cards for main page
        const portfolioCards = this.config.portfolio_projects
            .filter(project => project.status === 'live')
            .map(project => {
                const cardClass = project.card_size === 'large' ? 'project-card large' : 'project-card';
                const backgroundStyle = project.header_image ? 
                    `style="background-image: linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url('${project.header_image}'); background-size: cover; background-position: center;"` : '';
                
                return `
            <a href="${project.portfolio_url}" class="${cardClass}" ${backgroundStyle}>
                <div class="project-overlay">
                    <h3>${project.title}</h3>
                    <p>${project.short_description}</p>
                </div>
            </a>`;
            }).join('\n            ');

        /*
         * Replace ONLY the contents of the .projects-grid element.
         * The previous greedy regex grabbed everything up to the LAST </div>,
         * wiping out the Contact section, footer, and scripts that followed.
         *
         * We now capture lazily up to the grid's own closing tag but preserve the
         * following markup by using a capture group for the first tag that comes
         * right after the grid (usually <script> or the Contact section).
         */
        const portfolioGridRegex = /<div class="projects-grid">[\s\S]*?<\/div>(?=\s*<section id=\"contact\")/;

        const newPortfolioGrid = `<div class=\"projects-grid\">\n            ${portfolioCards}\n        </div>`;

        indexHtml = indexHtml.replace(portfolioGridRegex, `${newPortfolioGrid}`);
        
        fs.writeFileSync(indexPath, indexHtml);
        console.log('✅ Main page updated with portfolio links');
    }

    generateAll() {
        console.log('🚀 Starting Portfolio Generation System...');
        console.log(`📊 Found ${this.config.portfolio_projects.length} portfolio project(s)`);
        
        const generatedFiles = [];
        
        // Generate individual portfolio pages
        this.config.portfolio_projects.forEach(project => {
            if (project.status === 'live') {
                const filename = this.generatePortfolioPage(project);
                generatedFiles.push(filename);
            }
        });

        // Update main page with portfolio links
        this.updateMainPagePortfolio();

        // Generate deployment commands
        this.generateDeploymentScript(generatedFiles);

        console.log('\n✅ Portfolio Generation Complete!');
        console.log('📁 Generated files:', generatedFiles);
        console.log('🚀 Run ./scripts/deploy-portfolio.sh to deploy to live site');
    }

    generateDeploymentScript(files) {
        const deployScript = `#!/bin/bash

# AUTOMATED PORTFOLIO DEPLOYMENT SCRIPT
# Generated by Portfolio Generation System

echo "🚀 Deploying Projekt AI Portfolio..."

# Add generated files to git
${files.map(file => `git add ${file}`).join('\n')}
git add index.html
git add portfolio-config.json

# Commit with timestamp
git commit -m "Portfolio update: $(date '+%Y-%m-%d %H:%M:%S')

- Updated portfolio projects
- Generated from portfolio-config.json
- Automated deployment system"

# Deploy to live site
git push

echo "✅ Portfolio deployed to: ${this.config.portfolio_system.base_url}"
echo "📋 Portfolio pages:"
${files.map(file => `echo "   - ${this.config.portfolio_system.base_url}/${file}"`).join('\n')}
`;

        fs.writeFileSync('./scripts/deploy-portfolio.sh', deployScript);
        fs.chmodSync('./scripts/deploy-portfolio.sh', '755');
        console.log('✅ Deployment script generated: ./scripts/deploy-portfolio.sh');
    }

    getDefaultTemplate() {
        // Load the default template from the dedicated template directory so it is found during Netlify builds
        return fs.readFileSync(path.join(__dirname, '..', 'case-study-generator', 'case-study-club77-content-pipeline.html'), 'utf8')
            .replace(/Club77 Content Pipeline/g, '{{TITLE}}')
            .replace(/Club77 Adelaide/g, '{{CLIENT}}')
            .replace(/AI-powered blog post generation and automated social media content creation system that transforms how Adelaide's premier nightlife venue engages with their audience\./g, '{{DESCRIPTION}}')
            // ... more template replacements would go here
            ;
    }
}

// CLI Interface
if (require.main === module) {
    const generator = new PortfolioGenerator();
    
    const command = process.argv[2];
    
    switch (command) {
        case 'generate':
            generator.generateAll();
            break;
        case 'update-main':
            generator.updateMainPagePortfolio();
            break;
        case 'deploy':
            generator.generateAll();
            // Run deployment script
            require('child_process').exec('./scripts/deploy-portfolio.sh', (error, stdout, stderr) => {
                if (error) {
                    console.error('❌ Deployment failed:', error);
                    return;
                }
                console.log(stdout);
            });
            break;
        default:
            console.log(`
📋 Portfolio Generation System Commands:

node scripts/portfolio-generator.js generate     # Generate all portfolio pages
node scripts/portfolio-generator.js update-main # Update main page links only  
node scripts/portfolio-generator.js deploy      # Generate + deploy to live site

🎯 Long-term Solution Features:
- ✅ Configuration-driven portfolio management
- ✅ Automated page generation from templates
- ✅ SEO optimization and meta tags
- ✅ Consistent branding and styling
- ✅ Deployment automation
- ✅ Scalable for unlimited projects
            `);
    }
}

module.exports = PortfolioGenerator; 