const express = require('express');
const bodyParser = require('body-parser');
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// --- config paths ---
const REPO_ROOT = path.join(__dirname, '..');
const PORTFOLIO_CONFIG = path.join(REPO_ROOT, 'portfolio-config.json');

// helper to slugify title
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g,'');

function mergeAIJson(aiJsonPath){
  const ai = JSON.parse(fs.readFileSync(aiJsonPath,'utf8'));
  const cfg = JSON.parse(fs.readFileSync(PORTFOLIO_CONFIG,'utf8'));

  const id = slug(ai.project_name);
  const exists = cfg.portfolio_projects.find(p=>p.id===id);
  if(exists) throw new Error('Project already exists in config');

  cfg.portfolio_projects.push({
    id,
    status:'draft',
    title:ai.project_name,
    client:ai.client||'Internal',
    description:ai.overview,
    services:ai.content.services||[],
    process_steps:ai.content.process||[],
    highlights:ai.content.highlights||[],
    header_image:ai.images.hero||'',
    technologies:ai.content.technologies||[],
    portfolio_url:`/${id}.html`,
    card_size:'standard',
    short_description:ai.overview.slice(0,90)
  });
  fs.writeFileSync(PORTFOLIO_CONFIG, JSON.stringify(cfg,null,2));
  return id+'.html';
}

const app = express();
app.use(bodyParser.json({limit:'2mb'}));

app.post('/api/portfolio/ai', (req,res)=>{
  const { title, description, client, services, process_steps, highlights, header_image } = req.body;
  if(!title||!description){return res.status(400).json({ok:false,error:'title and description required'});}  
  try{
    // Call AI generator synchronously for MVP
    const aiOutDir = path.join(REPO_ROOT, 'projects', slug(title));
    const aiJson = path.join(aiOutDir, 'content.json');
    // ensure dir
    fs.mkdirSync(aiOutDir,{recursive:true});

    const args=[ path.join(REPO_ROOT,'scripts','ai-portfolio-generator.py'),
      '--project_name', title,
      '--overview', description,
      '--output_dir', aiOutDir,
      '--json-only'
    ];
    spawnSync('python3', args, { stdio:'inherit' });

    const fileName = mergeAIJson(aiJson);

    // regenerate HTML
    spawnSync('node', [path.join(REPO_ROOT,'scripts','portfolio-generator.js'),'generate'], { stdio:'inherit' });

    res.json({ok:true,file:fileName});
  }catch(err){console.error(err);res.status(500).json({ok:false,error:err.message});}
});

const PORT = process.env.PORT||5000;
app.listen(PORT,()=>console.log('Portfolio API listening on',PORT)); 