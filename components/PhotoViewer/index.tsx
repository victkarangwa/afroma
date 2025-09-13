import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Image,
  StatusBar,
  SafeAreaView,
  PanGestureHandler,
  PinchGestureHandler,
  State,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tw } from 'react-native-tailwindcss';
import ImageWithFallback from '@/components/ImageWithFallback';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface PhotoViewerProps {
  visible: boolean;
  onClose: () => void;
  photos: Array<{
    id: number;
    thumbnailUrl: string;
    mediaUrl: string;
    fileName: string;
    featured: boolean;
    mediaType: string;
  }>;
  initialIndex?: number;
}

const PhotoViewer: React.FC<PhotoViewerProps> = ({
  visible,
  onClose,
  photos,
  initialIndex = 0
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      scrollViewRef.current?.scrollTo({
        x: (currentIndex - 1) * screenWidth,
        animated: true
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < photos.length - 1) {
      setCurrentIndex(currentIndex + 1);
      scrollViewRef.current?.scrollTo({
        x: (currentIndex + 1) * screenWidth,
        animated: true
      });
    }
  };

  const handleScroll = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / screenWidth);
    setCurrentIndex(index);
  };

  const handleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  if (!visible || photos.length === 0) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <StatusBar hidden />
      <SafeAreaView style={[tw.flex1, tw.bgBlack]}>
        {/* Header */}
        <View style={[tw.absolute, tw.top0, tw.left0, tw.right0, tw.z10, tw.pT4, tw.pX4]}>
          <View style={[tw.flexRow, tw.itemsCenter, tw.justifyBetween]}>
            <TouchableOpacity
              onPress={onClose}
              style={[tw.w10, tw.h10, tw.roundedFull, tw.bgBlack, tw.bgOpacity50, tw.justifyCenter, tw.itemsCenter]}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            
            <View style={[tw.flexRow, tw.itemsCenter]}>
              <Text style={[tw.textWhite, tw.textBase, tw.fontMedium]}>
                {currentIndex + 1} of {photos.length}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleZoom}
              style={[tw.w10, tw.h10, tw.roundedFull, tw.bgBlack, tw.bgOpacity50, tw.justifyCenter, tw.itemsCenter]}
            >
              <Ionicons name={isZoomed ? "contract" : "expand"} size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Photo Content */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          style={[tw.flex1]}
          contentContainerStyle={[tw.itemsCenter, tw.justifyCenter]}
        >
          {photos.map((photo, index) => (
            <View
              key={photo.id}
              style={[
                tw.wFull,
                tw.hFull,
                tw.justifyCenter,
                tw.itemsCenter,
                { width: screenWidth }
              ]}
            >
              <ImageWithFallback
                source={{ uri: photo.mediaUrl }}
                style={[
                  tw.wFull,
                  isZoomed ? { height: screenHeight * 0.8 } : { height: screenHeight * 0.6 },
                  tw.roundedLg
                ]}
                resizeMode={isZoomed ? "contain" : "cover"}
                fallbackSource={null}
              />
            </View>
          ))}
        </ScrollView>

        {/* Navigation Buttons */}
        {photos.length > 1 && (
          <>
            {/* Previous Button */}
            {currentIndex > 0 && (
              <TouchableOpacity
                onPress={handlePrevious}
                style={[
                  tw.absolute,
                  tw.left4,
                  tw.topHalf,
                  tw.w12,
                  tw.h12,
                  tw.roundedFull,
                  tw.bgBlack,
                  tw.bgOpacity50,
                  tw.justifyCenter,
                  tw.itemsCenter,
                  { transform: [{ translateY: -24 }] }
                ]}
              >
                <Ionicons name="chevron-back" size={24} color="white" />
              </TouchableOpacity>
            )}

            {/* Next Button */}
            {currentIndex < photos.length - 1 && (
              <TouchableOpacity
                onPress={handleNext}
                style={[
                  tw.absolute,
                  tw.right4,
                  tw.topHalf,
                  tw.w12,
                  tw.h12,
                  tw.roundedFull,
                  tw.bgBlack,
                  tw.bgOpacity50,
                  tw.justifyCenter,
                  tw.itemsCenter,
                  { transform: [{ translateY: -24 }] }
                ]}
              >
                <Ionicons name="chevron-forward" size={24} color="white" />
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Thumbnail Strip */}
        {photos.length > 1 && (
          <View style={[tw.absolute, tw.bottom0, tw.left0, tw.right0, tw.p4, tw.bgBlack, tw.bgOpacity30]}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={[tw.flexRow, tw.spaceX2]}
            >
              {photos.map((photo, index) => (
                <TouchableOpacity
                  key={photo.id}
                  onPress={() => {
                    setCurrentIndex(index);
                    scrollViewRef.current?.scrollTo({
                      x: index * screenWidth,
                      animated: true
                    });
                  }}
                  style={[
                    tw.w16,
                    tw.h16,
                    tw.roundedLg,
                    tw.overflowHidden,
                    tw.border2,
                    currentIndex === index ? tw.borderWhite : tw.borderTransparent
                  ]}
                >
                  <ImageWithFallback
                    source={{ uri: photo.thumbnailUrl }}
                    style={[tw.wFull, tw.hFull]}
                    resizeMode="cover"
                    fallbackSource={null}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

export default PhotoViewer;
