import { postApi } from '@/http/postApi';
import { PostListRequest } from '@/types';

// Example usage of the post listing API

// 1. Get posts with default filters (published status)
const getDefaultPosts = async () => {
  try {
    const response = await postApi.getPosts(1, 20, '');
    if (response && response.success) {
      console.log('Posts loaded:', response.list.length);
      console.log('Total pages:', response.totalPages);
      console.log('Total records:', response.totalRecords);
    }
  } catch (error) {
    console.error('Error loading posts:', error);
  }
};

// 2. Get posts filtered by profile type
const getPostsByProfileType = async (profileType: string) => {
  try {
    const response = await postApi.getPosts(1, 20, '', /*profileType*/);
    if (response && response.success) {
      console.log(`${profileType} posts loaded:`, response.list.length);
      console.log('Request filters:', response.filters);
    }
  } catch (error) {
    console.error('Error loading posts:', error);
  }
};

// 2. Get posts with custom filters
const getCustomFilteredPosts = async () => {
  const requestData: PostListRequest = {
    filters: [
      {
        column: 'status',
        value: 'PUBLISHED',
        operator: '='
      },
      {
        column: 'profileType',
        value: 'NETWORKING',
        operator: '='
      }
    ],
    search: 'business',
    currentPage: 1,
    pageSize: 10
  };

  try {
    const response = await postApi.getPostList(requestData);
    if (response && response.success) {
      console.log('Filtered posts:', response.list);
    }
  } catch (error) {
    console.error('Error loading filtered posts:', error);
  }
};

// 3. Using the usePosts hook in a React component
/*
import { usePosts } from '@/hooks/usePosts';

const MyPostsComponent = () => {
  const {
    posts,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    searchPosts
  } = usePosts({
    initialPage: 1,
    pageSize: 20,
    autoLoad: true
  });

  if (loading) {
    return <Text>Loading posts...</Text>;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  return (
    <FlatList
      data={posts}
      renderItem={({ item }) => (
        <View>
          <Text>{item.content}</Text>
          <Text>{`${item.user.firstname} ${item.user.lastname}`}</Text>
        </View>
      )}
      onEndReached={loadMore}
      onEndReachedThreshold={0.1}
      onRefresh={refresh}
      refreshing={loading}
    />
  );
};
*/

// 4. Create a new post
const createNewPost = async (content: string, mediaFileIds?: number[]) => {
  try {
    const response = await postApi.createPost({
      content,
      mediaFileIds: mediaFileIds || []
    });
    
    if (response && response.success) {
      console.log('Post created successfully:', response.data);
      return response.data;
    } else {
      console.error('Failed to create post:', response?.message);
      return null;
    }
  } catch (error) {
    console.error('Error creating post:', error);
    return null;
  }
};

export { getDefaultPosts, getPostsByProfileType, getCustomFilteredPosts, createNewPost }; 