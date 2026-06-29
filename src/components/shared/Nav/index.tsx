import { useTranslation } from 'react-i18next';
import styles from './Nav.module.css';

const ROUTES = [
  { path: '/battery', i18nKey: 'nav.batteryInfo', icon: '🔋' },
  { path: '/params', i18nKey: 'nav.paramConfig', icon: '⚙️' },
  { path: '/faults', i18nKey: 'nav.faultRecord', icon: '⚠️' },
  { path: '/commands', i18nKey: 'nav.extendedCommand', icon: '📡' },
] as const;

interface NavProps {
  activeRoute: string;
  onNavigate: (route: string) => void;
}

export function Nav({ activeRoute, onNavigate }: NavProps) {
  const { t } = useTranslation();

  return (
    <nav className={styles.nav}>
      {ROUTES.map((route) => (
        <button
          key={route.path}
          className={`${styles.navItem} ${activeRoute === route.path ? styles.navItemActive : ''}`}
          onClick={() => onNavigate(route.path)}
        >
          <span className={styles.navIcon}>{route.icon}</span>
          <span className={styles.navLabel}>{t(route.i18nKey)}</span>
        </button>
      ))}
    </nav>
  );
}
