import ButtonComponent from "@/components/Button";
import TextComponent from "@/components/Text";
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { tw } from "react-native-tailwindcss";
import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
import Constants from "expo-constants";

const PaymentScreen = () => {
  const [selectedTab, setSelectedTab] = useState(0);

  const paymentPlan = ["Monthly", "Yearly"];

  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const setup = async () => {
    const { error } = await initPaymentSheet({
      merchantDisplayName: "Bonded App",
      paymentIntentClientSecret: Constants.expoConfig?.extra?.stripeSecretKey,
    });
    if (error) {
      // handle error
    }
  };

  useEffect(() => {
    setup();
  }, []);

  const checkout = async () => {
    const { error } = await presentPaymentSheet();

    if (error) {
      console.log("Error", error);
      // handle error
    } else {
      console.log("Success");
      // success
    }
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 0:
        return (
          <View style={styles.planContainer}>
            <Text style={styles.planTitle}>Monthly Plan</Text>
            <Text style={styles.planFeatures}>- Unlimited likes</Text>
            <Text style={styles.planFeatures}>- View and share pictures</Text>
            <Text style={styles.planAmount}>$9.99/month</Text>
          </View>
        );
      case 1:
        return (
          <View style={styles.planContainer}>
            <Text style={styles.planTitle}>Yearly Plan</Text>
            <Text style={styles.planFeatures}>- Video Calling</Text>
            <Text style={styles.planFeatures}>- AI data processing</Text>
            <Text style={styles.planAmount}>$99.99/year</Text>
            <Text style={styles.recommendBadge}>Recommended</Text>
          </View>
        );
      default:
        return null;
    }
  };

  const handleTabChange = (tab: number) => {
    setSelectedTab(tab);
  };
  return (
    <StripeProvider
      publishableKey={Constants.expoConfig?.extra?.stripePublishableKey}
      // merchantIdentifier="merchant.identifier" // required for Apple Pay
    >
      <View style={styles.container}>
        <Text style={[styles.header, tw.textCenter]}>
          Daily limit exceeded, upgrade your account
        </Text>
        <Text style={[styles.sectionTitle, tw.textCenter]}>Select Plan</Text>
        <View
          style={[
            tw.flex,
            tw.flexRow,
            tw.justifyBetween,
            tw.m4,
            tw.bgGray200,
            tw.p2,
            tw.rounded,
          ]}
        >
          {paymentPlan.map((plan, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleTabChange(index)}
              style={[
                selectedTab === index && tw.bgWhite,
                tw.shadowLg,
                tw.rounded,
                tw.w1_2,
              ]}
            >
              <TextComponent
                style={[
                  tw.pY2,
                  tw.pX4,
                  selectedTab === index && tw.fontBold,
                  tw.textBlack,
                  tw.textCenter,
                ]}
              >
                {plan}
              </TextComponent>
            </TouchableOpacity>
          ))}
        </View>
        {renderTabContent()}
        <ButtonComponent mode="contained" onPress={checkout} style={[tw.mT8]}>
          Upgrade
        </ButtonComponent>
      </View>
    </StripeProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  tabsContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#ccc",
  },
  tabText: {
    fontSize: 16,
    color: "#000",
  },
  activeTabText: {
    fontSize: 16,
    color: "#eca899",
    fontWeight: "bold",
  },
  planContainer: {
    padding: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  planFeatures: {
    fontSize: 16,
    marginBottom: 5,
  },
  planAmount: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  recommendBadge: {
    marginTop: 10,
    padding: 5,
    backgroundColor: "#ff0",
    color: "#000",
    fontWeight: "bold",
    alignSelf: "flex-start",
  },
});

export default PaymentScreen;
