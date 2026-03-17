export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: "USER" | "ADMIN";
  provider: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  content: string;
  isRead: boolean;
  userId: string | null;
  createdAt: string;
}

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

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string | null;
  sortOrder: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string | null;
  content: string;
  avatarUrl: string | null;
  sortOrder: number;
}

export interface Tag {
  id: string;
  name: string;
}

export interface UserData {
  id: string;
  userId: string;
  key: string;
  value: unknown;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type ClientProjectStatus =
  | "QUOTE_PENDING"
  | "QUOTE_ACCEPTED"
  | "QUOTE_REJECTED"
  | "IN_PROGRESS"
  | "REVIEW"
  | "COMPLETED"
  | "CANCELLED";

export interface ClientProject {
  id: string;
  title: string;
  description: string;
  status: ClientProjectStatus;
  price: number | null;
  currency: string;
  startDate: string | null;
  endDate: string | null;
  clientId: string;
  client?: User;
  updates?: ProjectUpdate[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectUpdate {
  id: string;
  clientProjectId: string;
  content: string;
  imageUrls: string[];
  links: string[];
  createdAt: string;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details: { field: string; message: string }[];
  };
}

export interface StatsOverview {
  unreadMessages: number;
  totalMessagesThisMonth: number;
  pageViewsThisMonth: number;
  totalUsers: number;
}

export interface StatsPeriod {
  date: string;
  count: number;
}
