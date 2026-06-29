import { useTranslation } from 'react-i18next';
import styles from './ParamToolbar.module.css';

interface ParamToolbarProps {
  onImport: () => void;
  onExport: () => void;
  onPreset: (presetId: string) => void;
}

export function ParamToolbar({ onImport, onExport, onPreset }: ParamToolbarProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.toolbar}>
      <div className={styles.spacer} />
      <button className={styles.btn} onClick={onImport}>
        {t('param.importConfig')}
      </button>
      <button className={styles.btn} onClick={onExport}>
        {t('param.exportConfig')}
      </button>
      <button className={styles.btn} onClick={() => onPreset('default')}>
        {t('param.preset')}
      </button>
    </div>
  );
}