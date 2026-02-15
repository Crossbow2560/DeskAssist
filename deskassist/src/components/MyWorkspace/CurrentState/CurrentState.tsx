"use client";

import { useEffect, useState, useRef } from "react";
import styles from "./CurrentState.module.css";

type Metrics = {
  [key: string]: number;
};

export default function CurrentState() {
  const [data, setData] = useState<Metrics>({});
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://127.0.0.1:8000/ws");

    socketRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      const parsed = JSON.parse(event.data);
      setData(parsed);
    };

    ws.onerror = (err) => {
      console.log("WebSocket error:", err);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>Current State</div>

      {Object.keys(data).length === 0 ? (
        <div className={styles.waiting}>Waiting for data...</div>
      ) : (
        <div className={styles.metrics}>
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className={styles.metricItem}>
              <span className={styles.metricKey}>{key}</span>
              <span className={styles.metricValue}>
                {typeof value === "number"
                  ? value.toFixed(3)
                  : value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
