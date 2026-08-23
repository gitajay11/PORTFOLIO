"use client";

import { useEffect, useState } from "react";
import { subscribeToScroll } from "@/lib/scrollProgress";

export default function ScrollHint() {
  const [hidden, setHidden] = useState(false);

  useEffect(
    () =>
      subscribeToScroll(() => {
        setHidden(window.scrollY > 40);
      }),
    []
  );

  return (
    <div className={`scrollhint${hidden ? " is-hidden" : ""}`} aria-hidden="true">
      <span>scroll</span>
      <div className="scrollhint__mouse">
        <i />
      </div>
    </div>
  );
}
