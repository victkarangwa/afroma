import React from "react";
import { StyleSheet, View, Text, ScrollView } from "react-native";

// Reusable FAQ Item Component
interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  return (
    <View style={styles.faqItem}>
      <Text style={styles.question}>{question}</Text>
      <Text style={styles.answer}>{answer}</Text>
    </View>
  );
};

// FAQ Screen Component
const FAQScreen = () => {
  // Full FAQ Data
  const faqData = [
    {
      section: "General Questions About Parenti",
      items: [
        {
          question: "What is Parenti?",
          answer:
            "Parenti is a U.S.-based platform designed for individuals and couples who aspire to become parents outside the traditional expectations of marriage or romantic relationships. It provides a secure and supportive space for co-parenting partnerships, welcoming individuals, LGBTQ+ users, and couples facing fertility challenges. Parenti is committed to fostering family-building connections based on mutual values and shared goals.",
        },
        {
          question: "Who can join Parenti?",
          answer:
            "Parenti is open to individuals aged 24 to 55 who are seeking a co-parenting partner. Public figures are also welcome, with options to match with regular users or other public figures.",
        },
        {
          question: "Is Parenti available globally?",
          answer:
            "Currently, Parenti is available in the United States, but global expansion is in the works.",
        },
        {
          question: "Do I need children to join Parenti?",
          answer:
            "No, Parenti is for those who are beginning their parenting journey, whether they already have children or are planning to have them in the future.",
        },
      ],
    },
    {
      section: "Features and Functionality",
      items: [
        {
          question: "How does Parenti work?",
          answer:
            "Users create detailed profiles outlining their parenting goals, values, and preferences. Free-tier users receive one swipe per day, while premium members enjoy unlimited swipes, advanced filters, and profile insights. Once matched, users can chat, verify their profiles, and discuss co-parenting goals.",
        },
        {
          question: "Can couples join Parenti?",
          answer:
            "Yes, couples struggling to conceive can join Parenti to find a co-parent who aligns with their family-building goals.",
        },
        {
          question: "Does Parenti welcome LGBTQ+ individuals?",
          answer:
            "Absolutely. Parenti is an inclusive platform for LGBTQ+ users seeking co-parenting partnerships.",
        },
        {
          question: "Does Parenti offer premium memberships?",
          answer:
            "Yes, premium memberships provide benefits such as unlimited swipes, advanced filters, incognito mode, and access to exclusive events.",
        },
        {
          question: "Can public figures join Parenti?",
          answer:
            "Yes, public figures can create private profiles and match with regular users or other public figures while maintaining their privacy.",
        },
        {
          question: "Does Parenti offer medical or fertility support?",
          answer:
            "Yes, Parenti refers matched users to trusted clinics and fertility specialists for expert guidance and support.",
        },
      ],
    },
    {
      section: "Privacy and Security",
      items: [
        {
          question: "How does Parenti protect my privacy?",
          answer:
            "Parenti uses advanced privacy features like incognito mode, private profile images, and robust security measures to safeguard user data. Public figures can opt for enhanced privacy settings.",
        },
        {
          question: "Can I verify my profile?",
          answer:
            "Yes, users can verify their identity, background, work, and health information. Verified profiles receive badges:\n\n• Star Check (Gold Badge): Full verification (identity, background, work, medical health, and personal references).\n• Blue Check: Basic verification (identity, personal references, and background).",
        },
        {
          question: "Are background checks mandatory?",
          answer:
            "No, background checks are optional but strongly recommended to build trust and improve matching opportunities. Parenti collaborates with third-party providers to conduct legitimate background checks.",
        },
        {
          question: "Does Parenti collect sensitive information?",
          answer:
            "Parenti collects sensitive information, such as health details and racial/ethnic origin, only with user consent. This data is used to enhance the matching process and overall user experience.",
        },
        {
          question: "Can users provide personal references?",
          answer:
            "Yes, users can choose to provide personal references to validate their trustworthiness and readiness for co-parenting.",
        },
      ],
    },
    {
      section: "Using the App",
      items: [
        {
          question: "How do I sign up?",
          answer:
            "You can sign up using your email, phone number, or Instagram/Facebook account. Simply download the app and follow the registration process.",
        },
        {
          question: "How does matching work?",
          answer:
            "Users swipe on profiles. Free-tier users get one swipe per day, while premium users enjoy unlimited swipes and advanced filters for better matches.",
        },
        {
          question: "What happens after matching?",
          answer:
            "Matched users can chat, share hidden photos, and discuss co-parenting goals. Verification options are available to enhance trust.",
        },
        {
          question: "Can I unmatch with someone?",
          answer:
            "Yes, you can unmatch at any time if the connection does not align with your goals.",
        },
        {
          question: "Can I pause my account?",
          answer:
            "Yes, you can pause your account and return whenever you are ready.",
        },
      ],
    },
    {
      section: "Payments and Memberships",
      items: [
        {
          question: "Is Parenti free to use?",
          answer:
            "Parenti offers a free tier with one swipe per day. Premium memberships unlock additional features, including unlimited swipes, advanced filters, and more.",
        },
        {
          question: "What are the premium membership plans?",
          answer:
            "• Weekly: $9.99 (Parenting Users) / $14.99 (Public Figures)\n• Monthly: $39.99 (Parenting Users) / $59.99 (Public Figures)\n• Quarterly: $89.99 (Parenting Users) / $149.99 (Public Figures)\n• Yearly: $239.99 (Parenting Users) / $359.99 (Public Figures)",
        },
        {
          question: "Can I cancel my subscription?",
          answer:
            "Yes, you can cancel your subscription anytime through your app store or account settings. Premium features remain active until the end of the billing cycle.",
        },
        {
          question: "Do you offer refunds?",
          answer:
            "Subscriptions are non-refundable. For billing concerns, please contact support@parenti.co.",
        },
      ],
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {faqData.map((section, index) => (
        <View key={index} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.section}</Text>
          {section.items.map((item, itemIndex) => (
            <FAQItem
              key={itemIndex}
              question={item.question}
              answer={item.answer}
            />
          ))}
        </View>
      ))}
    </ScrollView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#444",
  },
  faqItem: {
    marginBottom: 15,
  },
  question: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    color: "#333",
  },
  answer: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
  },
});

export default FAQScreen;
