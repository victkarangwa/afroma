import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { tw } from "react-native-tailwindcss";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import NetworkingCard, { MOCK_NETWORKING_PROFILES, NetworkingProfile } from "../NetworkingCard";

const NetworkingSearch: React.FC = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedCollaborations, setSelectedCollaborations] = useState<string[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<NetworkingProfile[]>(MOCK_NETWORKING_PROFILES);

  // Get unique industries and collaborations from profiles
  const allIndustries = Array.from(new Set(MOCK_NETWORKING_PROFILES.flatMap(p => p.industries)));
  const allCollaborations = Array.from(new Set(MOCK_NETWORKING_PROFILES.flatMap(p => p.collaboration)));

  useEffect(() => {
    filterProfiles();
  }, [searchQuery, selectedIndustries, selectedCollaborations]);

  const filterProfiles = () => {
    let filtered = MOCK_NETWORKING_PROFILES;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(profile =>
        profile.name.toLowerCase().includes(query) ||
        profile.headline.toLowerCase().includes(query) ||
        profile.summary.toLowerCase().includes(query) ||
        profile.industries.some(industry => industry.toLowerCase().includes(query))
      );
    }

    // Filter by selected industries
    if (selectedIndustries.length > 0) {
      filtered = filtered.filter(profile =>
        profile.industries.some(industry => selectedIndustries.includes(industry))
      );
    }

    // Filter by selected collaborations
    if (selectedCollaborations.length > 0) {
      filtered = filtered.filter(profile =>
        profile.collaboration.some(collab => selectedCollaborations.includes(collab))
      );
    }

    setFilteredProfiles(filtered);
  };

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries(prev =>
      prev.includes(industry)
        ? prev.filter(i => i !== industry)
        : [...prev, industry]
    );
  };

  const toggleCollaboration = (collaboration: string) => {
    setSelectedCollaborations(prev =>
      prev.includes(collaboration)
        ? prev.filter(c => c !== collaboration)
        : [...prev, collaboration]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedIndustries([]);
    setSelectedCollaborations([]);
  };

  const handleConnect = (profileId: number) => {
    // Handle connection request
    console.log('Sending connection request to profile:', profileId);
    // In a real app, this would make an API call
  };

  const handleMessage = (profileId: number) => {
    // Handle message action
    console.log('Opening message with profile:', profileId);
    // In a real app, this would navigate to chat
  };

  const renderProfileCard = ({ item }: { item: NetworkingProfile }) => (
    <NetworkingCard
      profile={item}
      onConnect={handleConnect}
      onMessage={handleMessage}
    />
  );

  return (
    <SafeAreaView style={[tw.flex1, tw.bgGray100]}>
      {/* Header */}
      <View style={[tw.bgWhite, tw.pX4, tw.pT4, tw.pB2, tw.shadow]}>
        <View style={[tw.flexRow, tw.itemsCenter, tw.justifyBetween, tw.mB4]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#6b7280" />
          </TouchableOpacity>
          <Text style={[tw.textGray900, tw.fontBold, tw.textLg]}>Search People</Text>
          <TouchableOpacity onPress={clearFilters}>
            <Text style={[tw.textBlue500, tw.fontMedium]}>Clear</Text>
          </TouchableOpacity>
        </View>

        {/* Search Input */}
        <View style={[tw.flexRow, tw.itemsCenter, tw.bgGray100, tw.roundedLg, tw.pX4, tw.pY3, tw.mB4]}>
          <Ionicons name="search" size={20} color="#6b7280" />
          <TextInput
            style={[tw.flex1, tw.mL3, tw.textBase]}
            placeholder="Search by name, title, or industry..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[tw.mB4]}>
          {/* Industry Filters */}
          <View style={[tw.mR4]}>
            <Text style={[tw.textGray700, tw.fontMedium, tw.mB2]}>Industries</Text>
            <View style={[tw.flexRow, tw.flexWrap]}>
              {allIndustries.map((industry) => (
                <TouchableOpacity
                  key={industry}
                  style={[
                    tw.pX3,
                    tw.pY2,
                    tw.roundedFull,
                    tw.mR2,
                    tw.mB2,
                    selectedIndustries.includes(industry) ? tw.bgBlue500 : tw.bgGray200,
                  ]}
                  onPress={() => toggleIndustry(industry)}
                >
                  <Text
                    style={[
                      tw.textXs,
                      tw.fontMedium,
                      selectedIndustries.includes(industry) ? tw.textWhite : tw.textGray700,
                    ]}
                  >
                    {industry}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Collaboration Filters */}
          <View>
            <Text style={[tw.textGray700, tw.fontMedium, tw.mB2]}>Looking for</Text>
            <View style={[tw.flexRow, tw.flexWrap]}>
              {allCollaborations.map((collaboration) => (
                <TouchableOpacity
                  key={collaboration}
                  style={[
                    tw.pX3,
                    tw.pY2,
                    tw.roundedFull,
                    tw.mR2,
                    tw.mB2,
                    selectedCollaborations.includes(collaboration) ? tw.bgPink700 : tw.bgPink100,
                  ]}
                  onPress={() => toggleCollaboration(collaboration)}
                >
                  <Text
                    style={[
                      tw.textXs,
                      tw.fontMedium,
                      selectedCollaborations.includes(collaboration) ? tw.textWhite : tw.textPink700,
                    ]}
                  >
                    {collaboration}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Results */}
      <View style={[tw.flex1, tw.pT2]}>
        <View style={[tw.pX4, tw.mB2]}>
          <Text style={[tw.textGray600, tw.textSm]}>
            {filteredProfiles.length} {filteredProfiles.length === 1 ? 'person' : 'people'} found
          </Text>
        </View>
        
        <FlatList
          data={filteredProfiles}
          renderItem={renderProfileCard}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[{ paddingBottom: 80 }]}
        />
      </View>
    </SafeAreaView>
  );
};

export default NetworkingSearch; 