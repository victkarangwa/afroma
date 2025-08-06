import { http } from './http';
import { PostListRequest, PostListResponse, CreatePostRequest, CreatePostResponse, MediaUploadRequest, MediaUploadResponse } from '@/types';

export const postApi = {
  /**
   * Get list of posts with filters and pagination
   * @param data - Post list request parameters
   * @returns Promise<PostListResponse | null>
   */
  getPostList: async (data: PostListRequest): Promise<PostListResponse | null> => {
    try {
      const response = await http.post<PostListResponse>('/post/list', data);
      return response.data;
    } catch (error) {
      console.error('Error fetching post list:', error);
      return null;
    }
  },

  /**
   * Get posts with profile type filter
   * @param page - Current page number (default: 1)
   * @param pageSize - Number of posts per page (default: 20)
   * @param search - Search term (optional)
   * @param profileType - Profile type to filter by (optional)
   * @returns Promise<PostListResponse | null>
   */
  getPosts: async (
    page: number = 1,
    pageSize: number = 20,
    search: string = '',
    profileType?: string
  ): Promise<PostListResponse | null> => {
    const filters: any[] = [
      {
        column: 'status',
        value: 'PUBLISHED',
        operator: '='
      }
    ];

    // Add profile type filter if provided
    if (profileType) {
      filters.push({
        column: 'profileType',
        value: profileType.toUpperCase(),
        operator: '='
      });
    }

    const requestData: PostListRequest = {
      filters,
      search,
      currentPage: page,
      pageSize
    };

    return postApi.getPostList(requestData);
  },

  /**
   * Create a new post
   * @param data - Post creation data
   * @returns Promise<CreatePostResponse | null>
   */
  createPost: async (data: CreatePostRequest): Promise<CreatePostResponse | null> => {
    try {
      const response = await http.post<CreatePostResponse>('/post/save', data);
      return response.data;
    } catch (error) {
      console.error('Error creating post:', error);
      return null;
    }
  },

  /**
   * Upload media file
   * @param data - Media upload data
   * @returns Promise<MediaUploadResponse | null>
   */
  uploadMedia: async (data: MediaUploadRequest): Promise<MediaUploadResponse | null> => {
    try {
      const response = await http.post<MediaUploadResponse>('/media/upload', data);
      return response.data;
    } catch (error) {
      console.error('Error uploading media:', error);
      return null;
    }
  }
};
