import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const DEVICE_ID = "pi-zero-2w-001";
const RELAY_URL = "https://pi-romote-relay.onrender.com";
const RELAY_TOKEN = "piR3m0t3_9f8a2c4d_token";

// 🔴 CHANGE THIS TO YOUR PI IP
const PI_HTTP_BASE = "http://10.123.24.192:8090";

export default function Dashboard() {
  const [socket, setSocket] = useState(null);

  // 🔴 SEPARATED STATE (IMPORTANT)
  const [deviceOnline, setDeviceOnline] = useState(false);
  const [deviceStatus, setDeviceStatus] = useState("UNKNOWN");

  const [duration, setDuration] = useState(15);
  const [profile, setProfile] = useState("720p30");

  const [uiMessage, setUiMessage] = useState(null);
  const [isStarting, setIsStarting] = useState(false);

  const [recordings, setRecordings] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    const s = io(RELAY_URL, {
      transports: ["websocket"],
      auth: { token: RELAY_TOKEN },
    });

    s.on("connect", () => {
      s.emit("watch-device", DEVICE_ID);
      s.emit("REQUEST_STATUS", { deviceId: DEVICE_ID });
    });

    // 🔴 AUTHORITATIVE STATUS FROM DEVICE
    s.on("STATUS_UPDATE", (payload) => {
      if (payload.deviceId === DEVICE_ID) {
        setDeviceOnline(true);
        setDeviceStatus(payload.status);
        setIsStarting(false);

        if (payload.status === "RECORDING") {
          showMessage("🎥 Recording started", "success");
        }

        if (payload.status === "STANDBY") {
          showMessage("✅ Recording stopped", "info");
          s.emit("LIST_RECORDINGS");
        }
      }
    });

    // 🔴 DEVICE OFFLINE IS STRONGER THAN STATUS
    s.on("device-offline", (id) => {
      if (id === DEVICE_ID) {
        setDeviceOnline(false);
        setDeviceStatus("UNKNOWN");
        showMessage("⚠️ Device offline", "error");
      }
    });

    s.on("device-online", (id) => {
      if (id === DEVICE_ID) {
        setDeviceOnline(true);
        s.emit("watch-device", DEVICE_ID);
        s.emit("REQUEST_STATUS", { deviceId: DEVICE_ID });
        s.emit("LIST_RECORDINGS");
        showMessage("✅ Device online", "info");
      }
    });

    s.on("RECORDINGS_LIST", (payload) => {
      if (payload.deviceId === DEVICE_ID) {
        setRecordings(payload.files);
      }
    });

    setSocket(s);
    return () => s.disconnect();
  }, []);

  function showMessage(text, type = "info") {
    setUiMessage({ text, type });
    setTimeout(() => setUiMessage(null), 3000);
  }

  function startRecording() {
    if (!socket || !deviceOnline) return;

    setIsStarting(true);
    showMessage("⏳ Starting recording…", "info");

    socket.emit("START_RECORDING", {
      deviceId: DEVICE_ID,
      minutes: duration,
      profile,
    });
  }

  function stopRecording() {
    if (!socket || !deviceOnline) return;

    socket.emit("STOP_RECORDING", { deviceId: DEVICE_ID });
    showMessage("⏹ Stop requested", "info");
  }

  function refreshRecordings() {
    if (socket && deviceOnline) {
      socket.emit("LIST_RECORDINGS");
    }
  }

  // 🔴 FINAL UI STATUS (DERIVED)
  const uiStatus = deviceOnline ? deviceStatus : "OFFLINE";

  const statusColor = {
    OFFLINE: "#e74c3c",
    UNKNOWN: "#95a5a6",
    STANDBY: "#f1c40f",
    RECORDING: "#2ecc71",
  }[uiStatus];

  return (
    <div style={styles.page}>
      <h2>🎛 Court Camera Dashboard</h2>

      <div style={{ ...styles.statusBanner, background: statusColor }}>
        Status: {uiStatus}
      </div>

      {uiMessage && (
        <div style={{ ...styles.toast, ...toastStyle(uiMessage.type) }}>
          {uiMessage.text}
        </div>
      )}

      {/* CONTROL CARD */}
      <div style={styles.card}>
        <div style={styles.row}>
          <label>Duration</label>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          >
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={60}>60 minutes</option>
          </select>
        </div>

        <div style={styles.row}>
          <label>Quality</label>
          <select value={profile} onChange={(e) => setProfile(e.target.value)}>
            <option value="720p30">720p @ 30fps</option>
            <option value="720p60">720p @ 60fps</option>
            <option value="1080p30">1080p @ 30fps</option>
          </select>
        </div>

        <div style={styles.actions}>
          <button
            style={styles.startBtn}
            disabled={uiStatus !== "STANDBY" || isStarting}
            onClick={startRecording}
          >
            {isStarting ? "Starting…" : "▶ Start Recording"}
          </button>

          <button
            style={styles.stopBtn}
            disabled={uiStatus !== "RECORDING"}
            onClick={stopRecording}
          >
            ⏹ Stop
          </button>
        </div>
      </div>

      {/* RECORDINGS */}
      <div style={{ ...styles.card, marginTop: 20 }}>
        <h3>📁 Recordings</h3>
        <button onClick={refreshRecordings} disabled={!deviceOnline}>
          🔄 Refresh
        </button>

        <table width="100%" style={{ marginTop: 10 }}>
          <thead>
            <tr>
              <th align="left">File</th>
              <th>Size</th>
              <th>Play</th>
            </tr>
          </thead>
          <tbody>
            {recordings.map((r) => (
              <tr key={r.name}>
                <td>{r.name}</td>
                <td>{(r.sizeBytes / 1024 / 1024).toFixed(1)} MB</td>
                <td>
                  <button onClick={() => setSelectedVideo(r.name)}>▶</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PLAYBACK */}
      {selectedVideo && (
        <div style={{ ...styles.card, marginTop: 20 }}>
          <h3>▶ Playback</h3>
          <video
            src={`${PI_HTTP_BASE}/${selectedVideo}`}
            controls
            width="100%"
          />
        </div>
      )}
    </div>
  );
}

/* ---------- STYLES ---------- */

const styles = {
  page: {
    padding: 20,
    maxWidth: 900,
    margin: "auto",
    fontFamily: "system-ui",
  },
  statusBanner: {
    padding: 12,
    color: "#fff",
    borderRadius: 6,
    marginBottom: 12,
    textAlign: "center",
    fontWeight: 600,
  },
  card: {
    background: "#fff",
    padding: 16,
    borderRadius: 8,
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  actions: {
    display: "flex",
    gap: 10,
    marginTop: 10,
  },
  startBtn: {
    flex: 1,
    padding: 12,
    background: "#2ecc71",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontWeight: 600,
  },
  stopBtn: {
    flex: 1,
    padding: 12,
    background: "#e74c3c",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontWeight: 600,
  },
  toast: {
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    textAlign: "center",
    fontWeight: 500,
  },
};

function toastStyle(type) {
  if (type === "success") return { background: "#2ecc71", color: "#fff" };
  if (type === "error") return { background: "#e74c3c", color: "#fff" };
  return { background: "#3498db", color: "#fff" };
}
