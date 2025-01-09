import ButtonComponent from "@/components/Button";
import TextComponent from "@/components/Text";
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { tw } from "react-native-tailwindcss";
import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
import Constants from "expo-constants";
import useApiRequest from "@/hooks/useApiRequest";
import { ApiResponse, Product } from "@/types";

const PaymentScreen = () => {
  const { loading, send, error } = useApiRequest<ApiResponse>();

  const [selectedTab, setSelectedTab] = useState(0);
  const [intentClientSecret, setIntentClientSecret] = useState("");
  const [products, setProducts] = useState<[]>([]);

  const paymentPlan = ["Monthly", "Yearly"];

  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const getProducts = async () => {
    const result = await send("get", "/bonded-user-service/products/list");
    setProducts(result);
    console.log("Products", result);
  };

  const setup = async () => {
    const { error } = await initPaymentSheet({
      merchantDisplayName: "Bonded App",
      paymentIntentClientSecret:
      intentClientSecret,
    });
    if (error) {
      // handle error
    }
  };

  useEffect(() => {
    setup();
    getProducts();
  }, []);

  const checkout = async () => {
    const result = await send(
      "post",
      "/bonded-user-service/payments/create-payment-intent",
      {
        productId: 1,
        quantity: 1,
        description: "Premium Package",
        metadata: {
          additionalProp1: "Prop 1",
          additionalProp2: "Prop 2",
          additionalProp3: "Prop 3",
        },
      }
    );
    setIntentClientSecret(result?.clientSecret);

    console.log("INTENT====>", result?.clientSecret);

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
        return products.map((p: Product) => (
          <View style={styles.planContainer} key={p?.id}>
            <Text style={styles.planTitle}>{p.name}</Text>
            <Text style={styles.planFeatures}>- {p.description}</Text>
            <Text style={styles.planAmount}>{p.currency} {p.price}</Text>
          </View>
        ));
      case 1:
        return products.map((p: Product) => (
          <View style={styles.planContainer} key={p?.id}>
            <Text style={styles.planTitle}>{p.name}</Text>
            <Text style={styles.planFeatures}>- {p.description}</Text>
            <Text style={styles.planAmount}>{p.currency} {p.price}</Text>
          </View>
        ));
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
        <ButtonComponent
          mode="contained"
          loading={loading}
          onPress={checkout}
          style={[tw.mT8]}
        >
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
    textTransform: "uppercase",
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
