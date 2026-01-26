"use client";

import { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  useWindowDimensions,
  TouchableOpacity,
  ImageBackground,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { MainScreenNavigationProp } from "../types/navigation";

const MainScreen = () => {
  const { width } = useWindowDimensions();
  // 올바른 타입으로 네비게이션 정의
  const navigation = useNavigation<MainScreenNavigationProp>();
  const [activeFeature, setActiveFeature] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const featuresRef = useRef(null);

  // 앱 기능 소개 데이터
  const features = [
    {
      icon: "camera-outline",
      title: "쓰레기 신고",
      description:
        "사진 촬영 및 위치 등록으로 간편하게 해양 쓰레기를 신고할 수 있습니다.",
    },
    {
      icon: "list-outline",
      title: "현황 확인",
      description: "신고된 쓰레기의 처리 상태를 실시간으로 확인할 수 있습니다.",
    },
    {
      icon: "map-outline",
      title: "지역 필터링",
      description: "지역별로 신고 현황을 필터링하여 볼 수 있습니다.",
    },
    {
      icon: "analytics-outline",
      title: "통계 확인",
      description: "쓰레기 수거 현황과 지역별 통계를 확인할 수 있습니다.",
    },
  ];

  // 자동 스크롤 기능 추가
  const handleScroll = (event) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const slideWidth = width - 40;
    const currentIndex = Math.round(scrollX / slideWidth);

    // 현재 인덱스가 변경되었을 때만 상태 업데이트
    if (currentIndex !== activeFeature) {
      setActiveFeature(currentIndex);
    }
  };

  // 스크롤 종료 시 자동으로 가운데 정렬
  const handleScrollEnd = (event) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    const slideWidth = width - 40;
    const currentIndex = Math.round(scrollX / slideWidth);

    // 자동으로 가운데 정렬
    featuresRef.current?.scrollToOffset({
      offset: currentIndex * slideWidth,
      animated: true,
    });
  };

  // 사용자 흐름 데이터
  const flowSteps = [
    {
      step: 1,
      title: "쓰레기 발견",
      description: "올레길을 걷다가 해양 쓰레기를 발견합니다.",
    },
    {
      step: 2,
      title: "사진 촬영 및 위치 등록",
      description: "쓰레기 사진을 촬영하고 위치를 등록합니다.",
    },
    {
      step: 3,
      title: "신고 제출",
      description: "신고를 제출하면 지도에 핀으로 표시됩니다.",
    },
    {
      step: 4,
      title: "처리 현황 확인",
      description: "신고한 쓰레기의 처리 현황을 확인할 수 있습니다.",
    },
  ];

  // 시작하기 버튼 클릭 핸들러
  const handleStartPress = () => {
    // 이제 타입 오류 없이 네비게이션 가능
    navigation.navigate("쓰레기 신고");
  };

  // 앱 기능 소개 렌더링 함수
  const renderFeatureItem = ({ item, index }) => {
    const isActive = index === activeFeature;

    return (
      <View style={[styles.featureSlide, { width: width - 40 }]}>
        <View
          style={[styles.featureIconContainer, { backgroundColor: "#e8f4fd" }]}
        >
          <Ionicons
            name={item.icon as keyof typeof Ionicons.glyphMap}
            size={40}
            color="#3498db"
          />
        </View>
        <Text style={styles.featureTitle}>{item.title}</Text>
        <Text style={styles.featureDescription}>{item.description}</Text>
      </View>
    );
  };

  // 사용자 흐름 렌더링 함수
  const renderFlowStep = (step, index) => {
    return (
      <View key={index} style={styles.flowStep}>
        <View style={styles.flowNumberContainer}>
          <Text style={styles.flowNumberText}>{step.step}</Text>
        </View>
        <View style={styles.flowContent}>
          <Text style={styles.flowTitle}>{step.title}</Text>
          <Text style={styles.flowDescription} numberOfLines={1}>
            {step.description}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "right", "left"]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 섹션 */}
        <View style={styles.headerContainer}>
          <ImageBackground
            source={require("../assets/image/ocean.png")}
            style={styles.headerBackground}
            resizeMode="cover"
          >
            <View style={styles.headerOverlay}>
              <Image
                source={require("../assets/image/icon.png")}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.title}>핀콕 (PinCock)</Text>
              <Text style={styles.subtitle}>
                제주 올레길 해양 쓰레기 신고 플랫폼
              </Text>

              <TouchableOpacity
                style={styles.startButton}
                onPress={handleStartPress}
              >
                <Text style={styles.startButtonText}>시작하기</Text>
                <Ionicons
                  name="arrow-forward-outline"
                  size={18}
                  color="white"
                />
              </TouchableOpacity>
            </View>
          </ImageBackground>
        </View>

        {/* 프로젝트 소개 섹션 */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons
              name="information-circle-outline"
              size={24}
              color="#3498db"
            />
            <Text style={styles.sectionTitle}>핀콕 프로젝트 소개</Text>
          </View>

          <Text style={styles.sectionContent}>
            핀콕(PinCock)은 제주 올레길에서 발견되는 해양 쓰레기를 손쉽게
            신고하고 처리 현황을 추적할 수 있는 모바일 플랫폼입니다.
          </Text>

          <View style={styles.infoCard}>
            <Ionicons
              name="alert-circle-outline"
              size={22}
              color="#e74c3c"
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>
              제주 올레길은 해안과 인접해 있어 해양 쓰레기가 자주 밀려오지만,
              이를 즉각 신고하고 처리 현황을 공유할 수 있는 체계가 부족합니다.
            </Text>
          </View>

          <Image
            source={require("../assets/image/ocean.png")}
            style={styles.sectionImage}
            resizeMode="cover"
          />
        </View>

        {/* 앱 기능 소개 섹션 - 좌우 드래그 방식으로 변경 */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="apps-outline" size={24} color="#3498db" />
            <Text style={styles.sectionTitle}>핀콕 앱 기능 소개</Text>
          </View>

          <View style={styles.featureSliderContainer}>
            <FlatList
              ref={featuresRef}
              data={features}
              renderItem={renderFeatureItem}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              snapToInterval={width - 40}
              decelerationRate="fast"
              onScroll={handleScroll}
              onMomentumScrollEnd={handleScrollEnd}
              snapToAlignment="center"
            />
          </View>

          <View style={styles.featureIndicatorContainer}>
            {features.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.featureIndicator,
                  index === activeFeature && styles.featureIndicatorActive,
                ]}
                onPress={() => {
                  setActiveFeature(index);
                  featuresRef.current?.scrollToOffset({
                    offset: index * (width - 40),
                    animated: true,
                  });
                }}
              />
            ))}
          </View>
        </View>

        {/* 사용자 흐름 섹션 - 기존 방식으로 복원 */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="git-network-outline" size={24} color="#3498db" />
            <Text style={styles.sectionTitle}>사용자 흐름</Text>
          </View>

          <View style={styles.flowContainer}>
            {flowSteps.map((step, index) => renderFlowStep(step, index))}
          </View>
        </View>

        {/* 기대 효과 섹션 */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="trending-up-outline" size={24} color="#3498db" />
            <Text style={styles.sectionTitle}>플랫폼의 기대 효과</Text>
          </View>

          <View style={styles.effectsContainer}>
            {[
              {
                icon: "leaf-outline",
                title: "환경 보호",
                description:
                  "제주 올레길의 해양 쓰레기 문제 해결에 기여합니다.",
              },
              {
                icon: "people-outline",
                title: "참여 증진",
                description:
                  "지역 주민과 관광객의 환경 보호 활동 참여를 증진합니다.",
              },
              {
                icon: "water-outline",
                title: "자연 정화",
                description:
                  "제주 자연환경의 신속한 정화 및 보존에 도움이 됩니다.",
              },
              {
                icon: "earth-outline",
                title: "인식 제고",
                description:
                  "환경 문제에 대한 인식 제고 및 공동체 의식을 함양합니다.",
              },
            ].map((effect, index) => (
              <View key={index} style={styles.effectCard}>
                <View style={styles.effectIconContainer}>
                  <Ionicons
                    name={effect.icon as keyof typeof Ionicons.glyphMap}
                    size={28}
                    color="#3498db"
                  />
                </View>
                <Text style={styles.effectTitle}>{effect.title}</Text>
                <Text style={styles.effectDescription}>
                  {effect.description}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  scrollContent: {
    paddingBottom: 30,
  },
  headerContainer: {
    width: "100%",
    height: 300,
    marginBottom: 20,
  },
  headerBackground: {
    width: "100%",
    height: "100%",
  },
  headerOverlay: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 15,
    borderRadius: 40,
    backgroundColor: "white",
    padding: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    marginBottom: 25,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  startButton: {
    flexDirection: "row",
    backgroundColor: "#3498db",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  startButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginRight: 8,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 25,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginLeft: 10,
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
    color: "#34495e",
    marginBottom: 15,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#fef9e7",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: "#f39c12",
  },
  infoIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: "#7f8c8d",
  },
  sectionImage: {
    height: 180,
    width: "100%",
    borderRadius: 10,
  },
  // 앱 기능 소개 - 슬라이더 스타일
  featureSliderContainer: {
    marginTop: 10,
    height: 200,
  },
  featureSlide: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  featureIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 10,
  },
  featureDescription: {
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "center",
    lineHeight: 20,
  },
  featureIndicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 15,
  },
  featureIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#bdc3c7",
    marginHorizontal: 4,
  },
  featureIndicatorActive: {
    width: 16,
    backgroundColor: "#3498db",
  },
  // 사용자 흐름 - 기존 방식 스타일
  flowContainer: {
    marginTop: 10,
  },
  flowStep: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#3498db",
  },
  flowNumberContainer: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#3498db",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  flowNumberText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  flowContent: {
    flex: 1,
  },
  flowTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 5,
  },
  flowDescription: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  effectsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  effectCard: {
    width: "48%",
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  effectIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#e8f4fd",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  effectTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 5,
    textAlign: "center",
  },
  effectDescription: {
    fontSize: 14,
    color: "#7f8c8d",
    lineHeight: 20,
    textAlign: "center",
  },
});

export default MainScreen;
