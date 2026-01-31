export default function StatusBadge({ status }) {
  const colors = {
    OFF: "bg-gray-500",
    STANDBY: "bg-yellow-500",
    IN_PROGRESS: "bg-green-600",
    UPLOADING: "bg-blue-600",
  };

  return (
    <span className={`px-2 py-1 text-white rounded ${colors[status]}`}>
      {status}
    </span>
  );
}
