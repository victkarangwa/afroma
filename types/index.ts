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

export interface Product {
  id: number;
  name: string;
  price: number;
  pricePep: number;
  currency: string;
  description: string;
  active: boolean;
  createdAt: Date;
}

// Post Listing API Types
export interface PostFilter {
  column: string;
  value: any;
  operator: string;
}

export interface PostListRequest {
  filters: PostFilter[];
  search: string;
  currentPage: number;
  pageSize: number;
}

export interface PostUser {
  id: number;
  firstname: string;
  lastname: string;
  gender: string;
  interestedIn: string;
  dateOfBirth: string;
  publicFigure: boolean;
  latitude: number;
  longitude: number;
  profileType: string;
  profileTypes: string[];
}

export interface PostAttachment {
  id: number;
  thumbnailUrl: string;
  mediaUrl: string;
  fileName: string;
  featured: boolean;
  mediaType: string;
}

export interface Post {
  id: number;
  content: string;
  user: PostUser;
  profileType: string;
  status: string;
  likeCount: number;
  createdAt: string;
  attachments: PostAttachment[];
}

export interface PostListResponse {
  success: boolean;
  message: string;
  list: Post[];
  filters: PostFilter[];
  totalPages: number;
  totalRecords: number;
  pageSize: number;
  currentPage: number;
}

// Post Creation API Types
export interface CreatePostRequest {
  id?: number;
  content: string;
  mediaFileIds?: number[];
}

export interface CreatePostResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    content: string;
    createdAt: string;
    status: string;
  };
}

// Media Upload API Types
export interface MediaUploadRequest {
  fileContent: string;
  mediaType: 'PHOTO' | 'VIDEO' | 'AUDIO';
  fileRefType: 'POST' | 'PROFILE';
  featured: boolean;
}

export interface MediaUploadResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    url: string;
    mediaType: string;
    featured: boolean;
  };
}

// Dating Matches Types
export interface DatingMatchMedia {
  id: number;
  thumbnailUrl: string;
  mediaUrl: string;
  fileName: string;
  featured: boolean;
  mediaType: string;
}

export interface MatchingResult {
  matchingRate: number;
  matchedQuestions: any[];
}

export interface DatingMatch {
  id: number;
  firstName: string;
  middleName: string;
  gender: string;
  distance: number;
  matchingResult: MatchingResult;
  age: number;
  mediaList: DatingMatchMedia[];
}

export interface DatingMatchesResponse {
  list: DatingMatch[];
}
