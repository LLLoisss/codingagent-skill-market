export interface Skill {
  id: string;
  name: string;
  description: string;
  author: string;
  createdAt: string;
  folderName: string;
}

export interface SkillForm {
  name: string;
  description: string;
  author: string;
}
