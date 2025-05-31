#!/usr/bin/env node

/**
 * Projekt AI - Figma Logo Integration
 * Fetches logos from Figma and applies them to the website
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const FIGMA_TOKEN = process.env.FIGMA_TOKEN || 'YOUR_FIGMA_TOKEN_HERE';
const FIGMA_FILE_ID = 'DegzkaFinaMjSokEJoNC6w';
const ASSETS_DIR = './assets/img/logos/';

// Ensure assets directory exists
if (!fs.existsSync(ASSETS_DIR)) {
    fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

/**
 * Makes authenticated requests to Figma API
 */
function figmaRequest(endpoint) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.figma.com',
            path: `/v1/${endpoint}`,
            method: 'GET',
            headers: {
                'X-Figma-Token': FIGMA_TOKEN,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve(parsed);
                } catch (error) {
                    reject(new Error(`Failed to parse response: ${error.message}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

/**
 * Downloads a file from URL to local path
 */
function downloadFile(url, filepath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        
        https.get(url, (response) => {
            response.pipe(file);
            
            file.on('finish', () => {
                file.close();
                resolve(filepath);
            });
            
            file.on('error', (error) => {
                fs.unlink(filepath, () => {}); // Delete partial file
                reject(error);
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}

/**
 * Finds logo nodes in Figma file
 */
async function findLogoNodes() {
    console.log('🔍 Scanning Figma file for logos...');
    
    try {
        const fileData = await figmaRequest(`files/${FIGMA_FILE_ID}`);
        
        if (!fileData.document) {
            throw new Error('Invalid Figma file or insufficient permissions');
        }

        const logoNodes = [];
        
        function searchNodes(nodes, pageName = 'Unknown') {
            for (const node of nodes) {
                const name = node.name.toLowerCase();
                
                // Look for logo-related keywords
                if (name.includes('logo') || 
                    name.includes('icon') || 
                    name.includes('mark') || 
                    name.includes('symbol') || 
                    name.includes('brand')) {
                    
                    logoNodes.push({
                        id: node.id,
                        name: node.name,
                        type: node.type,
                        page: pageName
                    });
                }
                
                // Search children recursively
                if (node.children) {
                    searchNodes(node.children, pageName);
                }
            }
        }

        // Search all pages
        for (const page of fileData.document.children) {
            searchNodes(page.children, page.name);
        }

        console.log(`📋 Found ${logoNodes.length} logo assets:`);
        logoNodes.forEach(asset => {
            console.log(`   • ${asset.name} (${asset.type})`);
        });

        return logoNodes;
        
    } catch (error) {
        console.error('❌ Error fetching Figma file:', error.message);
        throw error;
    }
}

/**
 * Exports and downloads logos
 */
async function downloadLogos(nodes) {
    console.log('📥 Exporting logos from Figma...');
    
    try {
        const nodeIds = nodes.map(n => n.id).join(',');
        
        // Try multiple export formats
        const formats = [
            { format: 'svg', scale: 1 },
            { format: 'png', scale: 2 }
        ];
        
        let allDownloads = [];
        
        for (const { format, scale } of formats) {
            console.log(`🔄 Trying ${format} export...`);
            
            try {
                const exportData = await figmaRequest(
                    `images/${FIGMA_FILE_ID}?ids=${nodeIds}&format=${format}&scale=${scale}`
                );
                
                if (exportData.err) {
                    console.warn(`⚠️ ${format} export error: ${exportData.err}`);
                    continue;
                }
                
                if (!exportData.images || Object.keys(exportData.images).length === 0) {
                    console.warn(`⚠️ No ${format} images returned`);
                    continue;
                }

                console.log(`✅ ${format} export successful - ${Object.keys(exportData.images).length} images`);

                const downloads = [];
                
                for (const [nodeId, imageUrl] of Object.entries(exportData.images)) {
                    if (!imageUrl) {
                        console.warn(`⚠️ No URL for node ${nodeId}`);
                        continue;
                    }
                    
                    const node = nodes.find(n => n.id === nodeId);
                    const extension = format.toLowerCase();
                    const filename = `${node.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.${extension}`;
                    const filepath = path.join(ASSETS_DIR, filename);
                    
                    console.log(`💾 Downloading: ${node.name} → ${filename}`);
                    
                    try {
                        await downloadFile(imageUrl, filepath);
                        downloads.push({
                            node,
                            filename,
                            filepath,
                            relativePath: `assets/img/logos/${filename}`,
                            format
                        });
                        console.log(`   ✅ Downloaded successfully`);
                    } catch (error) {
                        console.error(`   ❌ Download failed: ${error.message}`);
                    }
                }
                
                allDownloads = allDownloads.concat(downloads);
                
                // If we got SVGs, prefer those
                if (format === 'svg' && downloads.length > 0) {
                    console.log('🎯 Using SVG versions (preferred)');
                    return downloads;
                }
                
            } catch (error) {
                console.error(`❌ ${format} export failed:`, error.message);
                continue;
            }
        }
        
        return allDownloads;
        
    } catch (error) {
        console.error('❌ All export attempts failed:', error.message);
        throw error;
    }
}

/**
 * Updates the HTML with logo references
 */
function updateWebsite(logos) {
    console.log('🔄 Updating website with new logos...');
    
    const htmlFile = './index-extramedium-exact-v2.html';
    
    if (!fs.existsSync(htmlFile)) {
        console.warn('⚠️ HTML file not found, skipping updates');
        return;
    }
    
    let html = fs.readFileSync(htmlFile, 'utf8');
    let updated = false;
    
    console.log(`📋 Available logos: ${logos.map(l => l.node.name).join(', ')}`);
    
    // Find header logo (prioritize light version, then regular, SVG preferred)
    const headerLogo = logos.find(logo => 
        logo.node.name.toLowerCase().includes('light') &&
        logo.format === 'svg'
    ) || logos.find(logo => 
        logo.node.name.toLowerCase().includes('light')
    ) || logos.find(logo => 
        (logo.node.name.toLowerCase().includes('header') ||
         logo.node.name.toLowerCase().includes('main') ||
         logo.node.name.toLowerCase().includes('logo')) &&
        logo.format === 'svg'
    ) || logos.find(logo => 
        logo.node.name.toLowerCase().includes('header') ||
        logo.node.name.toLowerCase().includes('main') ||
        logo.node.name.toLowerCase().includes('logo')
    );
    
    if (headerLogo) {
        // Update header logo - handle both text and existing image
        const existingLogoPattern = /(<a href="#" class="logo">)(<img[^>]*>)(<\/a>)/;
        const textLogoPattern = /(<a href="#" class="logo">)Projekt AI®(<\/a>)/;
        const logoReplacement = `$1<img src="${headerLogo.relativePath}" alt="Projekt AI" style="height: 40px; width: auto; vertical-align: middle;">$3`;
        
        if (html.match(existingLogoPattern)) {
            html = html.replace(existingLogoPattern, logoReplacement);
            updated = true;
            console.log(`   ✅ Updated existing header logo with: ${headerLogo.node.name}`);
        } else if (html.match(textLogoPattern)) {
            html = html.replace(textLogoPattern, `$1<img src="${headerLogo.relativePath}" alt="Projekt AI" style="height: 40px; width: auto; vertical-align: middle;">$2`);
            updated = true;
            console.log(`   ✅ Replaced text header with: ${headerLogo.node.name}`);
        }
    }
    
    // Find favicon
    const favicon = logos.find(logo => 
        logo.node.name.toLowerCase().includes('favicon')
    ) || logos.find(logo => 
        logo.node.name.toLowerCase().includes('icon')
    );
    
    if (favicon) {
        // Add favicon link to head if not already present
        const headClosePattern = /(<\/head>)/;
        const faviconLink = `    <link rel="icon" type="image/${favicon.format === 'svg' ? 'svg+xml' : 'png'}" href="${favicon.relativePath}">\n$1`;
        
        if (html.match(headClosePattern) && !html.includes('rel="icon"')) {
            html = html.replace(headClosePattern, faviconLink);
            updated = true;
            console.log(`   ✅ Added favicon: ${favicon.node.name}`);
        }
    }
    
    // Update client logos section with actual logos or icons
    const clientsGridPattern = /(<!-- Client Logos Grid -->\s*<div class="clients-grid">)([\s\S]*?)(<\/div>)/;
    
    if (html.match(clientsGridPattern)) {
        // Use icon variations if available, otherwise use whatever logos we have
        const iconsForGrid = logos.filter(logo => 
            logo.node.name.toLowerCase().includes('icon') ||
            logo.node.name.toLowerCase().includes('mark')
        );
        
        const logosToUse = iconsForGrid.length > 0 ? iconsForGrid : logos.slice(0, 6);
        
        if (logosToUse.length > 0) {
            // Create a mix of logos and text to fill 6 slots
            const clientItems = [];
            
            // Add actual logos first
            logosToUse.forEach(logo => {
                clientItems.push(`            <div class="client-logo">
                <img src="${logo.relativePath}" alt="${logo.node.name}" style="max-height: 48px; max-width: 160px; opacity: 0.8; object-fit: contain;">
            </div>`);
            });
            
            // Fill remaining slots with text if needed
            const textClients = ['CLUB77', 'VENUES', 'EVENTS', 'HOSPITALITY', 'MUSIC', 'NIGHTLIFE'];
            while (clientItems.length < 6) {
                const textClient = textClients[clientItems.length] || 'CLIENT';
                clientItems.push(`            <div class="client-logo">${textClient}</div>`);
            }
            
            const clientsReplacement = `$1\n${clientItems.slice(0, 6).join('\n')}\n        $3`;
            html = html.replace(clientsGridPattern, clientsReplacement);
            updated = true;
            console.log(`   ✅ Updated clients grid with ${logosToUse.length} logos`);
        }
    }
    
    if (updated) {
        fs.writeFileSync(htmlFile, html);
        console.log('💾 Website updated successfully!');
        console.log('🌐 Refresh http://192.168.1.107:8086/index-extramedium-exact-v2.html to see changes');
    } else {
        console.log('ℹ️ No updates made to website');
    }
}

/**
 * Main execution
 */
async function main() {
    console.log('🎨 Projekt AI - Figma Logo Integration\n');
    
    try {
        // Step 1: Find logos in Figma
        const logoNodes = await findLogoNodes();
        
        if (logoNodes.length === 0) {
            console.log('📭 No logos found in Figma file');
            return;
        }
        
        // Step 2: Download logos
        const downloads = await downloadLogos(logoNodes);
        
        if (downloads.length === 0) {
            console.log('📭 No logos were downloaded');
            return;
        }
        
        // Step 3: Update website
        updateWebsite(downloads);
        
        console.log(`\n🎉 Successfully integrated ${downloads.length} logos from Figma!`);
        console.log('🌐 Refresh your browser to see the changes');
        
    } catch (error) {
        console.error('\n💥 Integration failed:', error.message);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { main }; 