export default function TypingIndicator() {
  return (
    <div className="flex gap-1 px-4 py-2">
      <span className="dot" />
      <span className="dot" />
      <span className="dot" />

      <style>{`
        .dot {
          width: 6px;
          height: 6px;
          background: white;
          border-radius: 50%;
          animation: blink 1.4s infinite both;
        }
        .dot:nth-child(2) { animation-delay: .2s }
        .dot:nth-child(3) { animation-delay: .4s }

        @keyframes blink {
          0% { opacity: .2 }
          20% { opacity: 1 }
          100% { opacity: .2 }
        }
      `}</style>
    </div>
  );
}
