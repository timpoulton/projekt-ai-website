const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration from environment variables
const FIGMA_API_TOKEN = process.env.FIGMA_API_TOKEN;
const FIGMA_FILE_ID = process.env.FIGMA_FILE_ID;

if (!FIGMA_API_TOKEN) {
    console.error('❌ FIGMA_API_TOKEN environment variable not set!');
    console.error('💡 Set it with: export FIGMA_API_TOKEN="your_token_here"');
    process.exit(1);
}

if (!FIGMA_FILE_ID) {
    console.error('❌ FIGMA_FILE_ID environment variable not set!');
    console.error('💡 Set it with: export FIGMA_FILE_ID="your_file_id_here"');
    process.exit(1);
}

console.log('🎨 Projekt AI - Figma Logo Sync');
console.log('================================');
console.log(`📋 File ID: ${FIGMA_FILE_ID}`);
console.log('🔐 Token: [SECURE - FROM ENVIRONMENT]');
console.log('');

// Create output directory
const outputDir = path.join(__dirname, '..', 'assets', 'img', 'logos');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Function to make Figma API request
function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'X-Figma-Token': FIGMA_API_TOKEN
            }
        };

        https.get(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`API Error ${res.statusCode}: ${data}`));
                }
            });
        }).on('error', reject);
    });
}

// Function to download image
function downloadImage(url, filename) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 200) {
                const filePath = path.join(outputDir, filename);
                const fileStream = fs.createWriteStream(filePath);
                res.pipe(fileStream);
                fileStream.on('finish', () => {
                    fileStream.close();
                    resolve(filePath);
                });
                fileStream.on('error', reject);
            } else {
                reject(new Error(`Download failed: ${res.statusCode}`));
            }
        }).on('error', reject);
    });
}

// Main sync function
async function syncLogos() {
    try {
        console.log('🔍 Fetching Figma file components...');
        
        // Get file components
        const fileUrl = `https://api.figma.com/v1/files/${FIGMA_FILE_ID}`;
        const fileData = await makeRequest(fileUrl);
        
        // Find logo components
        const logoComponents = [];
        const allComponents = [];
        
        function findLogoComponents(node) {
            // Look for both components and frames
            if ((node.type === 'COMPONENT' || node.type === 'FRAME') && node.name) {
                allComponents.push({
                    id: node.id,
                    name: node.name,
                    type: node.type
                });
                
                const name = node.name.toLowerCase();
                // More flexible search criteria
                if (name.includes('logo') || name.includes('icon') || name.includes('brand') || 
                    name.includes('projekt') || name.includes('ai') || name.includes('monochrome') || 
                    name.includes('color')) {
                    logoComponents.push({
                        id: node.id,
                        name: node.name
                    });
                }
            }
            
            if (node.children) {
                node.children.forEach(findLogoComponents);
            }
        }
        
        fileData.document.children.forEach(findLogoComponents);
        
        console.log(`🔍 Found ${allComponents.length} total components in file:`);
        allComponents.forEach(comp => console.log(`   • ${comp.name} (${comp.type})`));
        console.log('');
        
        if (logoComponents.length === 0) {
            console.log('⚠️ No logo components found with current search criteria!');
            console.log('💡 Searched for names containing: logo, icon, brand, projekt, ai, monochrome, color');
            console.log('📋 All available components are listed above');
            return;
        }
        
        console.log(`✅ Found ${logoComponents.length} logo components:`);
        logoComponents.forEach(comp => console.log(`   • ${comp.name}`));
        console.log('');
        
        // Get download URLs
        const componentIds = logoComponents.map(c => c.id).join(',');
        const exportUrl = `https://api.figma.com/v1/images/${FIGMA_FILE_ID}?ids=${componentIds}&format=png&scale=2`;
        
        console.log('🔗 Getting download URLs...');
        const exportData = await makeRequest(exportUrl);
        
        if (!exportData.images || Object.keys(exportData.images).length === 0) {
            console.log('❌ No download URLs received');
            return;
        }
        
        // Download each logo
        const manifest = {
            sync_date: new Date().toISOString(),
            figma_file_id: FIGMA_FILE_ID,
            components: []
        };
        
        console.log('⬇️ Downloading logos...');
        
        for (const comp of logoComponents) {
            const downloadUrl = exportData.images[comp.id];
            if (downloadUrl) {
                const filename = `${comp.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.png`;
                try {
                    console.log(`   📄 ${comp.name} → ${filename}`);
                    await downloadImage(downloadUrl, filename);
                    
                    manifest.components.push({
                        name: comp.name,
                        filename: filename,
                        figma_id: comp.id
                    });
                } catch (err) {
                    console.log(`   ❌ Failed to download ${comp.name}: ${err.message}`);
                }
            }
        }
        
        // Save manifest
        const manifestPath = path.join(outputDir, 'logo-manifest.json');
        fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
        
        console.log('');
        console.log('✅ Sync completed successfully!');
        console.log(`📁 Downloaded ${manifest.components.length} logos to: ${outputDir}`);
        console.log(`📋 Manifest saved: ${manifestPath}`);
        
    } catch (error) {
        console.error('❌ Sync failed:', error.message);
        process.exit(1);
    }
}

// Run the sync
syncLogos(); 