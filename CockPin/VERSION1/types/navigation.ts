import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

export type RootTabParamList = {
  메인: undefined;
  "쓰레기 신고": undefined;
  "쓰레기 현황": undefined;
};

export type MainScreenNavigationProp = BottomTabNavigationProp<
  RootTabParamList,
  "메인"
>;
export type ReportScreenNavigationProp = BottomTabNavigationProp<
  RootTabParamList,
  "쓰레기 신고"
>;
export type StatusScreenNavigationProp = BottomTabNavigationProp<
  RootTabParamList,
  "쓰레기 현황"
>;
