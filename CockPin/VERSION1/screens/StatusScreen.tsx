"use client";

import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  Platform,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from "react-native-maps";
import {
  useTrash,
  type TrashReport,
  type TrashStatus,
} from "../context/TrashContext";
import Svg, { Circle, G, Path } from "react-native-svg";

// PieChart 컴포넌트를 수정하여 백분율 기반으로 일정한 크기의 원그래프를 그리도록 수정합니다.
// 원형 차트 컴포넌트
const PieChart = ({ data, style, onSlicePress }) => {
  // 데이터의 총합 계산
  const total = data.reduce((sum, item) => sum + item.value, 0);

  // 원 차트 크기 설정
  const size = 200;
  const radius = size / 2;
  const innerRadius = radius * 0.6; // 내부 원 크기 (도넛 차트 효과)

  // 각 항목의 각도 계산
  let startAngle = 0;
  const slices = data.map((item, index) => {
    const percentage = total > 0 ? item.value / total : 0;
    const angle = percentage * 2 * Math.PI;
    const slice = {
      key: item.key,
      value: item.value,
      percentage,
      startAngle,
      endAngle: startAngle + angle,
      color: item.svg.fill,
      index,
    };
    startAngle += angle;
    return slice;
  });

  // SVG 경로 생성 함수 - 오류 수정
  const createArc = (startAngle, endAngle, radius, innerRadius) => {
    // 완전한 원인 경우 (360도) 또는 데이터가 없는 경우
    if (endAngle - startAngle >= 2 * Math.PI - 0.001 || total === 0) {
      return `M ${radius} 0
              A ${radius} ${radius} 0 1 1 ${radius - 0.01} 0
              A ${radius} ${radius} 0 1 1 ${radius} 0
              Z
              M ${radius} ${radius - innerRadius}
              A ${innerRadius} ${innerRadius} 0 1 1 ${radius - 0.01} ${
        radius - innerRadius
      }
              A ${innerRadius} ${innerRadius} 0 1 1 ${radius} ${
        radius - innerRadius
      }
              Z`;
    }

    // 원호의 시작점과 끝점 계산
    const startX = radius + Math.sin(startAngle) * radius;
    const startY = radius - Math.cos(startAngle) * radius;
    const endX = radius + Math.sin(endAngle) * radius;
    const endY = radius - Math.cos(endAngle) * radius;

    // 내부 원호의 시작점과 끝점 계산
    const startX2 = radius + Math.sin(endAngle) * innerRadius;
    const startY2 = radius - Math.cos(endAngle) * innerRadius;
    const endX2 = radius + Math.sin(startAngle) * innerRadius;
    const endY2 = radius - Math.cos(startAngle) * innerRadius;

    // 큰 호(large arc)인지 여부 결정
    const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;

    // SVG 경로 문자열 생성
    return `M ${startX} ${startY}
            A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}
            L ${startX2} ${startY2}
            A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${endX2} ${endY2}
            Z`;
  };

  return (
    <View style={[styles.pieChartWrapper, style]}>
      <View style={styles.pieChartContainer}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <G>
            {total > 0 ? (
              slices.map((slice, index) => (
                <Path
                  key={index}
                  d={createArc(
                    slice.startAngle,
                    slice.endAngle,
                    radius,
                    innerRadius
                  )}
                  fill={slice.color}
                  onPress={() => onSlicePress && onSlicePress(data[index])}
                />
              ))
            ) : (
              // 데이터가 없는 경우 회색 원 표시
              <Circle cx={radius} cy={radius} r={radius} fill="#e0e0e0" />
            )}
            <Circle cx={radius} cy={radius} r={innerRadius} fill="white" />
          </G>
        </Svg>
        <View style={styles.pieChartCenter}>
          <Text style={styles.pieChartTotal}>{total}</Text>
          <Text style={styles.pieChartTotalLabel}>총 건수</Text>
        </View>
      </View>

      <View style={styles.legendContainer}>
        {data.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.legendItem}
            onPress={() => onSlicePress && onSlicePress(item)}
          >
            <View
              style={[styles.legendColor, { backgroundColor: item.svg.fill }]}
            />
            <Text style={styles.legendText}>{item.key}</Text>
            <Text style={styles.legendCount}>{item.value}건</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// 막대 그래프 컴포넌트
const BarChart = ({ data, style, onBarPress }) => {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <View style={[styles.barChartWrapper, style]}>
      <View style={styles.barChartContainer}>
        {data.map((item, index) => {
          const percentage = (item.value / maxValue) * 100;
          return (
            <TouchableOpacity
              key={index}
              style={styles.barItem}
              onPress={() => onBarPress && onBarPress(item)}
            >
              <View style={styles.barLabelContainer}>
                <Text style={styles.barLabel} numberOfLines={1}>
                  {item.key}
                </Text>
              </View>
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      width: `${percentage}%`,
                      backgroundColor:
                        item.color || item.svg?.fill || "#3498db",
                    },
                  ]}
                />
                <View style={styles.barValueContainer}>
                  <Text style={styles.barValue}>{item.value}건</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const { width, height } = Dimensions.get("window");

// 제주도 중심 좌표
const JEJU_REGION = {
  latitude: 33.4996,
  longitude: 126.5312,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

// 상태별 색상
const STATUS_COLORS = {
  "확인 대기 중": "#3498db", // 파란색
  확인됨: "#f39c12", // 주황색
  수거완료: "#2ecc71", // 녹색
};

// 지역별 색상 (제주시/서귀포시)
const REGION_COLORS = {
  제주시: "#3498db",
  서귀포시: "#9b59b6",
  기타: "#95a5a6",
};

// 읍면동별 색상
const DISTRICT_COLORS = [
  "#1abc9c",
  "#2ecc71",
  "#3498db",
  "#9b59b6",
  "#34495e",
  "#16a085",
  "#27ae60",
  "#2980b9",
  "#8e44ad",
  "#2c3e50",
  "#f1c40f",
  "#e67e22",
  "#e74c3c",
  "#ecf0f1",
  "#95a5a6",
  "#f39c12",
  "#d35400",
  "#c0392b",
  "#bdc3c7",
  "#7f8c8d",
];

type ViewMode = "status" | "region";
type RegionDetailMode = "overview" | "jeju" | "seogwipo" | "district";
type RegionViewMode = "city" | "district";

const StatusScreen = () => {
  const { reports, updateReportStatus, deleteReport } = useTrash();
  const [viewMode, setViewMode] = useState<ViewMode>("status");
  const [regionDetailMode, setRegionDetailMode] =
    useState<RegionDetailMode>("overview");
  const [regionViewMode, setRegionViewMode] = useState<RegionViewMode>("city");
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [regionData, setRegionData] = useState<any[]>([]);
  const [districtData, setDistrictData] = useState<any[]>([]);
  const [jejuDistrictData, setJejuDistrictData] = useState<any[]>([]);
  const [seogwipoDistrictData, setSeogwipoDistrictData] = useState<any[]>([]);
  const [districtDetailData, setDistrictDetailData] = useState<any[]>([]);
  const [recentReports, setRecentReports] = useState<TrashReport[]>([]);
  const [allReports, setAllReports] = useState<TrashReport[]>([]);
  const [showAllRecent, setShowAllRecent] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // 데이터 처리 함수
  const processData = () => {
    try {
      // 상태별 데이터 처리
      const statusCounts: Record<TrashStatus, number> = {
        "확인 대기 중": 0,
        확인됨: 0,
        수거완료: 0,
      };

      reports.forEach((report) => {
        statusCounts[report.status]++;
      });

      const statusChartData = Object.entries(statusCounts).map(
        ([status, count]) => ({
          key: status,
          count,
          svg: { fill: STATUS_COLORS[status as TrashStatus] },
          value: count,
        })
      );

      setStatusData(statusChartData);

      // 지역별 데이터 처리 (제주시/서귀포시)
      const regionCounts: Record<string, number> = {
        제주시: 0,
        서귀포시: 0,
        기타: 0,
      };

      reports.forEach((report) => {
        if (report.region === "제주시") {
          regionCounts["제주시"]++;
        } else if (report.region === "서귀포시") {
          regionCounts["서귀포시"]++;
        } else {
          regionCounts["기타"]++;
        }
      });

      const regionChartData = Object.entries(regionCounts)
        .filter(([_, count]) => count > 0)
        .map(([region, count]) => ({
          key: region,
          count,
          svg: {
            fill:
              REGION_COLORS[region as keyof typeof REGION_COLORS] || "#95a5a6",
          },
          value: count,
        }));

      setRegionData(regionChartData);

      // 전체 읍면동별 데이터
      const districtCounts: Record<string, number> = {};

      reports.forEach((report) => {
        if (report.district) {
          if (!districtCounts[report.district]) {
            districtCounts[report.district] = 0;
          }
          districtCounts[report.district]++;
        }
      });

      const districtChartData = Object.entries(districtCounts)
        .filter(([_, count]) => count > 0)
        .map(([district, count], index) => ({
          key: district,
          value: count,
          svg: { fill: DISTRICT_COLORS[index % DISTRICT_COLORS.length] },
          region: district.includes("읍")
            ? "읍"
            : district.includes("면")
            ? "면"
            : "동",
        }));

      setDistrictData(districtChartData);

      // 제주시 읍면동별 데이터
      const jejuDistrictCounts: Record<string, number> = {};

      reports.forEach((report) => {
        if (report.region === "제주시" && report.district) {
          if (!jejuDistrictCounts[report.district]) {
            jejuDistrictCounts[report.district] = 0;
          }
          jejuDistrictCounts[report.district]++;
        }
      });

      const jejuDistrictChartData = Object.entries(jejuDistrictCounts)
        .filter(([_, count]) => count > 0)
        .map(([district, count], index) => ({
          key: district,
          value: count,
          svg: { fill: DISTRICT_COLORS[index % DISTRICT_COLORS.length] },
          region: district.includes("읍")
            ? "읍"
            : district.includes("면")
            ? "면"
            : "동",
        }));

      setJejuDistrictData(jejuDistrictChartData);

      // 서귀포시 읍면동별 데이터
      const seogwipoDistrictCounts: Record<string, number> = {};

      reports.forEach((report) => {
        if (report.region === "서귀포시" && report.district) {
          if (!seogwipoDistrictCounts[report.district]) {
            seogwipoDistrictCounts[report.district] = 0;
          }
          seogwipoDistrictCounts[report.district]++;
        }
      });

      const seogwipoDistrictChartData = Object.entries(seogwipoDistrictCounts)
        .filter(([_, count]) => count > 0)
        .map(([district, count], index) => ({
          key: district,
          value: count,
          svg: { fill: DISTRICT_COLORS[index % DISTRICT_COLORS.length] },
          region: district.includes("읍")
            ? "읍"
            : district.includes("면")
            ? "면"
            : "동",
        }));

      setSeogwipoDistrictData(seogwipoDistrictChartData);

      // 선택된 구역의 상세 데이터 처리
      if (selectedDistrict) {
        const districtReports = reports.filter(
          (report) => report.district === selectedDistrict
        );

        // 선택된 구역의 상태별 데이터
        const districtStatusCounts: Record<TrashStatus, number> = {
          "확인 대기 중": 0,
          확인됨: 0,
          수거완료: 0,
        };

        districtReports.forEach((report) => {
          districtStatusCounts[report.status]++;
        });

        const districtStatusData = Object.entries(districtStatusCounts)
          .filter(([_, count]) => count > 0)
          .map(([status, count]) => ({
            key: status,
            value: count,
            svg: { fill: STATUS_COLORS[status as TrashStatus] },
          }));

        setDistrictDetailData(districtStatusData);
      }

      // 최근 7일 동안의 수거 완료 보고서
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const completedReports = reports
        .filter(
          (report) =>
            report.status === "수거완료" &&
            new Date(report.createdAt) >= sevenDaysAgo
        )
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

      setRecentReports(completedReports);

      // 모든 신고 내역 (관리자 패널용)
      const allReportsSorted = [...reports].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setAllReports(allReportsSorted);
    } catch (error) {
      console.error("Error processing data:", error);
    }
  };

  // 데이터 처리 useEffect
  useEffect(() => {
    setIsLoading(true);
    processData();
    setIsLoading(false);
  }, [reports, selectedDistrict]); // reports나 selectedDistrict가 변경될 때마다 데이터 처리 실행

  // 주기적 데이터 갱신을 위한 useEffect
  useEffect(() => {
    // 주기적으로 데이터 갱신 (5초마다)
    const intervalId = setInterval(() => {
      processData();
    }, 5000);

    // 컴포넌트 언마운트 시 인터벌 정리
    return () => {
      clearInterval(intervalId);
    };
  }, [selectedDistrict]);

  // 새로고침 처리
  const handleRefresh = React.useCallback(() => {
    setRefreshing(true);
    processData();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, [reports, selectedDistrict]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}.${String(date.getDate()).padStart(2, "0")} ${String(
      date.getHours()
    ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  // 데모용: 관리자 액션 시뮬레이션
  const handleUpdateStatus = (id: string, currentStatus: TrashStatus) => {
    let newStatus: TrashStatus;

    if (currentStatus === "확인 대기 중") {
      newStatus = "확인됨";
    } else if (currentStatus === "확인됨") {
      newStatus = "수거완료";
    } else {
      return; // 이미 완료됨
    }

    updateReportStatus(id, newStatus)
      .then(() => {
        // 상태 업데이트 후 데이터 다시 처리
        processData();
      })
      .catch((error) => {
        console.error("Error updating status:", error);
      });
  };

  // 신고 삭제 처리 함수
  const handleDeleteReport = (id: string) => {
    Alert.alert("신고 삭제", "이 신고를 정말 삭제하시겠습니까?", [
      {
        text: "취소",
        style: "cancel",
      },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          deleteReport(id)
            .then(() => {
              // 삭제 후 데이터 다시 처리
              processData();
            })
            .catch((error) => {
              console.error("Error deleting report:", error);
            });
        },
      },
    ]);
  };

  // 원 그래프 조각 클릭 처리
  const handleRegionSlicePress = (item) => {
    if (item.key === "제주시") {
      setRegionDetailMode("jeju");
    } else if (item.key === "서귀포시") {
      setRegionDetailMode("seogwipo");
    }
  };

  // 막대 그래프 항목 클릭 처리
  const handleDistrictBarPress = (item) => {
    setSelectedDistrict(item.key);
    setRegionDetailMode("district");
  };

  // 신고 아이템 렌더링 함수
  const renderReportItem = (item: TrashReport) => (
    <View key={item.id} style={styles.reportItem}>
      <View style={styles.reportHeader}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: STATUS_COLORS[item.status] },
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
        <Text style={styles.reportDate}>{formatDate(item.createdAt)}</Text>
      </View>

      <View style={styles.reportContent}>
        <Image source={{ uri: item.image }} style={styles.reportImage} />

        <View style={styles.reportDetails}>
          <Text style={styles.reportAddress} numberOfLines={2}>
            {item.address}
          </Text>

          <View style={styles.reportLocation}>
            <Ionicons name="location-outline" size={16} color="#7f8c8d" />
            <Text style={styles.reportLocationText}>
              {item.region || "지역 정보 없음"}{" "}
              {item.district ? `> ${item.district}` : ""}
            </Text>
          </View>

          {/* 데모: 관리자 액션 */}
          {item.status !== "수거완료" && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  backgroundColor:
                    STATUS_COLORS[
                      item.status === "확인 대기 중" ? "확인됨" : "수거완료"
                    ],
                },
              ]}
              onPress={() => handleUpdateStatus(item.id, item.status)}
            >
              <Text style={styles.actionButtonText}>
                {item.status === "확인 대기 중"
                  ? "확인 처리하기"
                  : "수거 완료하기"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );

  // 관리자 패널용 신고 아이템 렌더링 함수
  const renderAdminReportItem = (item: TrashReport) => (
    <View key={item.id} style={styles.adminReportItem}>
      <View style={styles.adminReportHeader}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: STATUS_COLORS[item.status] },
          ]}
        >
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
        <Text style={styles.reportDate}>{formatDate(item.createdAt)}</Text>
      </View>

      <View style={styles.adminReportContent}>
        <Image source={{ uri: item.image }} style={styles.adminReportImage} />

        <View style={styles.adminReportDetails}>
          <Text style={styles.reportAddress} numberOfLines={2}>
            {item.address}
          </Text>

          <View style={styles.reportLocation}>
            <Ionicons name="location-outline" size={16} color="#7f8c8d" />
            <Text style={styles.reportLocationText}>
              {item.region || "지역 정보 없음"}{" "}
              {item.district ? `> ${item.district}` : ""}
            </Text>
          </View>

          <View style={styles.adminActionButtons}>
            {item.status === "확인 대기 중" && (
              <TouchableOpacity
                style={[
                  styles.adminActionButton,
                  { backgroundColor: STATUS_COLORS["확인됨"] },
                ]}
                onPress={() => handleUpdateStatus(item.id, "확인 대기 중")}
              >
                <Text style={styles.adminActionButtonText}>확인 처리</Text>
              </TouchableOpacity>
            )}

            {item.status !== "수거완료" && (
              <TouchableOpacity
                style={[
                  styles.adminActionButton,
                  { backgroundColor: STATUS_COLORS["수거완료"] },
                ]}
                onPress={() => handleUpdateStatus(item.id, item.status)}
              >
                <Text style={styles.adminActionButtonText}>수거 완료</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.adminActionButton, { backgroundColor: "#e74c3c" }]}
              onPress={() => handleDeleteReport(item.id)}
            >
              <Text style={styles.adminActionButtonText}>삭제</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  // 쓰레기 현황 뷰 렌더링
  const renderStatusView = () => (
    <View style={styles.statusContainer}>
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>쓰레기 수거 현황</Text>
        {statusData.length > 0 ? (
          <PieChart
            data={statusData}
            style={styles.pieChart}
            onSlicePress={null}
          />
        ) : (
          <View style={styles.emptyChartContainer}>
            <Ionicons name="alert-circle-outline" size={50} color="#bdc3c7" />
            <Text style={styles.emptyChartText}>신고 내역이 없습니다</Text>
            <Text style={styles.emptyChartSubtext}>
              쓰레기 신고 탭에서 해양 쓰레기를 신고해보세요.
            </Text>
          </View>
        )}
        <Text style={styles.totalReportText}>
          총 신고 건수: {statusData.reduce((sum, item) => sum + item.value, 0)}
          건
        </Text>
      </View>

      {/* 관리자 패널 추가 */}
      <View style={styles.adminPanelContainer}>
        <View style={styles.adminPanelHeader}>
          <Text style={styles.adminPanelTitle}>관리자 패널</Text>
          <TouchableOpacity
            style={styles.adminPanelToggleButton}
            onPress={() => setShowAdminPanel(!showAdminPanel)}
          >
            <Text style={styles.adminPanelToggleText}>
              {showAdminPanel ? "패널 닫기" : "패널 열기"}
            </Text>
            <Ionicons
              name={
                showAdminPanel ? "chevron-up-outline" : "chevron-down-outline"
              }
              size={16}
              color="#3498db"
            />
          </TouchableOpacity>
        </View>

        {showAdminPanel && (
          <View style={styles.adminPanelContent}>
            <Text style={styles.adminPanelSubtitle}>
              신고된 쓰레기 현황 관리
            </Text>

            <View style={styles.adminReportListContainer}>
              {allReports.map(renderAdminReportItem)}
            </View>
          </View>
        )}
      </View>
    </View>
  );

  // 지역별 현황 뷰 렌더링
  const renderRegionView = () => {
    // 지역별 현황 뷰의 내용
    return (
      <View style={styles.regionContainer}>
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>지역별 쓰레기 현황</Text>

          <View style={styles.regionTabContainer}>
            <TouchableOpacity
              style={[
                styles.regionTab,
                regionViewMode === "city" && styles.regionTabActive,
              ]}
              onPress={() => setRegionViewMode("city")}
            >
              <Text
                style={[
                  styles.regionTabText,
                  regionViewMode === "city" && styles.regionTabTextActive,
                ]}
              >
                행정시별
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.regionTab,
                regionViewMode === "district" && styles.regionTabActive,
              ]}
              onPress={() => setRegionViewMode("district")}
            >
              <Text
                style={[
                  styles.regionTabText,
                  regionViewMode === "district" && styles.regionTabTextActive,
                ]}
              >
                읍/면/동별
              </Text>
            </TouchableOpacity>
          </View>

          {regionDetailMode === "overview" ? (
            <>
              {regionViewMode === "city" ? (
                <>
                  {regionData.length > 0 ? (
                    <PieChart
                      data={regionData}
                      style={styles.pieChart}
                      onSlicePress={handleRegionSlicePress}
                    />
                  ) : (
                    <View style={styles.emptyChartContainer}>
                      <Ionicons
                        name="alert-circle-outline"
                        size={50}
                        color="#bdc3c7"
                      />
                      <Text style={styles.emptyChartText}>
                        지역별 신고 내역이 없습니다
                      </Text>
                    </View>
                  )}
                  <Text style={styles.chartHint}>
                    * 원 그래프를 클릭하면 상세 정보를 볼 수 있습니다
                  </Text>
                </>
              ) : (
                <>
                  {districtData.length > 0 ? (
                    <BarChart
                      data={districtData}
                      style={styles.barChart}
                      onBarPress={handleDistrictBarPress}
                    />
                  ) : (
                    <View style={styles.emptyChartContainer}>
                      <Ionicons
                        name="alert-circle-outline"
                        size={50}
                        color="#bdc3c7"
                      />
                      <Text style={styles.emptyChartText}>
                        읍/면/동별 신고 내역이 없습니다
                      </Text>
                    </View>
                  )}
                  <Text style={styles.chartHint}>
                    * 막대를 클릭하면 해당 지역의 상세 정보를 볼 수 있습니다
                  </Text>
                </>
              )}
            </>
          ) : regionDetailMode === "jeju" ? (
            <>
              <View style={styles.detailHeader}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setRegionDetailMode("overview")}
                >
                  <Ionicons
                    name="arrow-back-outline"
                    size={20}
                    color="#3498db"
                  />
                  <Text style={styles.backButtonText}>이전</Text>
                </TouchableOpacity>
                <Text style={styles.detailTitle}>
                  제주시 읍면동별 신고 현황
                </Text>
              </View>

              {jejuDistrictData.length > 0 ? (
                <BarChart
                  data={jejuDistrictData}
                  style={styles.barChart}
                  onBarPress={handleDistrictBarPress}
                />
              ) : (
                <View style={styles.emptyChartContainer}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={50}
                    color="#bdc3c7"
                  />
                  <Text style={styles.emptyChartText}>
                    제주시 읍면동별 신고 내역이 없습니다
                  </Text>
                </View>
              )}
              <Text style={styles.chartHint}>
                * 막대를 클릭하면 해당 지역의 상세 정보를 볼 수 있습니다
              </Text>
            </>
          ) : regionDetailMode === "seogwipo" ? (
            <>
              <View style={styles.detailHeader}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => setRegionDetailMode("overview")}
                >
                  <Ionicons
                    name="arrow-back-outline"
                    size={20}
                    color="#3498db"
                  />
                  <Text style={styles.backButtonText}>이전</Text>
                </TouchableOpacity>
                <Text style={styles.detailTitle}>
                  서귀포시 읍면동별 신고 현황
                </Text>
              </View>

              {seogwipoDistrictData.length > 0 ? (
                <BarChart
                  data={seogwipoDistrictData}
                  style={styles.barChart}
                  onBarPress={handleDistrictBarPress}
                />
              ) : (
                <View style={styles.emptyChartContainer}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={50}
                    color="#bdc3c7"
                  />
                  <Text style={styles.emptyChartText}>
                    서귀포시 읍면동별 신고 내역이 없습니다
                  </Text>
                </View>
              )}
              <Text style={styles.chartHint}>
                * 막대를 클릭하면 해당 지역의 상세 정보를 볼 수 있습니다
              </Text>
            </>
          ) : (
            <>
              <View style={styles.detailHeader}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => {
                    setRegionDetailMode("overview");
                    setSelectedDistrict(null);
                  }}
                >
                  <Ionicons
                    name="arrow-back-outline"
                    size={20}
                    color="#3498db"
                  />
                  <Text style={styles.backButtonText}>이전</Text>
                </TouchableOpacity>
                <Text style={styles.detailTitle}>
                  {selectedDistrict} 상세 현황
                </Text>
              </View>

              {districtDetailData.length > 0 ? (
                <PieChart
                  data={districtDetailData}
                  style={styles.pieChart}
                  onSlicePress={null}
                />
              ) : (
                <View style={styles.emptyChartContainer}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={50}
                    color="#bdc3c7"
                  />
                  <Text style={styles.emptyChartText}>
                    {selectedDistrict} 상세 내역이 없습니다
                  </Text>
                </View>
              )}
            </>
          )}
        </View>

        {/* 최근 수거 위치 섹션 */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>최근 7일간 수거 위치</Text>

          {recentReports.length > 0 ? (
            <>
              <View style={styles.mapContainer}>
                <MapView
                  style={styles.map}
                  provider={
                    Platform.OS === "android" ? PROVIDER_GOOGLE : undefined
                  }
                  initialRegion={JEJU_REGION}
                >
                  {recentReports
                    .slice(0, showAllRecent ? undefined : 3)
                    .map((report) => (
                      <Marker
                        key={report.id}
                        coordinate={{
                          latitude: report.latitude,
                          longitude: report.longitude,
                        }}
                        pinColor={STATUS_COLORS[report.status]}
                      >
                        <Callout tooltip>
                          <View style={styles.callout}>
                            <Image
                              source={{ uri: report.image }}
                              style={styles.calloutImage}
                            />
                            <View style={styles.calloutContent}>
                              <Text style={styles.calloutTitle}>
                                {report.status}
                              </Text>
                              <Text
                                style={styles.calloutAddress}
                                numberOfLines={2}
                              >
                                {report.address}
                              </Text>
                              <Text style={styles.calloutDate}>
                                {formatDate(report.createdAt)}
                              </Text>
                            </View>
                          </View>
                        </Callout>
                      </Marker>
                    ))}
                </MapView>
              </View>

              <View style={styles.recentListContainer}>
                {recentReports
                  .slice(0, showAllRecent ? undefined : 3)
                  .map(renderReportItem)}
              </View>

              {recentReports.length > 3 && (
                <TouchableOpacity
                  style={styles.showMoreButton}
                  onPress={() => setShowAllRecent(!showAllRecent)}
                >
                  <Text style={styles.showMoreButtonText}>
                    {showAllRecent
                      ? "접기"
                      : `더보기 (${recentReports.length - 3}건 더)`}
                  </Text>
                  <Ionicons
                    name={
                      showAllRecent
                        ? "chevron-up-outline"
                        : "chevron-down-outline"
                    }
                    size={16}
                    color="#3498db"
                  />
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.emptyRecentContainer}>
              <Ionicons name="alert-circle-outline" size={50} color="#bdc3c7" />
              <Text style={styles.emptyChartText}>
                최근 7일간 수거 완료된 쓰레기가 없습니다
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "right", "left"]}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            viewMode === "status" && styles.tabButtonActive,
          ]}
          onPress={() => {
            setViewMode("status");
            setRegionDetailMode("overview");
            setSelectedDistrict(null);
          }}
        >
          <Ionicons
            name="pie-chart-outline"
            size={18}
            color={viewMode === "status" ? "white" : "#7f8c8d"}
          />
          <Text
            style={[
              styles.tabButtonText,
              viewMode === "status" && styles.tabButtonTextActive,
            ]}
            numberOfLines={1}
          >
            쓰레기 현황
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            viewMode === "region" && styles.tabButtonActive,
          ]}
          onPress={() => setViewMode("region")}
        >
          <Ionicons
            name="location-outline"
            size={18}
            color={viewMode === "region" ? "white" : "#7f8c8d"}
          />
          <Text
            style={[
              styles.tabButtonText,
              viewMode === "region" && styles.tabButtonTextActive,
            ]}
            numberOfLines={1}
          >
            지역별 현황
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>데이터를 불러오는 중...</Text>
        </View>
      ) : (
        <View style={styles.contentContainer}>
          {viewMode === "status" ? (
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={["#3498db"]}
                  tintColor="#3498db"
                />
              }
            >
              {renderStatusView()}
            </ScrollView>
          ) : (
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  colors={["#3498db"]}
                  tintColor="#3498db"
                />
              }
            >
              {renderRegionView()}
            </ScrollView>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

// 스타일 수정 - 중앙 정렬 강화 및 불필요한 스타일 제거
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: "#f9f9f9",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  tabButtonActive: {
    backgroundColor: "#3498db",
  },
  tabButtonText: {
    fontSize: 12,
    color: "#7f8c8d",
    marginLeft: 5,
  },
  tabButtonTextActive: {
    color: "white",
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#7f8c8d",
  },
  statusContainer: {
    flex: 1,
    padding: 15,
  },
  regionContainer: {
    flex: 1,
    padding: 15,
  },
  chartContainer: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: height * 0.6,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 20,
    textAlign: "center",
  },
  chartHint: {
    fontSize: 12,
    color: "#7f8c8d",
    textAlign: "center",
    marginTop: 10,
    fontStyle: "italic",
  },
  totalReportText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "center",
    marginTop: 20,
  },
  regionTabContainer: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    marginBottom: 20,
    overflow: "hidden",
  },
  regionTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  regionTabActive: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  regionTabText: {
    fontSize: 14,
    color: "#7f8c8d",
    fontWeight: "500",
  },
  regionTabTextActive: {
    color: "#3498db",
    fontWeight: "bold",
  },
  pieChartWrapper: {
    alignItems: "center",
    marginVertical: 10,
  },
  pieChartContainer: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginBottom: 20,
  },
  pieChartCenter: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 20,
  },
  pieChartTotal: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  pieChartTotalLabel: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  pieChart: {
    width: "100%",
  },
  legendContainer: {
    width: "100%",
    marginTop: 20,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    width: "70%",
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 10,
  },
  legendText: {
    fontSize: 14,
    color: "#2c3e50",
    marginRight: 5,
  },
  legendCount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  barChartWrapper: {
    marginVertical: 10,
    width: "100%",
  },
  barChartContainer: {
    width: "100%",
  },
  barItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  barLabelContainer: {
    width: 80,
  },
  barLabel: {
    fontSize: 12,
    color: "#2c3e50",
  },
  barContainer: {
    flex: 1,
    height: 25,
    backgroundColor: "#f0f0f0",
    borderRadius: 12.5,
    overflow: "hidden",
    position: "relative",
    justifyContent: "center",
  },
  bar: {
    height: "100%",
    borderRadius: 12.5,
    position: "absolute",
    left: 0,
  },
  barValueContainer: {
    position: "absolute",
    right: 10,
    left: 10,
    alignItems: "flex-end",
  },
  barValue: {
    fontSize: 12,
    color: "white",
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  emptyChartContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  emptyChartText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#7f8c8d",
    marginTop: 10,
  },
  emptyChartSubtext: {
    fontSize: 14,
    color: "#95a5a6",
    marginTop: 5,
    textAlign: "center",
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
    backgroundColor: "#f0f8ff",
  },
  backButtonText: {
    fontSize: 14,
    color: "#3498db",
    marginLeft: 5,
  },
  detailTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "center",
    marginRight: 40,
  },
  districtScrollView: {
    maxHeight: height * 0.5,
  },
  regionScrollView: {
    flex: 1,
  },
  recentContainer: {
    padding: 15,
  },
  mapContainer: {
    height: 200,
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 15,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  recentListContainer: {
    paddingBottom: 10,
  },
  reportItem: {
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  reportDate: {
    fontSize: 12,
    color: "#95a5a6",
  },
  reportContent: {
    flexDirection: "row",
    padding: 10,
  },
  reportImage: {
    width: 80,
    height: 80,
    borderRadius: 5,
  },
  reportDetails: {
    flex: 1,
    marginLeft: 10,
    justifyContent: "space-between",
  },
  reportAddress: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 5,
  },
  reportLocation: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  reportLocationText: {
    fontSize: 12,
    color: "#7f8c8d",
    marginLeft: 5,
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  actionButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  callout: {
    width: width * 0.7,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutImage: {
    width: "100%",
    height: 120,
    borderRadius: 5,
    marginBottom: 8,
  },
  calloutContent: {
    padding: 5,
  },
  calloutTitle: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#2c3e50",
    marginBottom: 5,
  },
  calloutAddress: {
    fontSize: 12,
    color: "#7f8c8d",
    marginBottom: 5,
  },
  calloutDate: {
    fontSize: 10,
    color: "#95a5a6",
  },
  showMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  showMoreButtonText: {
    color: "#3498db",
    fontSize: 14,
    marginRight: 5,
  },
  emptyRecentContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 50,
  },
  barChart: {
    marginTop: 10,
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  adminPanelContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 20,
  },
  adminPanelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  adminPanelTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  adminPanelToggleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f8ff",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  adminPanelToggleText: {
    color: "#3498db",
    fontSize: 14,
    marginRight: 5,
  },
  adminPanelContent: {
    marginTop: 10,
  },
  adminPanelSubtitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 15,
  },
  adminReportListContainer: {
    paddingBottom: 10,
  },
  adminReportItem: {
    backgroundColor: "#f8f9fa",
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: "hidden",
  },
  adminReportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  adminReportContent: {
    flexDirection: "row",
    padding: 10,
  },
  adminReportImage: {
    width: 70,
    height: 70,
    borderRadius: 5,
  },
  adminReportDetails: {
    flex: 1,
    marginLeft: 10,
    justifyContent: "space-between",
  },
  adminActionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  adminActionButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginLeft: 5,
  },
  adminActionButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default StatusScreen;
