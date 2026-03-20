import { RefObject, useEffect, useState } from "react";

/**
 * contentEndRef の要素が boundaryRef の要素より下にあるかを監視する。
 * 例: コンテンツ末尾がスティッキーバーより下にあるとき true を返す。
 *
 * @param contentEndRef - コンテンツの末尾を示す要素の ref
 * @param boundaryRef - 比較対象となる境界要素の ref（例: sticky な入力欄）
 */
export function useHasContentBelow(
  contentEndRef: RefObject<HTMLElement | null>,
  boundaryRef: RefObject<HTMLElement | null>,
): boolean {
  const [hasContentBelow, setHasContentBelow] = useState(false);

  useEffect(() => {
    const endEl = contentEndRef.current;
    const barEl = boundaryRef.current;

    if (!endEl || !barEl) {
      return;
    }

    let frameId: number | null = null;
    let active = true;

    const check = () => {
      frameId = null;

      if (!active) return;

      const currentEndEl = contentEndRef.current;
      const currentBarEl = boundaryRef.current;

      if (currentEndEl && currentBarEl) {
        const endRect = currentEndEl.getBoundingClientRect();
        const barRect = currentBarEl.getBoundingClientRect();
        setHasContentBelow(endRect.top > barRect.top);
      }
    };

    const scheduleCheck = () => {
      if (frameId !== null) {
        return;
      }

      frameId = window.requestAnimationFrame(check);
    };

    scheduleCheck();

    window.addEventListener("scroll", scheduleCheck, { passive: true });
    window.addEventListener("resize", scheduleCheck);

    const resizeObserver = new ResizeObserver(scheduleCheck);
    resizeObserver.observe(endEl);
    resizeObserver.observe(barEl);

    const mutationObserver = new MutationObserver(scheduleCheck);
    const contentContainer = endEl.parentElement;

    if (contentContainer) {
      mutationObserver.observe(contentContainer, { childList: true, subtree: true });
    }

    return () => {
      active = false;
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
      window.removeEventListener("scroll", scheduleCheck);
      window.removeEventListener("resize", scheduleCheck);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [contentEndRef, boundaryRef]);

  return hasContentBelow;
}
