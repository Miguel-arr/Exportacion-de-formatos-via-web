interface RadioGroupProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  options?: string[];
  styles?: any;
}

export default function RadioGroup({
  label,
  name,
  value,
  onChange,
  options = ['SI', 'NO', 'N/A'],
  styles = defaultStyles
}: RadioGroupProps) {
  return (
    <div style={styles.radioRow}>
      <span style={{ flex: 1, fontWeight: '700', fontSize: '14px', color: '#1f2937' }}>{label}</span>
      <div style={{ display: 'flex', gap: '10px' }}>
        {options.map(opt => (
          <label key={opt} style={{ ...styles.checkLabel, fontSize: '12px' }}>
            <input
              type="radio"
              name={name}
              value={opt}
              checked={value === opt}
              onChange={onChange}
              required
            />
            {' '}{opt}
          </label>
        ))}
      </div>
    </div>
  );
}

const defaultStyles = {
  radioRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', borderBottom: '1px solid #f1f5f9' },
  checkLabel: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#475569' },
};
