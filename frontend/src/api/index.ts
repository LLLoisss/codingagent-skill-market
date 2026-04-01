import axios from 'axios';
import type { Skill, PaginatedResult } from '../types';

const api = axios.create({
  baseURL: '/api',
});

export async function getSkills(
  search?: string,
  page = 1,
  pageSize = 27,
): Promise<PaginatedResult<Skill>> {
  const params: Record<string, string | number> = { page, pageSize };
  if (search) params.search = search;
  const { data } = await api.get<PaginatedResult<Skill>>('/skills', { params });
  return data;
}

export async function createSkill(
  form: { name: string; description: string; author: string },
  files: File[],
  relativePaths: string[],
): Promise<Skill> {
  const formData = new FormData();
  formData.append('name', form.name);
  formData.append('description', form.description);
  formData.append('author', form.author);
  formData.append('relativePaths', JSON.stringify(relativePaths));
  files.forEach((file) => {
    formData.append('files', file);
  });
  const { data } = await api.post<Skill>('/skills', formData);
  return data;
}

export async function deleteSkill(id: string): Promise<void> {
  await api.delete(`/skills/${id}`);
}

export async function updateSkill(
  id: string,
  form: { name: string; description: string; author: string },
  files?: File[],
  relativePaths?: string[],
): Promise<Skill> {
  const formData = new FormData();
  formData.append('name', form.name);
  formData.append('description', form.description);
  formData.append('author', form.author);
  if (files && files.length > 0 && relativePaths) {
    formData.append('relativePaths', JSON.stringify(relativePaths));
    files.forEach((file) => {
      formData.append('files', file);
    });
  }
  const { data } = await api.put<Skill>(`/skills/${id}`, formData);
  return data;
}

export function getDownloadUrl(id: string): string {
  return `/api/skills/${id}/download`;
}
