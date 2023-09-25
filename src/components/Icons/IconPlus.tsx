import React from 'react';

interface IconPlusProps {
  fill?: string;
  width?: string;
  height?: string;
  className?: string;
}

export const IconPlus = ({
  fill = '#000',
  width = '20',
  height = '20',
  className = '',
}: IconPlusProps) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M10 0.000976562C4.486 0.000976562 0 4.48698 0 10.001C0 15.515 4.486 20.001 10 20.001C15.514 20.001 20 15.515 20 10.001C20 4.48698 15.514 0.000976562 10 0.000976562ZM15 11.001H11V15.001H9V11.001H5V9.00098H9V5.00098H11V9.00098H15V11.001Z"
      fill={fill}
    />
  </svg>
);
