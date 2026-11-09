import type { SVGProps } from 'react';

export type IconName =
  | 'home'
  | 'list'
  | 'logout'
  | 'bell'
  | 'edit'
  | 'trash'
  | 'check'
  | 'arrow'
  | 'clock'
  | 'task'
  | 'plus'
  | 'users';

const ICONS: Record<IconName, (props: SVGProps<SVGSVGElement>) => React.JSX.Element> = {
  home: () => (
    <path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
  ),
  list: () => (
    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
  ),
  logout: () => (
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  ),
  bell: () => (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </>
  ),
  edit: () => (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </>
  ),
  trash: () => (
    <>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
    </>
  ),
  check: () => (
    <path d="M20 6L9 17l-5-5" />
  ),
  arrow: () => (
    <>
      <path d="M7 17L17 7" />
      <path d="M8 7h9v9" />
    </>
  ),
  clock: () => (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  task: () => (
    <>
      <rect x="4" y="3" width="16" height="18" rx="3" />
      <path d="M8 9h8M8 13h8M8 17h4" />
    </>
  ),
  plus: () => (
    <path d="M12 5v14M5 12h14" />
  ),
  users: () => (
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
};

export function Icon({
  name,
  size = 18,
  ...props
}: {
  name: IconName;
  size?: number;
} & SVGProps<SVGSVGElement>) {
  const IconBody = ICONS[name];
  if (!IconBody) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <IconBody />
    </svg>
  );
}
