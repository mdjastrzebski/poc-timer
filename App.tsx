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

function useAppState() {
  const [appState, setAppState] = React.useState(AppState.currentState);

  React.useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      setAppState(state);
    });

    return () => subscription.remove();
  });

  return appState;
}

function isPendingDeadline(deadline?: Date | null) {
  return deadline != null && deadline > new Date();
}

function useIsPendingDeadline(deadline?: Date | null) {
  const [, forceRender] = React.useState({});
  const appState = useAppState();

  React.useEffect(() => {
    log("Effect run");

    if (deadline == null || appState !== "active") {
      log("  Early return deadline == null || appState not active");
      return;
    }

    const ms = deadline.getTime() - Date.now();
    if (ms <= 0) {
      log("  Early return deadline in the app");
      return;
    }

    const timeoutId = setTimeout(() => {
      log("timeout - forceRender");
      forceRender({});
    }, ms);

    return () => {
      log("Effect cleanup - clearTimeout");
      clearTimeout(timeoutId);
    };
  }, [deadline, appState]);

  const result = isPendingDeadline(deadline);
  log(`Is Pending Deadline ${result}`);
  return result;
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
  const isPending = useIsPendingDeadline(deadline);

  const increaseDeadline = () => {
    logs = [];
    const newDeadline = new Date(deadline.getTime() + 15 * 1000);
    setDeadline(newDeadline);
  };

  return (
    <View style={styles.container}>
      <StatusBar />
      <Text>Deadline {deadline.toLocaleTimeString()}</Text>
      <Text>Is Pending Deadline: {isPending ? "YES" : "NO"}</Text>

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
