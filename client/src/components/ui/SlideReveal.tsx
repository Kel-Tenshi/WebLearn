import React, { useLayoutEffect, useRef } from 'react';

// Плавно разворачивает блок по высоте при появлении
export const SlideReveal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targetHeight = el.scrollHeight;

    // Схлопываем до отрисовки, чтобы не было мигания
    el.style.height = '0px';
    el.style.opacity = '0';
    el.style.transform = 'translateY(-8px)';
    el.style.overflow = 'hidden';

    const raf = window.requestAnimationFrame(() => {
      el.style.transition = 'height 0.3s ease, opacity 0.3s ease, transform 0.3s ease';
      el.style.height = `${targetHeight}px`;
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });

    // После раскрытия убираем ограничение, чтобы tooltip ошибки не обрезался
    const timer = window.setTimeout(() => {
      el.style.height = 'auto';
      el.style.overflow = 'visible';
    }, 340);

    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div ref={ref} style={{ overflow: 'hidden' }}>
      {children}
    </div>
  );
};
