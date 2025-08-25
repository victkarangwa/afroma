import { usePosts } from '@/hooks/usePosts';

/**
 * Example usage of pagination with usePosts hook
 */
export const PaginationExample = () => {
  // Initialize with pagination options
  const {
    posts,
    loading,
    error,
    hasMore,
    currentPage,
    totalPages,
    totalRecords,
    loadMore,
    refresh,
    searchPosts
  } = usePosts({
    initialPage: 1,
    pageSize: 10, // Load 10 posts per page
    autoLoad: true,
    profileType: 'TRAVEL' // Filter by profile type
  });

  // Example: Load more posts when user scrolls to bottom
  const handleLoadMore = () => {
    if (hasMore && !loading) {
      loadMore();
    }
  };

  // Example: Search posts with pagination
  const handleSearch = (searchTerm: string) => {
    searchPosts(searchTerm);
  };

  // Example: Refresh posts (resets to page 1)
  const handleRefresh = () => {
    refresh();
  };

  return {
    posts,
    loading,
    error,
    hasMore,
    currentPage,
    totalPages,
    totalRecords,
    handleLoadMore,
    handleSearch,
    handleRefresh
  };
};

/**
 * Example API request structure for pagination
 */
export const paginationRequestExample = {
  filters: [
    {
      column: "status",
      value: "PUBLISHED",
      operator: "="
    },
    {
      column: "profileType",
      value: "TRAVEL",
      operator: "="
    }
  ],
  search: "travel adventure",
  currentPage: 2, // Request page 2
  pageSize: 10 // 10 items per page
};

/**
 * Example API response structure for pagination
 */
export const paginationResponseExample = {
  success: true,
  message: "Executed successfully",
  list: [
    // Array of posts
  ],
  filters: [
    {
      column: "status",
      value: "PUBLISHED",
      operator: "="
    }
  ],
  totalPages: 5, // Total number of pages
  totalRecords: 50, // Total number of records
  pageSize: 10, // Items per page
  currentPage: 2 // Current page number
}; 