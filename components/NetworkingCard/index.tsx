import React from "react";
import { View, Text, Image } from "react-native";
import { tw } from "react-native-tailwindcss";

// Mock data for networking profiles
export const MOCK_NETWORKING_PROFILES = [
  {
    id: 1,
    name: "Linda Mensah",
    headline: "Product Manager at FinTech Africa",
    summary: "Building digital products for financial inclusion. Passionate about mentoring women in tech.",
    photo: "https://randomuser.me/api/portraits/women/12.jpg",
    industries: ["Technology", "Finance"],
    collaboration: ["Mentoring", "Partnerships"],
  },
  {
    id: 2,
    name: "Kwame Boateng",
    headline: "Founder, EduConnect",
    summary: "Connecting students with global learning opportunities. Always open to new partnerships.",
    photo: "https://randomuser.me/api/portraits/men/13.jpg",
    industries: ["Education", "Technology"],
    collaboration: ["Partnerships", "Job Opportunities"],
  },
  {
    id: 3,
    name: "Fatima Diallo",
    headline: "Marketing Strategist",
    summary: "Helping brands grow in Africa. Let's collaborate on creative campaigns!",
    photo: "https://randomuser.me/api/portraits/women/14.jpg",
    industries: ["Marketing", "Design"],
    collaboration: ["Partnerships", "Mentoring"],
  },
  {
    id: 4,
    name: "Samuel Okoro",
    headline: "Healthcare Consultant",
    summary: "Improving healthcare systems across West Africa. Interested in health tech partnerships.",
    photo: "https://randomuser.me/api/portraits/men/14.jpg",
    industries: ["Healthcare", "Consulting"],
    collaboration: ["Job Opportunities", "Partnerships"],
  },
];

// Mock data for networking posts (people sharing about events they attended)
export const MOCK_NETWORKING_POSTS = [
  {
    id: 1,
    user: { 
      name: "Sarah Chen", 
      avatar: "https://randomuser.me/api/portraits/women/15.jpg",
      headline: "Product Manager at TechCorp"
    },
    timestamp: "2h ago",
    location: "Nairobi, Kenya",
    caption: "Just wrapped up an incredible session at the African Tech Summit! 🚀 Met so many inspiring entrepreneurs and learned about the latest innovations in fintech. The energy here is absolutely electric! #AfricanTechSummit #Networking #Innovation",
    images: [
      "https://picsum.photos/400/300?random=201",
      "https://picsum.photos/400/300?random=202"
    ],
    likes: 124,
    comments: 23,
    shares: 8,
    isBookmarked: false,
    tags: ["#AfricanTechSummit", "#Networking", "#Innovation"]
  },
  {
    id: 2,
    user: { 
      name: "David Martinez", 
      avatar: "https://randomuser.me/api/portraits/men/16.jpg",
      headline: "Startup Founder"
    },
    timestamp: "4h ago",
    location: "Lagos, Nigeria",
    caption: "Amazing workshop on startup funding today! 💡 Got some incredible insights from successful entrepreneurs and investors. The startup ecosystem in Nigeria is really thriving. Ready to take my company to the next level! #StartupFunding #Entrepreneurship #Nigeria",
    images: [
      "https://picsum.photos/400/300?random=203"
    ],
    likes: 89,
    comments: 15,
    shares: 12,
    isBookmarked: true,
    tags: ["#StartupFunding", "#Entrepreneurship", "#Nigeria"]
  },
  {
    id: 3,
    user: { 
      name: "Aisha Hassan", 
      avatar: "https://randomuser.me/api/portraits/women/17.jpg",
      headline: "Software Engineer"
    },
    timestamp: "6h ago",
    location: "Cape Town, South Africa",
    caption: "Fantastic Women in Tech meetup tonight! 👩‍💻 So inspiring to connect with other women in the industry. We discussed challenges, shared experiences, and built amazing connections. The tech community here is incredibly supportive! #WomenInTech #Networking #CapeTown",
    images: [
      "https://picsum.photos/400/300?random=204",
      "https://picsum.photos/400/300?random=205",
      "https://picsum.photos/400/300?random=206"
    ],
    likes: 156,
    comments: 31,
    shares: 19,
    isBookmarked: false,
    tags: ["#WomenInTech", "#Networking", "#CapeTown"]
  },
  {
    id: 4,
    user: { 
      name: "Michael Osei", 
      avatar: "https://randomuser.me/api/portraits/men/18.jpg",
      headline: "FinTech Consultant"
    },
    timestamp: "8h ago",
    location: "Accra, Ghana",
    caption: "Just finished presenting at the FinTech Innovation Summit! 🏦 Great discussions about the future of digital banking in Africa. The potential for financial inclusion through technology is enormous. Met some brilliant minds in the industry! #FinTech #Innovation #Ghana",
    images: [
      "https://picsum.photos/400/300?random=207"
    ],
    likes: 203,
    comments: 42,
    shares: 25,
    isBookmarked: false,
    tags: ["#FinTech", "#Innovation", "#Ghana"]
  },
  {
    id: 5,
    user: { 
      name: "Zara Kimani", 
      avatar: "https://randomuser.me/api/portraits/women/19.jpg",
      headline: "AI Researcher"
    },
    timestamp: "1d ago",
    location: "Kigali, Rwanda",
    caption: "48 hours of pure innovation at the AI for Social Good Hackathon! 🤖 Our team built an AI solution for early disease detection in rural communities. The creativity and passion here is incredible. So proud of what we accomplished! #AI #SocialImpact #Hackathon",
    images: [
      "https://picsum.photos/400/300?random=208",
      "https://picsum.photos/400/300?random=209"
    ],
    likes: 278,
    comments: 67,
    shares: 34,
    isBookmarked: true,
    tags: ["#AI", "#SocialImpact", "#Hackathon"]
  },
];

