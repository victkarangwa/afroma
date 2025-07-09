import ButtonComponent from "@/components/Button";
import TextComponent from "@/components/Text";
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { tw } from "react-native-tailwindcss";
import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
import Constants from "expo-constants";
import useApiRequest from "@/hooks/useApiRequest";
import { ApiResponse, Product } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { paymentPlans } from "@/constants";
import Spinner from "@/components/Spinner";
import ModalComponent from "@/components/Modal";
import { useRouter } from "expo-router";

interface PaymentPlans {
  id: number;
  duration: string;
  months: number;
  description: string;
  recommended: boolean;
}
interface paymentResult {
  title: string;
  description: string;
  status: "error" | "success" | "warning" | "info";
  btnText: string;
  onDismiss: () => void;
}

const PaymentScreen = () => {
  const { loading, send, error } = useApiRequest<ApiResponse>();
  const router = useRouter();

  const [selectedTab, setSelectedTab] = useState(0);
  const [products, setProducts] = useState<[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Product | null>(null);
  const [paymentResult, setPaymentResult] = useState<paymentResult | null>(
    null
  );

  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const getProducts = async () => {
    const result = await send("get", "/bonded-user-service/products/list");
    setProducts(result);
    // console.log("===", result);
    setSelectedProduct(result[0]);
  };

  useEffect(() => {
    getProducts();
  }, []);

  const checkout = async () => {
    const result = await send(
      "post",
      "/bonded-user-service/payments/create-payment-intent",
      {
        productId: selectedPlan?.id,
        description: selectedPlan?.description,
        metadata: {
          additionalProp1: selectedPlan?.currency,
          additionalProp2: selectedPlan?.active,
          additionalProp3: selectedPlan?.price,
        },
      }
    );
// console.log("-------", result, selectedProduct);
    // ++++++OPEN PAYMENT SHEET++++++
    const { error } = await initPaymentSheet({
      merchantDisplayName: "Parenti App",
      paymentIntentClientSecret: result?.clientSecret,
      returnURL: 'afroma://payment-complete'
    });
    if (error) {
      // handle error
    }
    // ++++++++++++

    const { error: err } = await presentPaymentSheet();

    if (err) {
      console.log("Error", err);
      // handle error
      setPaymentResult({
        title: "Error",
        description: "Payment failed",
        status: "error",
        btnText: "Try Again",
        onDismiss: () => {
          setPaymentResult(null);
        },
      });
    } else {
      // success
      console.log("Success");
      setPaymentResult({
        title: "Success",
        description: "Payment successful",
        status: "success",
        btnText: "Continue Swiping",
        onDismiss: () => {
          setPaymentResult(null);
          router.push({ pathname: "/(tabs)" });
        },
      });
    }
  };

  // const formatProducts = (products: Product[]) => {
  //   return products.map((p) => {
  //     return {
  //       id: p.id,
  //       name: p.name,
  //       description: p.description,
  //       price: p.price,
  //       currency: p.currency,
  //       active: p.active,
  //     };
  //   });
  // };

  const renderTabContent = () => {
    switch (selectedTab) {
      case 0:
        return products.map((p, key) => (
          <TouchableOpacity
            style={[
              styles.planContainer,
              tw.textWhite,
              tw.mY2,
              tw.border,
              selectedPlan?.id === p.id ? tw.borderWhite : tw.borderGray700,
              tw.bgGray900,
            ]}
            key={key}
            onPress={() => setSelectedPlan(p)}
          >
            <Text style={styles.planTitle}>
              {p.duration}{" "}
              <Text style={[tw.textXs]}>
                ${p.price} / {p.description}
              </Text>
            </Text>
            <Text style={styles.planFeatures}>{p.description}</Text>
            {p.recommended && (
              <View
                style={[
                  tw.bgPink700,
                  tw.roundedFull,
                  tw.w8,
                  tw.h8,
                  tw.flex,
                  tw.justifyCenter,
                  tw.itemsCenter,
                  tw.absolute,
                  tw.top0,
                  tw.right0,
                  tw._m4,
                ]}
              >
                <Ionicons
                  name="diamond-sharp"
                  style={[tw.textPink100, tw.p2]}
                  size={16}
                  color="white"
                />
              </View>
            )}
          </TouchableOpacity>
        ));
      case 1:
        return products.map((p: Product) => (
          <View style={styles.planContainer} key={p?.id}>
            <Text style={styles.planTitle}>{p.name}</Text>
            <Text style={styles.planFeatures}>- {p.description}</Text>
            <Text style={styles.planAmount}>
              {p.currency} {p.price}
            </Text>
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
      <ModalComponent
        title={paymentResult?.title || ""}
        description={paymentResult?.description || ""}
        btnText={paymentResult?.btnText}
        onDismiss={paymentResult?.onDismiss || (() => {})}
        status={paymentResult?.status}
        visible={paymentResult !== null}
      />
      <View style={[styles.container, tw.bgPink100]}>
        <Text style={[styles.header, tw.textCenter, tw.textWhite]}>
          To unlock more features, upgrade your account
        </Text>
        {!products?.length ? (
          <Spinner />
        ) : (
          <>
            {/* <Text style={[styles.sectionTitle, tw.textCenter, tw.textWhite]}>Select Plan</Text> */}
            <View
              style={[
                tw.flex,
                tw.flexRow,
                tw.justifyCenter,
                tw.mY4,
                tw.bgGray200,
                tw.p2,
                tw.rounded,
              ]}
            >
              {[{ name: "Premium" }].map((p, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    handleTabChange(index);
                    setSelectedProduct(p);
                  }}
                  style={[
                    selectedTab === index && tw.bgWhite,
                    tw.shadowLg,
                    tw.rounded,
                    // tw.w1_2,
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
                    {p.name}
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
              Activate Plan
            </ButtonComponent>
          </>
        )}
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
    borderRadius: 10,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "white",
  },
  planFeatures: {
    fontSize: 12,
    marginBottom: 5,
    color: "gray",
  },
  planAmount: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    textTransform: "uppercase",
    color: "white",
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
