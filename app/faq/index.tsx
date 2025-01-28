import { faqData } from "@/constants";
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
