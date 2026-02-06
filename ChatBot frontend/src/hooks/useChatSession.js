import { useEffect, useState } from "react";

export default function useChatSession() {
  const token = localStorage.getItem("token");

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {
    user = null;
  }

  return {
    token,
    user,
  };
}
