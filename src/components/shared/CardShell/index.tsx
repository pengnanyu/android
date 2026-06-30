import type { ReactNode } from 'react';
import styles from './CardShell.module.css';

interface CardShellProps {
  title: string;
  titleExtra?: ReactNode;
  children: ReactNode;
  className?: string;
  accentColor?: string;
}

export function CardShell({ title, titleExtra, children, className, accentColor }: CardShellProps) {
  const style = accentColor ? { '--card-accent': accentColor } as React.CSSProperties : undefined;
  return (
    <div className={`${styles.shell} ${className ?? ''}`} style={style}>
      <div className={styles.title}>
        <span className={styles.titleText}>{title}</span>
        {titleExtra && <span className={styles.titleExtra}>{titleExtra}</span>}
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
