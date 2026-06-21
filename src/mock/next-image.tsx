import React from 'react';

export default function MockImage({ src, alt, className, style, onClick, referrerPolicy, width, height, fill, unoptimized, ...props }: any) {
  const finalStyle = fill 
    ? { position: 'absolute', height: '100%', width: '100%', left: 0, top: 0, right: 0, bottom: 0, objectFit: 'cover', ...style }
    : style;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={finalStyle}
      onClick={onClick}
      referrerPolicy="no-referrer"
      {...props}
    />
  );
}
