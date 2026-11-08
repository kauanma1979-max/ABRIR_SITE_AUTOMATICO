import { LinkItem } from '../types.ts';

const STORAGE_KEY = 'link_launcher_items_v1';
const CATEGORIES_KEY = 'link_launcher_categories_v1';

export const DEFAULT_CATEGORIES = ['Geral', 'Trabalho', 'Estudos', 'Notícias', 'Ferramentas', 'Redes Sociais'];

export const INITIAL_LINKS: LinkItem[] = [
  {
    id: 'link-1',
    title: 'Google Workspace',
    url: 'https://workspace.google.com',
    category: 'Trabalho',
    description: 'Acesso rápido ao Gmail, Google Drive e ferramentas de trabalho.',
    enabled: true,
    createdAt: Date.now() - 3600000 * 24 * 3,
    openCount: 14,
    lastOpenedAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'link-2',
    title: 'GitHub',
    url: 'https://github.com',
    category: 'Ferramentas',
    description: 'Repositórios de código, pull requests e projetos abertos.',
    enabled: true,
    createdAt: Date.now() - 3600000 * 24 * 2,
    openCount: 28,
    lastOpenedAt: Date.now() - 3600000 * 5,
  },
  {
    id: 'link-3',
    title: 'MDN Web Docs',
    url: 'https://developer.mozilla.org',
    category: 'Estudos',
    description: 'Documentação oficial para tecnologias web (HTML, CSS, JavaScript).',
    enabled: true,
    createdAt: Date.now() - 3600000 * 24,
    openCount: 9,
    lastOpenedAt: Date.now() - 3600000 * 12,
  },
  {
    id: 'link-4',
    title: 'G1 - Portal de Notícias',
    url: 'https://g1.globo.com',
    category: 'Notícias',
    description: 'Principais notícias do Brasil e do mundo atualizadas em tempo real.',
    enabled: true,
    createdAt: Date.now() - 3600000 * 18,
    openCount: 6,
    lastOpenedAt: Date.now() - 3600000 * 20,
  },
  {
    id: 'link-5',
    title: 'YouTube',
    url: 'https://www.youtube.com',
    category: 'Geral',
    description: 'Vídeos, músicas, podcasts e transmissões ao vivo.',
    enabled: true,
    createdAt: Date.now() - 3600000 * 10,
    openCount: 22,
    lastOpenedAt: Date.now() - 3600000 * 4,
  },
];

export function loadLinksFromStorage(): LinkItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveLinksToStorage(INITIAL_LINKS);
      return INITIAL_LINKS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_LINKS;
  } catch (error) {
    console.error('Falha ao carregar links do localStorage:', error);
    return INITIAL_LINKS;
  }
}

export function saveLinksToStorage(links: LinkItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
  } catch (error) {
    console.error('Falha ao salvar links no localStorage:', error);
  }
}

export function loadCategoriesFromStorage(): string[] {
  try {
    const raw = localStorage.getItem(CATEGORIES_KEY);
    if (!raw) {
      return DEFAULT_CATEGORIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return Array.from(new Set([...DEFAULT_CATEGORIES, ...parsed]));
    }
    return DEFAULT_CATEGORIES;
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

export function saveCategoriesToStorage(categories: string[]): void {
  try {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  } catch (error) {
    console.error('Falha ao salvar categorias no localStorage:', error);
  }
}
