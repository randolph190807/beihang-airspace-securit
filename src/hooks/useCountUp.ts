import { useEffect, useState } from "react";

export function useCountUp(end: string | number, duration = 1200) {
  const [displayVal, setDisplayVal] = useState(0);
  const num = Number(String(end).replace(/,/g, ""));

  useEffect(() => {
    let start = 0;
    const step = num / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= num) {
        setDisplayVal(num);
        clearInterval(timer);
      } else {
        setDisplayVal(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [num, duration]);

  // 还原千分位逗号
  if (String(end).includes(",")) return displayVal.toLocaleString();
  // 带单位处理 48s / 91%
  if (String(end).includes("%")) return `${displayVal}%`;
  if (String(end).includes("s")) return `${displayVal}s`;
  return displayVal;
}