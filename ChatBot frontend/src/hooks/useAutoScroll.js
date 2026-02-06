import { useEffect } from "react";

export default function useAutoScroll(
  bottomRef,
  messages = [],
  isTyping = false
) {
  useEffect(() => {
    if (!bottomRef?.current) return;

    bottomRef.current.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isTyping, bottomRef]);
}