export type NetworkingProfile = typeof MOCK_NETWORKING_PROFILES[0];
export type NetworkingPost = typeof MOCK_NETWORKING_POSTS[0];

interface NetworkingCardProps {
  profile: NetworkingProfile;
}

const NetworkingCard: React.FC<NetworkingCardProps> = ({ profile }) => (
  <View style={[tw.bgWhite, tw.roundedLg, tw.mB4, tw.shadow, tw.mX4, tw.p4, tw.flexRow]}> 
    <Image
      source={{ uri: profile.photo }}
      style={[tw.w20, tw.h20, tw.rounded]}
      resizeMode="cover"
    />
    <View style={[tw.flex1, tw.mL4, tw.justifyCenter]}> 
      <Text style={[tw.textGray900, tw.fontBold, tw.textLg]}>{profile.name}</Text>
      <Text style={[tw.textGray700, tw.textBase, tw.mT1]}>{profile.headline}</Text>
      <Text style={[tw.textGray600, tw.textSm, tw.mT2]} numberOfLines={3}>{profile.summary}</Text>
      <View style={[tw.flexRow, tw.flexWrap, tw.mT2]}> 
        {profile.industries.map((industry, idx) => (
          <View key={idx} style={[tw.bgGray200, tw.roundedFull, tw.pX3, tw.pY1, tw.mR2, tw.mB1]}>
            <Text style={[tw.textGray700, tw.textXs]}>{industry}</Text>
          </View>
        ))}
      </View>
      <View style={[tw.flexRow, tw.flexWrap, tw.mT1]}> 
        {profile.collaboration.map((item, idx) => (
          <View key={idx} style={[tw.bgPink100, tw.roundedFull, tw.pX3, tw.pY1, tw.mR2, tw.mB1]}>
            <Text style={[tw.textPink700, tw.textXs, tw.fontBold]}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  </View>
);

export default NetworkingCard; 