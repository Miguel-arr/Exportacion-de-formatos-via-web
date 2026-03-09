export const formStyles = {
  card: { background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  cardHeader: { background: '#f8fafc', padding: '15px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' },
  cardBody: { padding: '24px' },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' },
  grid2: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' },
  inputGroup: { display: 'flex', flexDirection: 'column' as const, gap: '7px' },
  input: { padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', width: '100%', boxSizing: 'border-box' as const },
  textarea: { padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', width: '100%', boxSizing: 'border-box' as const },
  checkLabel: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#475569' },
  radioRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 0', borderBottom: '1px solid #f1f5f9' },
  subTitle: { margin: '18px 0 14px 0', color: '#1f2937', fontSize: '16px', fontWeight: '700' },
  hr: { border: 'none', borderTop: '1px solid #e5e7eb', margin: '24px 0' },
  firmaBox: { padding: '18px', border: '1px dashed #cbd5e1', borderRadius: '8px', background: '#fcfcfc' },
  btnSecundario: { padding: '8px 16px', background: '#f1f5f9', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  btnPrimarioChico: { padding: '6px 12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  btnEliminar: { padding: '6px 10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' },
  btnSubmit: { width: '100%', padding: '16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', fontWeight: '600', marginTop: '10px' }
};
