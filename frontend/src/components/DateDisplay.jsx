import { dateLabel, jalaliDateLabel } from '../utils/format';

export const DATE_DISPLAY_FORMATS = {
  PERSIAN: 'persian',
  GREGORIAN: 'gregorian',
  DUAL: 'dual'
};

export default function DateDisplay({ value, format = DATE_DISPLAY_FORMATS.DUAL, compact = false }) {
  const isValidDate = (val) => {
    if (!val) return false;
    const parsed = new Date(val);
    return !isNaN(parsed.getTime());
  };

  if (!value || !isValidDate(value)) {
    return compact ? null : <span className="date-empty">-</span>;
  }

  const persian = jalaliDateLabel(value);
  const gregorian = dateLabel(value);
  const showPersian = format !== DATE_DISPLAY_FORMATS.GREGORIAN;
  const showGregorian = format !== DATE_DISPLAY_FORMATS.PERSIAN;

  return (
    <div
      className={`dual-date dual-date-${format}${compact ? ' dual-date-compact' : ''}`}
      aria-label={[showPersian && persian, showGregorian && gregorian].filter(Boolean).join(', ')}
    >
      {showPersian && (
        <div className="date-primary font-mono text-[10.5px] font-bold text-slate-900 leading-tight" dir="ltr">
          {persian}
        </div>
      )}
      {showGregorian && (
        <div className={`date-secondary font-mono text-[8.5px] font-semibold leading-tight ${showPersian ? 'text-slate-500 mt-0.5' : 'text-slate-900 font-bold'}`}>
          {gregorian}
        </div>
      )}
    </div>
  );
}
