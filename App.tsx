import * as React from "react";
import { StatusBar } from "expo-status-bar";
import {
  AppState,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

let logs: string[] = [];

function log(message: string) {
  console.log(message);
  logs.push(`${new Date().toLocaleTimeString()}: ${message}`);
}

function useDeadline(deadline: Date) {
  const hasPassed = deadline <= new Date();
  const [, forceRender] = React.useState({});

  React.useEffect(() => {
    log("Effect");

    const ms = deadline.getTime() - Date.now();
    if (ms <= 0) {
      return;
    }

    const timeoutId = setTimeout(() => {
      log("forceRender");
      forceRender({});
    }, ms);

    return () => {
      log("clearTimeout");
      clearTimeout(timeoutId);
    };
  }, [deadline]);

  return hasPassed;
}

function LogsView() {
  const [, forceRender] = React.useState({});

  React.useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      log(`AppState change ${state}`);
      forceRender({});
    });

    return () => sub.remove();
  });

  return (
    <View style={styles.log}>
      {logs.map((message) => (
        <Text key={message}>{message}</Text>
      ))}
    </View>
  );
}

export default function App() {
  const [deadline, setDeadline] = React.useState(() => new Date());
  const hasPassed = useDeadline(deadline);

  const increaseDeadline = () => {
    logs = [];
    const newDeadline = new Date(deadline.getTime() + 15 * 1000);
    setDeadline(newDeadline);
  };

  return (
    <View style={styles.container}>
      <StatusBar />
      <Text>Deadline {deadline.toLocaleTimeString()}</Text>
      <Text>Has Passed: {hasPassed ? "YES" : "NO"}</Text>

      <TouchableOpacity style={styles.button} onPress={increaseDeadline}>
        <Text style={styles.buttonTitle}>Increase Deadline</Text>
      </TouchableOpacity>

      <LogsView />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  log: {
    margin: 20,
  },
  button: {
    width: "100%",
    backgroundColor: "blue",
    padding: 20,
    margin: 20,
  },
  buttonTitle: {
    color: "white",
  },
});
