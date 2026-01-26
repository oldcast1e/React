import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Screens
import MainScreen from "./screens/MainScreen";
import ReportScreen from "./screens/ReportScreen";
import StatusScreen from "./screens/StatusScreen";

// Context Provider
import { TrashProvider } from "./context/TrashContext";

// 네비게이션 타입
import type { RootTabParamList } from "./types/navigation";

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <TrashProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Tab.Navigator
            screenOptions={({ route }) => ({
              tabBarIcon: ({ focused, color, size }) => {
                let iconName: keyof typeof Ionicons.glyphMap;

                if (route.name === "메인") {
                  iconName = focused ? "home" : "home-outline";
                } else if (route.name === "쓰레기 신고") {
                  iconName = focused ? "add-circle" : "add-circle-outline";
                } else if (route.name === "쓰레기 현황") {
                  iconName = focused ? "list" : "list-outline";
                } else {
                  iconName = "help-outline"; // 기본값
                }

                return <Ionicons name={iconName} size={size} color={color} />;
              },
              tabBarActiveTintColor: "#3498db",
              tabBarInactiveTintColor: "gray",
              headerShown: false,
            })}
          >
            <Tab.Screen name="메인" component={MainScreen} />
            <Tab.Screen name="쓰레기 신고" component={ReportScreen} />
            <Tab.Screen name="쓰레기 현황" component={StatusScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </TrashProvider>
    </SafeAreaProvider>
  );
}
