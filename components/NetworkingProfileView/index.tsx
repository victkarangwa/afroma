import React from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, Alert, Dimensions } from "react-native";
import { tw } from "react-native-tailwindcss";
import { Ionicons } from "@expo/vector-icons";
import { NetworkingProfile } from "../NetworkingCard";

interface NetworkingProfileViewProps {
  profile: NetworkingProfile;
  visible: boolean;
  onClose: () => void;
  onConnect?: (profileId: number) => void;
  onMessage?: (profileId: number) => void;
}

const NetworkingProfileView: React.FC<NetworkingProfileViewProps> = ({
  profile,
  visible,
  onClose,
  onConnect,
  onMessage
}) => {
  if (!visible) return null;

  const { height: screenHeight } = Dimensions.get('window');

  const getConnectionButton = () => {
    switch (profile.connectionStatus) {
      case "connected":
        return (
          <TouchableOpacity
            style={[tw.bgPink700, tw.roundedLg, tw.pX6, tw.pY3, tw.flexRow, tw.itemsCenter, tw.justifyCenter]}
            onPress={() => onMessage?.(profile.id)}
          >
            <Ionicons name="chatbubble-outline" size={20} color="white" />
            <Text style={[tw.textWhite, tw.fontBold, tw.mL2]}>Message</Text>
          </TouchableOpacity>
        );
      case "pending":
        return (
          <View style={[tw.bgGray400, tw.roundedLg, tw.pX6, tw.pY3, tw.flexRow, tw.itemsCenter, tw.justifyCenter]}>
            <Ionicons name="time-outline" size={20} color="white" />
            <Text style={[tw.textWhite, tw.fontBold, tw.mL2]}>Request Pending</Text>
          </View>
        );
      default:
        return (
          <View style={[tw.flexRow, tw.spaceX3]}>
            <TouchableOpacity
              style={[tw.flex1, tw.bgPink700, tw.roundedLg, tw.pX6, tw.pY3, tw.flexRow, tw.itemsCenter, tw.justifyCenter]}
              onPress={() => onConnect?.(profile.id)}
            >
              <Ionicons name="person-add-outline" size={20} color="white" />
              <Text style={[tw.textWhite, tw.fontBold, tw.mL2]}>Connect</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[tw.flex1, tw.bgGray500, tw.roundedLg, tw.pX6, tw.pY3, tw.flexRow, tw.itemsCenter, tw.justifyCenter]}
              onPress={() => onMessage?.(profile.id)}
            >
              <Ionicons name="chatbubble-outline" size={20} color="white" />
              <Text style={[tw.textWhite, tw.fontBold, tw.mL2]}>Message</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  const getConnectionStatusText = () => {
    switch (profile.connectionStatus) {
      case "connected":
        return { text: "Connected", color: "text-green-600", bgColor: "bg-green-100" };
      case "pending":
        return { text: "Request Pending", color: "text-yellow-600", bgColor: "bg-yellow-100" };
      default:
        return { text: "Not Connected", color: "text-gray-600", bgColor: "bg-gray-100" };
    }
  };

  const statusInfo = getConnectionStatusText();

  return (
    <View style={[
      tw.absolute, 
      { 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16
      }
    ]}>
      <View style={[
        tw.bgWhite, 
        tw.roundedXl, 
        { 
          width: '100%', 
          maxWidth: 400, 
          maxHeight: screenHeight * 0.9,
          minHeight: 500,
          overflow: 'hidden'
        }
      ]}>
        {/* Header */}
        <View style={[tw.bgPink700, tw.p4, tw.flexRow, tw.itemsCenter, tw.justifyBetween]}>
          <Text style={[tw.textWhite, tw.fontBold, tw.textLg]}>Profile Details</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView style={[tw.flex1, tw.p4]} showsVerticalScrollIndicator={false}>
          {/* Profile Image and Basic Info */}
          <View style={[tw.flexRow, tw.mB4]}>
            <Image
              source={{ uri: profile.photo }}
              style={[tw.w20, tw.h20, tw.roundedFull]}
              resizeMode="cover"
            />
            <View style={[tw.flex1, tw.mL4, tw.justifyCenter]}>
              <Text style={[tw.textGray900, tw.fontBold, tw.textXl]}>{profile.name}</Text>
              <Text style={[tw.textGray700, tw.textBase, tw.mT1]}>{profile.headline}</Text>
              <View style={[tw.flexRow, tw.itemsCenter, tw.mT2]}>
                <View style={[tw.bgGray100, tw.roundedFull, tw.pX3, tw.pY1]}>
                  <Text style={[tw.textGray600, tw.textXs, tw.fontMedium]}>{statusInfo.text}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Summary */}
          <View style={[tw.mB4]}>
            <Text style={[tw.textGray900, tw.fontBold, tw.textLg, tw.mB2]}>About</Text>
            <Text style={[tw.textGray700, tw.textBase, tw.leading6]}>{profile.summary}</Text>
          </View>

          {/* Industries */}
          <View style={[tw.mB4]}>
            <Text style={[tw.textGray900, tw.fontBold, tw.textLg, tw.mB2]}>Industries</Text>
            <View style={[tw.flexRow, tw.flexWrap]}>
              {profile.industries.map((industry, idx) => (
                <View key={idx} style={[tw.bgGray200, tw.roundedFull, tw.pX3, tw.pY1, tw.mR2, tw.mB1]}>
                  <Text style={[tw.textGray700, tw.textSm, tw.fontMedium]}>{industry}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Collaboration Preferences */}
          <View style={[tw.mB4]}>
            <Text style={[tw.textGray900, tw.fontBold, tw.textLg, tw.mB2]}>Looking For</Text>
            <View style={[tw.flexRow, tw.flexWrap]}>
              {profile.collaboration.map((item, idx) => (
                <View key={idx} style={[tw.bgPink100, tw.roundedFull, tw.pX3, tw.pY1, tw.mR2, tw.mB1]}>
                  <Text style={[tw.textPink700, tw.textSm, tw.fontBold]}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Connection Status */}
          <View style={[tw.mB4]}>
            <Text style={[tw.textGray900, tw.fontBold, tw.textLg, tw.mB2]}>Connection Status</Text>
            <View style={[tw.bgGray100, tw.roundedLg, tw.p3]}>
              <View style={[tw.flexRow, tw.itemsCenter]}>
                <Ionicons 
                  name={profile.connectionStatus === "connected" ? "checkmark-circle" : 
                        profile.connectionStatus === "pending" ? "time" : "person-outline"} 
                  size={20} 
                  color={profile.connectionStatus === "connected" ? "#059669" : 
                         profile.connectionStatus === "pending" ? "#d97706" : "#6b7280"} 
                />
                <Text style={[tw.textGray700, tw.textBase, tw.mL2, tw.fontMedium]}>{statusInfo.text}</Text>
              </View>
              {profile.connectionStatus === "connected" && (
                <Text style={[tw.textGray600, tw.textSm, tw.mT1]}>You can now message this person directly.</Text>
              )}
              {profile.connectionStatus === "pending" && (
                <Text style={[tw.textGray600, tw.textSm, tw.mT1]}>Your connection request is awaiting approval.</Text>
              )}
              {profile.connectionStatus === "none" && (
                <Text style={[tw.textGray600, tw.textSm, tw.mT1]}>Send a connection request to start networking.</Text>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={[tw.p4, tw.borderT, tw.borderGray200]}>
          {getConnectionButton()}
        </View>
      </View>
    </View>
  );
};

export default NetworkingProfileView; 