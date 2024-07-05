import { useRouter } from "next/router";
import React from "react";

function SharePage() {
  const router = useRouter();

  const { roomId } = router.query;
  
  return <div>{roomId}</div>;
}

export default SharePage;
