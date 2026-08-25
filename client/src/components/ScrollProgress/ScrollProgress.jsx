import { useEffect, useState } from "react";

const ScrollProgress = () => {
  const [scroll, setScroll] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const totalHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;

      const progress =
        (window.scrollY / totalHeight) * 100;

      setScroll(progress);
    };

    window.addEventListener("scroll", updateProgress);

    return () =>
      window.removeEventListener("scroll", updateProgress);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-[4px] z-[9999]">

      <div
        className="h-full bg-green-500 transition-all duration-150"
        style={{
          width: `${scroll}%`,
        }}
      />

    </div>
  );
};

export default ScrollProgress;