import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import archiver from 'archiver';
import { Skill } from '../types';

const router = Router();

const STORE_DIR =
  process.env.STORE_DIR ||
  'C:\\Users\\13135\\Desktop\\workspace\\skill-market-store';
const META_FILE = path.join(STORE_DIR, 'skills-meta.json');

// Ensure store directory exists
if (!fs.existsSync(STORE_DIR)) {
  fs.mkdirSync(STORE_DIR, { recursive: true });
}

// Initialize meta file
if (!fs.existsSync(META_FILE)) {
  fs.writeFileSync(META_FILE, JSON.stringify([]), 'utf-8');
}

function readMeta(): Skill[] {
  const raw = fs.readFileSync(META_FILE, 'utf-8');
  return JSON.parse(raw);
}

function writeMeta(skills: Skill[]): void {
  fs.writeFileSync(META_FILE, JSON.stringify(skills, null, 2), 'utf-8');
}

// Multer config: store uploaded files to a temp dir, then move
const upload = multer({ dest: path.join(STORE_DIR, '_temp') });

// GET /api/skills - list all skills, optional ?search=keyword
router.get('/', (_req: Request, res: Response) => {
  const skills = readMeta();
  const search = ((_req.query.search as string) || '').trim().toLowerCase();
  const filtered = search
    ? skills.filter((s) => s.name.toLowerCase().includes(search))
    : skills;
  // Return newest first
  res.json(
    filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    ),
  );
});

// POST /api/skills - create a new skill with folder upload
router.post('/', upload.array('files'), (req: Request, res: Response) => {
  const { name, description, author, relativePaths } = req.body;

  if (!name || !description || !author) {
    res.status(400).json({ error: '名称、描述、作者不能为空' });
    return;
  }

  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) {
    res.status(400).json({ error: '请上传Skill文件夹' });
    return;
  }

  const id = uuidv4();
  const skillDir = path.join(STORE_DIR, id);
  fs.mkdirSync(skillDir, { recursive: true });

  // Parse relative paths sent from frontend
  let paths: string[] = [];
  try {
    paths = JSON.parse(relativePaths);
  } catch {
    paths = files.map((f) => f.originalname);
  }

  // Move files from temp to skill directory, preserving folder structure
  files.forEach((file, index) => {
    const relativePath = paths[index] || file.originalname;
    // Sanitize path to prevent directory traversal
    const safePath = path
      .normalize(relativePath)
      .replace(/^(\.\.(\/|\\|$))+/, '');
    const destPath = path.join(skillDir, safePath);
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.renameSync(file.path, destPath);
  });

  const skill: Skill = {
    id,
    name,
    description,
    author,
    createdAt: new Date().toISOString(),
    folderName: id,
  };

  const skills = readMeta();
  skills.push(skill);
  writeMeta(skills);

  res.status(201).json(skill);
});

// DELETE /api/skills/:id
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  let skills = readMeta();
  const skill = skills.find((s) => s.id === id);
  if (!skill) {
    res.status(404).json({ error: 'Skill不存在' });
    return;
  }

  // Remove folder
  const skillDir = path.join(STORE_DIR, skill.folderName);
  if (fs.existsSync(skillDir)) {
    fs.rmSync(skillDir, { recursive: true, force: true });
  }

  skills = skills.filter((s) => s.id !== id);
  writeMeta(skills);

  res.json({ message: '删除成功' });
});

// GET /api/skills/:id/download - download skill folder as zip
router.get('/:id/download', (req: Request, res: Response) => {
  const { id } = req.params;
  const skills = readMeta();
  const skill = skills.find((s) => s.id === id);
  if (!skill) {
    res.status(404).json({ error: 'Skill不存在' });
    return;
  }

  const skillDir = path.join(STORE_DIR, skill.folderName);
  if (!fs.existsSync(skillDir)) {
    res.status(404).json({ error: 'Skill文件夹不存在' });
    return;
  }

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${encodeURIComponent(skill.name)}.zip"`,
  );

  const archive = archiver('zip', { zlib: { level: 9 } });
  archive.on('error', (err) => {
    res.status(500).json({ error: '打包失败' });
  });
  archive.pipe(res);
  archive.directory(skillDir, false);
  archive.finalize();
});

// PUT /api/skills/:id - update skill metadata and/or files
router.put('/:id', upload.array('files'), (req: Request, res: Response) => {
  const { id } = req.params;
  const skills = readMeta();
  const skillIndex = skills.findIndex((s) => s.id === id);
  if (skillIndex === -1) {
    res.status(404).json({ error: 'Skill不存在' });
    return;
  }

  const skill = skills[skillIndex];
  const { name, description, author, relativePaths } = req.body;

  // Update metadata
  if (name) skill.name = name;
  if (description) skill.description = description;
  if (author) skill.author = author;

  // If new files are uploaded, replace the old ones
  const files = req.files as Express.Multer.File[];
  if (files && files.length > 0) {
    const skillDir = path.join(STORE_DIR, skill.folderName);

    // Remove old files
    if (fs.existsSync(skillDir)) {
      fs.rmSync(skillDir, { recursive: true, force: true });
    }
    fs.mkdirSync(skillDir, { recursive: true });

    let paths: string[] = [];
    try {
      paths = JSON.parse(relativePaths);
    } catch {
      paths = files.map((f) => f.originalname);
    }

    files.forEach((file, index) => {
      const relativePath = paths[index] || file.originalname;
      const safePath = path
        .normalize(relativePath)
        .replace(/^(\.\.(\/|\\|$))+/, '');
      const destPath = path.join(skillDir, safePath);
      const destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      fs.renameSync(file.path, destPath);
    });
  }

  skills[skillIndex] = skill;
  writeMeta(skills);

  res.json(skill);
});

export default router;
