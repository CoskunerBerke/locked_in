export interface Testimonial {
  id: string;
  authorName: string;
  authorTitle: string;
  companyName: string;
  avatarUrl?: string;
  comment: string;
  rating: number;
  date: string;
}

// Production safe empty array by default (No fake testimonials or fabricated reviews)
export const testimonialsData: Testimonial[] = [];

export default testimonialsData;
