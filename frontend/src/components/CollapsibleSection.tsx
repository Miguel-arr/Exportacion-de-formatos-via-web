import { useState, ReactNode } from 'react';

interface CollapsibleSectionProps {
  titulo: string;
  children: ReactNode;
  defaultAbierto?: boolean;
  styles?: any;
}

export default function CollapsibleSection({ 
  titulo, 
  children, 
  defaultAbierto = false,
  styles = defaultStyles
}: CollapsibleSectionProps) {
  const [abierto, setAbierto] = useState(defaultAbierto);

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader} onClick={() => setAbierto(!abierto)}>
        <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>{titulo}</h3>
        <span style={{ fontSize: '20px', color: '#64748b' }}>{abierto ? '▲' : '▼'}</span>
      </div>
      {abierto && <div style={styles.cardBody}>{children}</div>}
    </div>
  );
}

const defaultStyles = {
  card: { background: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  cardHeader: { background: '#f8fafc', padding: '15px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' },
  cardBody: { padding: '24px' },
};
