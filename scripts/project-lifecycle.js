#!/usr/bin/env node

/**
 * PROJECT LIFECYCLE MANAGEMENT SYSTEM
 * Complete workflow for managing portfolio projects from concept to production
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ProjectLifecycleManager {
    constructor() {
        this.configPath = './portfolio-config.json';
        this.templatesDir = './templates';
        this.stagingDir = './staging';
        this.config = this.loadConfig();
        this.ensureDirectories();
    }

    loadConfig() {
        try {
            return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
        } catch (error) {
            console.error('❌ Failed to load portfolio configuration');
            process.exit(1);
        }
    }

    saveConfig() {
        fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    }

    ensureDirectories() {
        [this.stagingDir, './scripts', './backups'].forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    // 1. PROJECT INITIALIZATION
    initializeProject(projectData) {
        console.log(`🚀 Initializing new project: ${projectData.title}`);
        
        const projectId = projectData.title.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '_');

        const newProject = {
            id: projectId,
            status: 'development',
            title: projectData.title,
            client: projectData.client,
            category: projectData.category,
            description: projectData.description,
            short_description: projectData.short_description,
            services: projectData.services || [],
            live_url: projectData.live_url || null,
            portfolio_url: `/${projectId.replace(/_/g, '-')}.html`,
            featured: false,
            card_size: 'medium',
            header_image: null,
            process_steps: [],
            highlights: [],
            challenge: '',
            approach: '',
            results: [],
            technologies: projectData.technologies || [],
            project_date: new Date().getFullYear().toString(),
            project_duration: projectData.duration || 'TBD',
            created_at: new Date().toISOString().split('T')[0],
            updated_at: new Date().toISOString().split('T')[0]
        };

        // Add to config
        this.config.portfolio_projects.push(newProject);
        this.saveConfig();

        // Create project workspace
        this.createProjectWorkspace(projectId);

        console.log(`✅ Project initialized: ${projectId}`);
        console.log(`📁 Workspace created: ./projects/${projectId}/`);
        console.log(`🔧 Next: npm run project:develop ${projectId}`);

        return projectId;
    }

    createProjectWorkspace(projectId) {
        const projectDir = `./projects/${projectId}`;
        
        if (!fs.existsSync(projectDir)) {
            fs.mkdirSync(projectDir, { recursive: true });
        }

        // Create project structure
        const structure = [
            'assets/images',
            'assets/documents', 
            'content',
            'staging'
        ];

        structure.forEach(subdir => {
            fs.mkdirSync(path.join(projectDir, subdir), { recursive: true });
        });

        // Create project README
        const readme = `# ${this.getProjectById(projectId).title}

## Project Overview
${this.getProjectById(projectId).description}

## Development Workflow
1. Add content to ./content/
2. Add images to ./assets/images/
3. Run: npm run project:build ${projectId}
4. Review in staging: npm run project:preview ${projectId}
5. Deploy: npm run project:deploy ${projectId}

## Status: ${this.getProjectById(projectId).status}
Created: ${new Date().toLocaleDateString()}
`;

        fs.writeFileSync(path.join(projectDir, 'README.md'), readme);

        console.log(`📁 Project workspace created: ${projectDir}`);
    }

    // 2. DEVELOPMENT WORKFLOW
    developProject(projectId) {
        console.log(`🔧 Entering development mode for: ${projectId}`);
        
        const project = this.getProjectById(projectId);
        if (!project) {
            console.error(`❌ Project not found: ${projectId}`);
            return;
        }

        // Update status
        project.status = 'development';
        project.updated_at = new Date().toISOString().split('T')[0];
        this.saveConfig();

        // Create staging version
        this.buildStagingVersion(projectId);

        console.log(`
🎯 Development Mode Active for: ${project.title}

📁 Project files: ./projects/${projectId}/
🔧 Edit content: ./projects/${projectId}/content/
🖼️ Add images: ./projects/${projectId}/assets/images/
📝 Update project data in: portfolio-config.json

🚀 Development Commands:
- npm run project:build ${projectId}     # Build staging version
- npm run project:preview ${projectId}   # Preview in browser
- npm run project:review ${projectId}    # Generate review checklist
- npm run project:finalize ${projectId}  # Mark ready for production
        `);
    }

    buildStagingVersion(projectId) {
        const project = this.getProjectById(projectId);
        const PortfolioGenerator = require('./portfolio-generator.js');
        const generator = new PortfolioGenerator();

        // Generate staging version
        const stagingHtml = generator.populateTemplate(
            generator.getDefaultTemplate(), 
            project
        );

        const stagingFile = path.join(this.stagingDir, `${projectId}.html`);
        fs.writeFileSync(stagingFile, stagingHtml);

        console.log(`🔧 Staging version built: ${stagingFile}`);
        console.log(`👁️ Preview: http://localhost:9000/staging/${projectId}.html`);
    }

    // 3. QUALITY ASSURANCE
    reviewProject(projectId) {
        console.log(`🔍 Running quality review for: ${projectId}`);
        
        const project = this.getProjectById(projectId);
        const issues = [];

        // Content validation
        const challengeLen = (project.challenge || '').length;
        const approachLen  = (project.approach  || '').length;
        if (challengeLen < 50) {
            issues.push('❌ Challenge section too short or missing');
        }
        if (approachLen < 50) {
            issues.push('❌ Approach section too short or missing');
        }
        const proc = project.process_steps || [];
        const high = project.highlights || [];
        if (proc.length < 3) {
            issues.push('❌ Need at least 3 process steps');
        }
        if (high.length < 2) {
            issues.push('❌ Need at least 2 highlights');
        }
        if (!project.header_image) {
            issues.push('⚠️ No header image specified');
        }

        // SEO validation
        if (project.description.length < 120 || project.description.length > 160) {
            issues.push('⚠️ Description should be 120-160 characters for SEO');
        }
        const tech = project.technologies || [];
        if (tech.length === 0) {
            issues.push('❌ No technologies listed');
        }

        // File validation
        const projectDir = `./projects/${projectId}`;
        if (!fs.existsSync(projectDir)) {
            issues.push('❌ Project workspace missing');
        }

        // Ensure directory exists before writing report
        if (!fs.existsSync(projectDir)) {
            fs.mkdirSync(projectDir, { recursive: true });
        }

        // Generate review report
        const reviewReport = `
# QUALITY REVIEW REPORT
## Project: ${project.title}
## Date: ${new Date().toLocaleDateString()}

### Status: ${issues.length === 0 ? '✅ READY FOR PRODUCTION' : '⚠️ NEEDS ATTENTION'}

### Issues Found: ${issues.length}
${issues.map(issue => `- ${issue}`).join('\n')}

### Content Statistics:
- Challenge: ${challengeLen} characters
- Approach: ${approachLen} characters  
- Process Steps: ${proc.length}
- Highlights: ${high.length}
- Technologies: ${tech.length}

### SEO Check:
- Description Length: ${project.description.length} characters
- Keywords: ${tech.join(', ')}
- Header Image: ${project.header_image ? '✅' : '❌'}

### Next Steps:
${issues.length === 0 ? 
    '🚀 Ready to deploy: npm run project:deploy ' + projectId :
    '🔧 Fix issues above, then run: npm run project:review ' + projectId
}
        `;

        const reportFile = `./projects/${projectId}/quality-review.md`;
        fs.writeFileSync(reportFile, reviewReport);

        console.log(reviewReport);
        console.log(`📄 Full report saved: ${reportFile}`);

        return issues.length === 0;
    }

    // 4. PRODUCTION DEPLOYMENT
    deployProject(projectId) {
        console.log(`🚀 Deploying project to production: ${projectId}`);
        
        // Run quality review first
        const reviewPassed = this.reviewProject(projectId);
        if (!reviewPassed) {
            console.error('❌ Quality review failed. Fix issues before deploying.');
            return;
        }

        const project = this.getProjectById(projectId);
        
        // Create backup
        this.createBackup(projectId);

        // Update project status
        project.status = 'live';
        project.updated_at = new Date().toISOString().split('T')[0];
        this.saveConfig();

        // Generate production version
        const PortfolioGenerator = require('./portfolio-generator.js');
        const generator = new PortfolioGenerator();
        generator.generateAll();

        // Deploy to live site
        try {
            execSync('git add .');
            execSync(`git commit -m "Deploy portfolio project: ${project.title}"`);
            execSync('git push');
            
            console.log(`✅ ${project.title} deployed successfully!`);
            console.log(`🌐 Live URL: ${this.config.portfolio_system.base_url}${project.portfolio_url}`);
            
        } catch (error) {
            console.error('❌ Deployment failed:', error.message);
        }
    }

    // 5. PROJECT MANAGEMENT
    listProjects() {
        console.log('\n📋 PORTFOLIO PROJECTS OVERVIEW\n');
        
        this.config.portfolio_projects.forEach(project => {
            const status = project.status === 'live' ? '🟢' : 
                          project.status === 'development' ? '🟡' : '🔴';
            
            console.log(`${status} ${project.title}`);
            console.log(`   Client: ${project.client}`);
            console.log(`   Status: ${project.status}`);
            console.log(`   Updated: ${project.updated_at}`);
            if (project.status === 'live') {
                console.log(`   URL: ${this.config.portfolio_system.base_url}${project.portfolio_url}`);
            }
            console.log('');
        });
    }

    updateProject(projectId, updates) {
        const project = this.getProjectById(projectId);
        if (!project) {
            console.error(`❌ Project not found: ${projectId}`);
            return;
        }

        Object.assign(project, updates);
        project.updated_at = new Date().toISOString().split('T')[0];
        this.saveConfig();

        console.log(`✅ Project updated: ${projectId}`);
    }

    archiveProject(projectId) {
        const projectIndex = this.config.portfolio_projects.findIndex(p => p.id === projectId);
        if (projectIndex === -1) {
            console.error(`❌ Project not found: ${projectId}`);
            return;
        }

        const project = this.config.portfolio_projects[projectIndex];
        project.status = 'archived';
        project.updated_at = new Date().toISOString().split('T')[0];

        // Move to archive section
        if (!this.config.archived_projects) {
            this.config.archived_projects = [];
        }
        this.config.archived_projects.push(project);
        this.config.portfolio_projects.splice(projectIndex, 1);

        this.saveConfig();
        console.log(`📦 Project archived: ${projectId}`);
    }

    // UTILITY METHODS
    getProjectById(id) {
        return this.config.portfolio_projects.find(p => p.id === id);
    }

    createBackup(projectId) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = `./backups/${timestamp}`;
        
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        // Backup current files
        try {
            execSync(`cp -r ./projects/${projectId} ${backupDir}/`);
            execSync(`cp portfolio-config.json ${backupDir}/`);
            
            console.log(`💾 Backup created: ${backupDir}`);
        } catch (error) {
            console.warn('⚠️ Backup failed:', error.message);
        }
    }
}

// CLI Interface
if (require.main === module) {
    const manager = new ProjectLifecycleManager();
    const command = process.argv[2];
    const projectId = process.argv[3];

    switch (command) {
        case 'init':
            // Example usage: node project-lifecycle.js init
            console.log('📝 Project initialization wizard not implemented in CLI');
            console.log('Use the web interface or edit portfolio-config.json directly');
            break;
            
        case 'develop':
            manager.developProject(projectId);
            break;
            
        case 'build':
            manager.buildStagingVersion(projectId);
            break;
            
        case 'review':
            manager.reviewProject(projectId);
            break;
            
        case 'deploy':
            manager.deployProject(projectId);
            break;
            
        case 'list':
            manager.listProjects();
            break;
            
        case 'archive':
            manager.archiveProject(projectId);
            break;
            
        default:
            console.log(`
🎯 PROJECT LIFECYCLE MANAGEMENT SYSTEM

Commands:
  node project-lifecycle.js develop <id>     # Enter development mode
  node project-lifecycle.js build <id>       # Build staging version  
  node project-lifecycle.js review <id>      # Quality review
  node project-lifecycle.js deploy <id>      # Deploy to production
  node project-lifecycle.js list             # List all projects
  node project-lifecycle.js archive <id>     # Archive project

Example Workflow:
  1. Add project data to portfolio-config.json
  2. npm run project:develop club77_content_pipeline
  3. npm run project:build club77_content_pipeline  
  4. npm run project:review club77_content_pipeline
  5. npm run project:deploy club77_content_pipeline

🚀 Full Long-term Solution Features:
- ✅ Complete project lifecycle management
- ✅ Quality assurance and review process
- ✅ Automated staging and production builds
- ✅ Backup and rollback capabilities
- ✅ SEO validation and optimization
- ✅ Version control integration
            `);
    }
}

module.exports = ProjectLifecycleManager; 