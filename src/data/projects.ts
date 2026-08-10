export interface Project {
  id: string;
  title: string;
  client: string;
  industry: string;
  image: string;
  services: string[];
  description: string;
  liveUrl?: string;
  results?: string[];
  date: string;
}

// Production safe empty array by default (No fake clients or fabricated reviews)
export const projectsData: Project[] = [];

export default projectsData;
