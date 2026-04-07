export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string | null;
  imageUrl: string | null;
  liveUrl: string | null;
  githubUrl: string | null;
  tags: Tag[];
  featured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Skill {
  id: string;
  name: string;
  level: number;
  icon: string | null;
  category: "FRONTEND" | "BACKEND" | "DEVOPS" | "DESIGN" | "OTHER";
  status: "PROFICIENT" | "EXPLORING";
  sortOrder: number;
}

export interface Tag {
  id: string;
  name: string;
}
