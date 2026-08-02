"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from "react";
import type { TextareaHTMLAttributes } from "react";

type AutoResizeTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  minRows?: number;
  maxHeight?: number;
};

export const AutoResizeTextarea = forwardRef<
  HTMLTextAreaElement,
  AutoResizeTextareaProps
>(function AutoResizeTextarea(
  {
    className = "",
    minRows = 1,
    maxHeight = 240,
    onInput,
    style,
    value,
    defaultValue,
    ...props
  },
  forwardedRef,
) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useImperativeHandle(forwardedRef, () => textareaRef.current!);

  const resize = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "0px";
    const nextHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY =
      textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [maxHeight]);

  useLayoutEffect(resize, [defaultValue, resize, value]);

  useEffect(() => {
    const form = textareaRef.current?.form;
    if (!form) return;
    const onReset = () => window.requestAnimationFrame(resize);
    form.addEventListener("reset", onReset);
    return () => form.removeEventListener("reset", onReset);
  }, [resize]);

  return (
    <textarea
      {...props}
      ref={textareaRef}
      rows={minRows}
      value={value}
      defaultValue={defaultValue}
      onInput={(event) => {
        resize();
        onInput?.(event);
      }}
      className={`resize-none ${className}`}
      style={{ ...style, overflowY: "hidden" }}
    />
  );
});
