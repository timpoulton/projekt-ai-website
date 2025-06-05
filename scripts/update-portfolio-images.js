#!/usr/bin/env node

/**
 * Portfolio Image Updater
 * Updates portfolio config with generated AI images
 */

const fs = require('fs');
const path = require('path');

// Configuration
const PORTFOLIO_CONFIG = path.join(__dirname, '../portfolio-config.json');
const IMAGE_DIR = path.join(__dirname, '../assets/img/portfolio');

// Project image mappings
const PROJECT_IMAGES = {
    'club77_content_pipeline': 'club77-content-pipeline-card.jpg',
    'upwork_proposal_automation': 'upwork-proposal-automation-card.jpg',
    'blueprint_generator': 'blueprint-generator-card.jpg',
    'client_proposals': 'client-proposals-card.jpg',
    'multi_model_chatbot': 'multi-model-chatbot-card.jpg'
};

function updatePortfolioConfig() {
    try {
        // Read current config
        const config = JSON.parse(fs.readFileSync(PORTFOLIO_CONFIG, 'utf8'));
        
        // Update project images
        config.portfolio_projects.forEach(project => {
            const imageName = PROJECT_IMAGES[project.id];
            if (imageName) {
                project.header_image = `assets/img/portfolio/${imageName}`;
                console.log(`✅ Updated image for ${project.id}`);
            }
        });
        
        // Save updated config
        fs.writeFileSync(PORTFOLIO_CONFIG, JSON.stringify(config, null, 2));
        console.log('✅ Portfolio config updated successfully');
        
    } catch (error) {
        console.error('❌ Error updating portfolio config:', error);
        process.exit(1);
    }
}

// Run the update
updatePortfolioConfig(); 