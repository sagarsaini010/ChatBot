export default function InputPreview({ text }) {
  return (
    <div className="bg-[#1e1e1e] p-3 rounded-lg text-white min-h-10">
      {text || "No data"}
    </div>
  );
}
