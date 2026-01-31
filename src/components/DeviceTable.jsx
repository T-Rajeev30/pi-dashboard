import DeviceRow from "./DeviceRow";

export default function DeviceTable({ devices, onStart, onStop, onView }) {
  return (
    <table className="w-full border">
      <thead>
        <tr>
          <th>Device ID</th>
          <th>Device Name</th>
          <th>Court No</th>
          <th>Status</th>
          <th>Start Recording</th>
          <th>End Recording</th>
          <th>Upload</th>
          <th>Camera</th>
        </tr>
      </thead>
      <tbody>
        {devices.map((d) => (
          <DeviceRow
            key={d.deviceId}
            device={d}
            onStart={onStart}
            onStop={onStop}
            onView={onView}
          />
        ))}
      </tbody>
    </table>
  );
}
