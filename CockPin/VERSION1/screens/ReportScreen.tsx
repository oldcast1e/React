"use client";

import { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  Modal,
  Dimensions,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  type Region,
} from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { useTrash } from "../context/TrashContext";

// 제주도 중심 좌표
const JEJU_REGION: Region = {
  latitude: 33.4996,
  longitude: 126.5312,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

// 제주도 행정구역 데이터
const JEJU_REGIONS = {
  제주시: [
    "한림읍",
    "애월읍",
    "구좌읍",
    "조천읍",
    "한경면",
    "추자면",
    "우도면",
    "일도1동",
    "일도2동",
    "이도1동",
    "이도2동",
    "삼도1동",
    "삼도2동",
    "용담1동",
    "용담2동",
    "건입동",
    "화북동",
    "삼양동",
    "봉개동",
    "아라동",
    "오라동",
    "연동",
    "노형동",
    "외도동",
    "이호동",
    "도두동",
  ],
  서귀포시: [
    "대정읍",
    "남원읍",
    "성산읍",
    "안덕면",
    "표선면",
    "송산동",
    "정방동",
    "중앙동",
    "천지동",
    "효돈동",
    "영천동",
    "동홍동",
    "서홍동",
    "대륜동",
    "대천동",
    "중문동",
    "예래동",
  ],
};

// 주소 검색 예시
const ADDRESS_EXAMPLES = [
  "제주시 삼성로",
  "서귀포시 중문관광로",
  "애월읍 애월해안로",
  "구좌읍 세화해안로",
  "성산읍 일출로",
  "한림읍 한림로",
];

const ReportScreen = () => {
  const { addReport } = useTrash();
  const [image, setImage] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [customLocation, setCustomLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [addressInputMode, setAddressInputMode] = useState<
    "current" | "custom"
  >("current");
  const [markerDraggable, setMarkerDraggable] = useState(true); // 기본적으로 핀 이동 가능하도록 변경
  const [randomExample, setRandomExample] = useState("");

  const mapRef = useRef<MapView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // 랜덤 주소 예시 선택
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * ADDRESS_EXAMPLES.length);
    setRandomExample(ADDRESS_EXAMPLES[randomIndex]);
  }, []);

  // 초기 위치 설정
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("권한 필요", "위치 정보 접근 권한이 필요합니다.");
        return;
      }

      try {
        setIsLoading(true);

        // 기본 위치를 제주도로 설정
        const defaultLocation = {
          coords: {
            latitude: JEJU_REGION.latitude,
            longitude: JEJU_REGION.longitude,
            altitude: null,
            accuracy: null,
            altitudeAccuracy: null,
            heading: null,
            speed: null,
          },
          timestamp: Date.now(),
        };

        // 현재 위치 가져오기 시도
        let currentLocation;
        try {
          currentLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 5000,
          });

          // 제주도 영역 내에 있는지 확인 (대략적인 경계)
          const isInJeju =
            currentLocation.coords.latitude >= 33.0 &&
            currentLocation.coords.latitude <= 34.0 &&
            currentLocation.coords.longitude >= 126.0 &&
            currentLocation.coords.longitude <= 127.0;

          if (!isInJeju) {
            console.log(
              "현재 위치가 제주도 영역 밖입니다. 기본 위치(제주도)를 사용합니다."
            );
            currentLocation = defaultLocation;
          }
        } catch (error) {
          console.log(
            "위치 정보를 가져오는데 실패했습니다. 기본 위치(제주도)를 사용합니다."
          );
          currentLocation = defaultLocation;
        }

        setLocation(currentLocation);

        // 좌표로부터 주소 가져오기
        const addressResponse = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });

        if (addressResponse.length > 0) {
          const addressData = addressResponse[0];
          const formattedAddress = [
            addressData.region,
            addressData.district,
            addressData.street,
            addressData.name,
          ]
            .filter(Boolean)
            .join(" ");

          setAddress(formattedAddress);
        }
      } catch (error) {
        console.error("Error getting location:", error);
        Alert.alert("오류", "위치 정보를 가져오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // 주소 검색 결과 업데이트
  useEffect(() => {
    if (searchQuery.length > 0) {
      // 제주도 행정구역 데이터에서 검색
      const results: string[] = [];

      // 행정시 검색
      if ("제주시".includes(searchQuery) || "서귀포시".includes(searchQuery)) {
        if ("제주시".includes(searchQuery)) results.push("제주시");
        if ("서귀포시".includes(searchQuery)) results.push("서귀포시");
      }

      // 읍/면/동 검색
      Object.entries(JEJU_REGIONS).forEach(([city, districts]) => {
        districts.forEach((district) => {
          if (district.includes(searchQuery)) {
            results.push(`${city} ${district}`);
          }
        });
      });

      // 예시 주소에서 검색
      ADDRESS_EXAMPLES.forEach((example) => {
        if (example.includes(searchQuery) && !results.includes(example)) {
          results.push(example);
        }
      });

      setSearchResults(results);

      // 검색 결과 애니메이션
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      setSearchResults([]);
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [searchQuery]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("권한 필요", "사진 라이브러리 접근 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("권한 필요", "카메라 접근 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const searchAddress = async (query: string) => {
    setSearchQuery(query);
  };

  const selectAddress = async (selectedAddress: string) => {
    setAddress(selectedAddress);
    setSearchQuery("");
    setSearchResults([]);
    setAddressInputMode("custom");

    try {
      // 주소를 좌표로 변환 (지오코딩)
      const geocodeResult = await Location.geocodeAsync(selectedAddress);

      if (geocodeResult.length > 0) {
        const { latitude, longitude } = geocodeResult[0];

        // 커스텀 위치 설정
        setCustomLocation({ latitude, longitude });

        // 지도 이동
        mapRef.current?.animateToRegion(
          {
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          1000
        );
      }
    } catch (error) {
      console.error("Error geocoding address:", error);
      Alert.alert("오류", "주소를 찾을 수 없습니다.");
    }

    setAddressModalVisible(false);
  };

  const handleMarkerDrag = (e: any) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setCustomLocation({ latitude, longitude });
    setAddressInputMode("custom");

    // 드래그한 위치의 주소 가져오기
    (async () => {
      try {
        const addressResponse = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (addressResponse.length > 0) {
          const addressData = addressResponse[0];
          const formattedAddress = [
            addressData.region,
            addressData.district,
            addressData.street,
            addressData.name,
          ]
            .filter(Boolean)
            .join(" ");

          setAddress(formattedAddress);
        }
      } catch (error) {
        console.error("Error getting address from coordinates:", error);
      }
    })();
  };

  const toggleMarkerDraggable = () => {
    setMarkerDraggable(!markerDraggable);

    if (!markerDraggable) {
      Alert.alert(
        "핀 이동 모드",
        "지도에서 핀을 드래그하여 정확한 위치를 지정할 수 있습니다.",
        [{ text: "확인" }]
      );
    }
  };

  const handleSubmit = async () => {
    if (!image) {
      Alert.alert("오류", "쓰레기 사진을 촬영하거나 선택해주세요.");
      return;
    }

    if (!address) {
      Alert.alert("오류", "위치 주소를 입력해주세요.");
      return;
    }

    if (!location && !customLocation) {
      Alert.alert("오류", "위치 정보를 가져올 수 없습니다.");
      return;
    }

    try {
      setIsSubmitting(true);

      // 주소에서 지역과 구역 추출
      const addressParts = address.split(" ");
      const region = addressParts[0] || ""; // 제주시 or 서귀포시
      const district = addressParts[1] || ""; // 읍/면/동

      // 현재 위치 또는 커스텀 위치 사용
      const coords =
        customLocation ||
        (location
          ? {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }
          : null);

      if (!coords) {
        throw new Error("위치 정보가 없습니다.");
      }

      await addReport({
        image,
        address,
        latitude: coords.latitude,
        longitude: coords.longitude,
        region,
        district,
      });

      Alert.alert(
        "신고 완료",
        "해양 쓰레기 신고가 성공적으로 접수되었습니다.",
        [
          {
            text: "확인",
            onPress: () => {
              // 폼 초기화
              setImage(null);
              setAddress("");
              setCustomLocation(null);
              setMarkerDraggable(true);
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error submitting report:", error);
      Alert.alert("오류", "신고 제출 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "right", "left"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons
                name="information-circle-outline"
                size={24}
                color="#3498db"
              />
              <Text style={styles.sectionTitle}>해양 쓰레기 신고</Text>
            </View>
            <Text style={styles.sectionDescription}>
              제주 올레길에서 발견한 해양 쓰레기를 신고해주세요. 사진과 위치
              정보를 등록하면 관계 기관이나 봉사자가 확인 후 수거 작업을
              진행합니다.
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="camera-outline" size={24} color="#3498db" />
              <Text style={styles.sectionTitle}>쓰레기 사진 등록</Text>
            </View>

            {image ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: image }} style={styles.image} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setImage(null)}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={24}
                    color="white"
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.imagePickerContainer}>
                <TouchableOpacity
                  style={styles.imagePickerButton}
                  onPress={takePhoto}
                >
                  <Ionicons name="camera-outline" size={30} color="#3498db" />
                  <Text style={styles.imagePickerText}>사진 촬영</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.imagePickerButton}
                  onPress={pickImage}
                >
                  <Ionicons name="images-outline" size={30} color="#3498db" />
                  <Text style={styles.imagePickerText}>갤러리에서 선택</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location-outline" size={24} color="#3498db" />
              <Text style={styles.sectionTitle}>위치 정보 등록</Text>
            </View>

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3498db" />
                <Text style={styles.loadingText}>
                  위치 정보를 가져오는 중...
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.addressInputContainer}>
                  <View style={styles.addressHeader}>
                    <Text style={styles.addressLabel}>주소</Text>
                    <TouchableOpacity
                      style={styles.addressEditButton}
                      onPress={() => setAddressModalVisible(true)}
                    >
                      <Ionicons
                        name="search-outline"
                        size={18}
                        color="#3498db"
                      />
                      <Text style={styles.addressEditText}>주소 검색</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.addressDisplay}>
                    <Ionicons
                      name="location-outline"
                      size={20}
                      color="#e74c3c"
                      style={styles.addressIcon}
                    />
                    <Text style={styles.addressText}>
                      {address || "주소를 검색해주세요"}
                    </Text>
                  </View>

                  <View style={styles.locationOptions}>
                    <TouchableOpacity
                      style={[
                        styles.locationOption,
                        addressInputMode === "current" &&
                          styles.locationOptionActive,
                      ]}
                      onPress={() => {
                        setAddressInputMode("current");
                        if (location) {
                          setCustomLocation(null);
                          mapRef.current?.animateToRegion(
                            {
                              latitude: location.coords.latitude,
                              longitude: location.coords.longitude,
                              latitudeDelta: 0.01,
                              longitudeDelta: 0.01,
                            },
                            1000
                          );
                        }
                      }}
                    >
                      <Ionicons
                        name="navigate-outline"
                        size={16}
                        color={
                          addressInputMode === "current" ? "white" : "#7f8c8d"
                        }
                      />
                      <Text
                        style={[
                          styles.locationOptionText,
                          addressInputMode === "current" &&
                            styles.locationOptionTextActive,
                        ]}
                      >
                        현재 위치 사용
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.locationOption,
                        addressInputMode === "custom" &&
                          styles.locationOptionActive,
                      ]}
                      onPress={() => {
                        setAddressInputMode("custom");
                        setAddressModalVisible(true);
                      }}
                    >
                      <Ionicons
                        name="search-outline"
                        size={16}
                        color={
                          addressInputMode === "custom" ? "white" : "#7f8c8d"
                        }
                      />
                      <Text
                        style={[
                          styles.locationOptionText,
                          addressInputMode === "custom" &&
                            styles.locationOptionTextActive,
                        ]}
                      >
                        주소 직접 입력
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.mapContainer}>
                  <MapView
                    ref={mapRef}
                    style={styles.map}
                    provider={
                      Platform.OS === "android" ? PROVIDER_GOOGLE : undefined
                    }
                    initialRegion={JEJU_REGION}
                  >
                    {customLocation ? (
                      <Marker
                        coordinate={{
                          latitude: customLocation.latitude,
                          longitude: customLocation.longitude,
                        }}
                        title="쓰레기 위치"
                        description={address}
                        draggable={markerDraggable}
                        onDragEnd={handleMarkerDrag}
                        pinColor="#e74c3c"
                      />
                    ) : location ? (
                      <Marker
                        coordinate={{
                          latitude: location.coords.latitude,
                          longitude: location.coords.longitude,
                        }}
                        title="쓰레기 위치"
                        description={address}
                        draggable={markerDraggable}
                        onDragEnd={handleMarkerDrag}
                        pinColor="#e74c3c"
                      />
                    ) : null}
                  </MapView>

                  <TouchableOpacity
                    style={[
                      styles.markerDragButton,
                      markerDraggable && styles.markerDragButtonActive,
                    ]}
                    onPress={toggleMarkerDraggable}
                  >
                    <Ionicons
                      name={markerDraggable ? "location" : "location-outline"}
                      size={20}
                      color={markerDraggable ? "white" : "#3498db"}
                    />
                    <Text
                      style={[
                        styles.markerDragButtonText,
                        markerDraggable && styles.markerDragButtonTextActive,
                      ]}
                    >
                      {markerDraggable ? "핀 이동 모드 켜짐" : "핀 이동 모드"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              (isSubmitting || !image || !address) &&
                styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting || !image || !address}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons
                  name="send-outline"
                  size={20}
                  color="white"
                  style={styles.submitIcon}
                />
                <Text style={styles.submitButtonText}>신고 제출하기</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 주소 검색 모달 */}
      <Modal
        visible={addressModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddressModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>주소 검색</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setAddressModalVisible(false)}
              >
                <Ionicons name="close-outline" size={24} color="#7f8c8d" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDescription}>
              제주도 내 위치를 검색하세요. 예: {randomExample}
            </Text>

            <View style={styles.searchInputContainer}>
              <Ionicons
                name="search-outline"
                size={20}
                color="#7f8c8d"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="제주도 내 주소 검색"
                value={searchQuery}
                onChangeText={searchAddress}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => setSearchQuery("")}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={18}
                    color="#7f8c8d"
                  />
                </TouchableOpacity>
              )}
            </View>

            <Animated.ScrollView
              style={[styles.searchResults, { opacity: fadeAnim }]}
              keyboardShouldPersistTaps="handled"
            >
              {searchResults.length > 0 ? (
                searchResults.map((result, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.searchResultItem}
                    onPress={() => selectAddress(result)}
                  >
                    <Ionicons
                      name="location-outline"
                      size={20}
                      color="#3498db"
                      style={styles.resultIcon}
                    />
                    <Text style={styles.resultText}>{result}</Text>
                  </TouchableOpacity>
                ))
              ) : searchQuery.length > 0 ? (
                <View style={styles.noResultsContainer}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={40}
                    color="#bdc3c7"
                  />
                  <Text style={styles.noResultsText}>검색 결과가 없습니다</Text>
                  <Text style={styles.noResultsSubtext}>
                    다른 검색어를 입력해보세요
                  </Text>
                </View>
              ) : null}
            </Animated.ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  scrollContent: {
    padding: 15,
  },
  section: {
    marginBottom: 20,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginLeft: 10,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#7f8c8d",
    lineHeight: 20,
  },
  imageContainer: {
    position: "relative",
    marginTop: 10,
    borderRadius: 10,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 250,
    borderRadius: 10,
  },
  removeImageButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 15,
    padding: 5,
  },
  imagePickerContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  imagePickerButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    padding: 20,
    width: "45%",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  imagePickerText: {
    marginTop: 10,
    color: "#3498db",
    fontWeight: "500",
  },
  addressInputContainer: {
    marginTop: 10,
  },
  addressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2c3e50",
  },
  addressEditButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f8ff",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  addressEditText: {
    color: "#3498db",
    fontSize: 14,
    marginLeft: 5,
  },
  addressDisplay: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  addressIcon: {
    marginRight: 10,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    color: "#34495e",
  },
  locationOptions: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "space-between",
  },
  locationOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    width: "48%",
    justifyContent: "center",
  },
  locationOptionActive: {
    backgroundColor: "#3498db",
    borderColor: "#3498db",
  },
  locationOptionText: {
    fontSize: 14,
    color: "#7f8c8d",
    marginLeft: 5,
  },
  locationOptionTextActive: {
    color: "white",
  },
  mapContainer: {
    marginTop: 15,
    borderRadius: 10,
    overflow: "hidden",
    height: 250,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  markerDragButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  markerDragButtonActive: {
    backgroundColor: "#3498db",
  },
  markerDragButtonText: {
    fontSize: 12,
    color: "#3498db",
    marginLeft: 5,
  },
  markerDragButtonTextActive: {
    color: "white",
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: "#7f8c8d",
  },
  submitButton: {
    backgroundColor: "#3498db",
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    marginBottom: 30,
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: "#bdc3c7",
  },
  submitIcon: {
    marginRight: 10,
  },
  submitButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: Dimensions.get("window").height * 0.8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  modalCloseButton: {
    padding: 5,
  },
  modalDescription: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 15,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginBottom: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  clearButton: {
    padding: 5,
  },
  searchResults: {
    flex: 1,
  },
  searchResultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  resultIcon: {
    marginRight: 10,
  },
  resultText: {
    fontSize: 16,
    color: "#2c3e50",
  },
  noResultsContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#7f8c8d",
    marginTop: 10,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: "#95a5a6",
    marginTop: 5,
  },
});

export default ReportScreen;
