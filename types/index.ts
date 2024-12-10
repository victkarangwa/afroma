export interface ApiResponse {
  data: any;
  [key: string]: any;
}

export interface SwiperProps {
  id: number;
  location?: string;
  distance?: number;
  mediaList: { featured: boolean; thumbnailUrl: string }[];
  firstName: string;
  middleName?: string;
  age: number;
  relationshipStatus?: string;
  familyPlan?: string;
  interests?: string[];
}
