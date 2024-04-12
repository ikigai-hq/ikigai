import { MutableRefObject, useLayoutEffect } from "react";

const useResizeObserver = (
  ref: MutableRefObject<any>,
  callback: (target: any) => void
) => {
  useLayoutEffect(() => {
    const element = ref?.current;

    if (!element) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      callback(element);
    });

    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [callback, ref]);

};

export default useResizeObserver;
