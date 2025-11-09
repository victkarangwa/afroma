import { getTimeAgo } from '@/utils/timeAgo';
import { getUserInitials } from '@/utils/userInitials';

// Example usage of the new post display features

// 1. Time ago formatting examples
export const timeAgoExamples = () => {
  const now = new Date();
  const examples = [
    new Date(now.getTime() - 30 * 1000).toISOString(), // 30 seconds ago
    new Date(now.getTime() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    new Date(now.getTime() - 2 * 7 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks ago
    new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString(), // 6 months ago
    new Date(now.getTime() - 2 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 2 years ago
  ];

  examples.forEach(date => {
    console.log(`${date} → ${getTimeAgo(date)}`);
  });
};

// 2. User initials examples
export const userInitialsExamples = () => {
  const users = [
    { firstname: 'John', lastname: 'Doe' },
    { firstname: 'Jane', lastname: 'Smith' },
    { firstname: 'Bob', lastname: 'Johnson' },
    { firstname: 'Alice', lastname: 'Williams' },
    { firstname: 'Charlie', lastname: 'Brown' },
  ];

  users.forEach(user => {
    const initials = getUserInitials(user.firstname, user.lastname);
    console.log(`${user.firstname} ${user.lastname} → ${initials}`);
  });
};

// 3. Complete post display example
export const postDisplayExample = () => {
  const samplePost = {
    id: 1,
    content: "Just had an amazing networking event! Met so many inspiring entrepreneurs. #Networking #TechAfrica",
    user: {
      firstname: "Sarah",
      lastname: "Chen"
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    likeCount: 15
  };

  console.log('Post Display Example:');
  console.log(`User: ${samplePost.user.firstname} ${samplePost.user.lastname}`);
  console.log(`Initials: ${getUserInitials(samplePost.user.firstname, samplePost.user.lastname)}`);
  console.log(`Time: ${getTimeAgo(samplePost.createdAt)}`);
  console.log(`Content: ${samplePost.content}`);
  console.log(`Likes: ${samplePost.likeCount}`);
};

// 4. Post with attachments example
export const postWithAttachmentsExample = () => {
  const samplePostWithAttachments = {
    id: 5,
    content: "I am trying to share something visible",
    user: {
      firstname: "Victor",
      lastname: "Karangwa"
    },
    createdAt: "2025-08-06T16:27:10.231+00:00",
    likeCount: 0,
    attachments: [
      {
        id: 22,
        thumbnailUrl: "https://uat-api.afroma.net/afroma-master-service/media/stream/mfbjllgqgzdathzw.jpg",
        mediaUrl: "https://uat-api.afroma.net/afroma-master-service/media/stream/mfbjllgqgzdathzw.jpg",
        fileName: "mfbjllgqgzdathzw.jpg",
        featured: true,
        mediaType: "PHOTO"
      }
    ]
  };

  console.log('Post with Attachments Example:');
  console.log(`User: ${samplePostWithAttachments.user.firstname} ${samplePostWithAttachments.user.lastname}`);
  console.log(`Initials: ${getUserInitials(samplePostWithAttachments.user.firstname, samplePostWithAttachments.user.lastname)}`);
  console.log(`Time: ${getTimeAgo(samplePostWithAttachments.createdAt)}`);
  console.log(`Content: ${samplePostWithAttachments.content}`);
  console.log(`Likes: ${samplePostWithAttachments.likeCount}`);
  console.log(`Attachments: ${samplePostWithAttachments.attachments.length} media items`);
  
  samplePostWithAttachments.attachments.forEach((attachment, index) => {
    console.log(`  Attachment ${index + 1}:`);
    console.log(`    ID: ${attachment.id}`);
    console.log(`    Type: ${attachment.mediaType}`);
    console.log(`    Featured: ${attachment.featured}`);
    console.log(`    URL: ${attachment.mediaUrl}`);
  });
};

// 5. React component example for post display
export const PostDisplayExample = () => {
  const post = {
    id: 1,
    content: "Exploring the beautiful landscapes of Rwanda! The mountains here are absolutely breathtaking. #TravelRwanda #Adventure",
    user: {
      firstname: "Michelle",
      lastname: "Ogilvy"
    },
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    likeCount: 18,
    attachments: [
      {
        id: 23,
        thumbnailUrl: "https://example.com/thumbnail1.jpg",
        mediaUrl: "https://example.com/image1.jpg",
        fileName: "image1.jpg",
        featured: true,
        mediaType: "PHOTO"
      }
    ]
  };

  return {
    userInitials: getUserInitials(post.user.firstname, post.user.lastname),
    timeAgo: getTimeAgo(post.createdAt),
    displayName: `${post.user.firstname} ${post.user.lastname}`,
    content: post.content,
    likes: post.likeCount,
    hasAttachments: post.attachments.length > 0,
    attachmentCount: post.attachments.length,
    featuredImage: post.attachments.find(att => att.featured)?.mediaUrl
  };
}; 