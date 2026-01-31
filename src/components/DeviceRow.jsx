import StatusBadge from "./StatusBadge";

export default function DeviceRow({ device, onStart, onStop, onView }) {
  return (
    <tr className="border-b">
      <td>{device.deviceId}</td>
      <td>{device.deviceName}</td>
      <td>{device.courtNo}</td>
      <td>
        <StatusBadge status={device.status} />
      </td>

      <td>
        <button onClick={() => onStart(device.deviceId, 15)}>15m</button>
        <button onClick={() => onStart(device.deviceId, 30)}>30m</button>
        <button onClick={() => onStart(device.deviceId, 60)}>60m</button>
      </td>

      <td>
        <button onClick={() => onStop(device.deviceId)}>Stop</button>
      </td>

      <td>{device.uploadProgress || "—"}</td>

      <td>
        <button onClick={() => onView(device.deviceId)}>View</button>
      </td>
    </tr>
  );
}
