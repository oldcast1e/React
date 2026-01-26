import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

// export default function App() {
//   return (
//     <View style={styles.container}>
//       <Text>Open up App.js to start working on your app!</Text>
//       <StatusBar style="auto" />
//     </View>
//   );
// }

// export default function App() {
//   return (
//     <View style={styles.container}>
//       <Text>Expo React Native</Text>
//       <StatusBar style="auto" />
//     </View>
//   );
// }

// export default function App() {
//   const message = "Expo React Native!";
//   console.log(message);  // 터미널에 출력됨

//   return (
//     <View style={styles.container}>
//       <Text>{message}</Text>
//       <StatusBar style="auto" />
//     </View>
//   );
// }

// export default function App() {
//   const message = "Oldcast1e's React Native!";
//   console.log(message); // 터미널에 출력됨

//   const name = 'Heonseong';
//   const isFullname = true;

//   const add = (a, b) => {
//     return a + b;
//   };

//   return (
//     <View style={styles.container}>
//       <Text>{message}</Text>
//       <Text>My name is {name}</Text>
//       <Text>1 + 2 = {add(1, 2)}</Text>
//       <Text>{isFullname == true ? name + ' Lee' : 'Not Full Name'}</Text>
//       <StatusBar style="auto" />
//     </View>
//   );
// }

export default function App() {
  console.log('Expo React Native'); // 경고 메시지 발생
  const test = 10; // 사용되지 않는 변수 경고 발생

  return (
    <View>
      <Text>Hello, React Native!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
