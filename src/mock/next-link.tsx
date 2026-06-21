import React from 'react';

export default function MockLink({ href, children, className, onClick, ...props }: any) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick(e);
    }
    if (typeof window !== 'undefined') {
      const customPushEvent = new CustomEvent('spa-push-navigation', { detail: { href } });
      window.dispatchEvent(customPushEvent);
    }
  };

  return (
    <a href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}
