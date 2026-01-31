import { useEffect, useState } from "react";
import { socket } from "../services/socket";
import DeviceTable from "../components/DeviceTable";

export default function Dashboard() {
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    socket.on("device-status", (data) => {
      setDevices((prev) => {
        const copy = [...prev];
        const idx = copy.findIndex((d) => d.deviceId === data.deviceId);
        if (idx >= 0) copy[idx] = { ...copy[idx], ...data };
        else copy.push(data);
        return copy;
      });
    });

    return () => socket.off("device-status");
  }, []);

  const startRecording = (deviceId, minutes) => {
    socket.emit("command", {
      deviceId,
      type: "START_RECORDING",
      duration: minutes,
    });
  };

  const stopRecording = (deviceId) => {
    socket.emit("command", {
      deviceId,
      type: "STOP_RECORDING",
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Court Recording Dashboard</h1>
      <DeviceTable
        devices={devices}
        onStart={startRecording}
        onStop={stopRecording}
        onView={(id) => alert("Camera modal next")}
      />
    </div>
  );
}
