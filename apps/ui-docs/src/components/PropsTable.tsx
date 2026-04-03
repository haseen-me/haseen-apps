interface Prop {
  name: string;
  type: string;
  default?: string;
  description: string;
}

interface PropsTableProps {
  props: Prop[];
}

export function PropsTable({ props }: PropsTableProps) {
  return (
    <div style={{
      border: '1px solid var(--docs-border)',
      borderRadius: 8,
      overflow: 'auto',
      marginTop: 12,
      marginBottom: 24,
    }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: 14,
      }}>
        <thead>
          <tr style={{ background: 'var(--docs-bg-tertiary)' }}>
            <th style={thStyle}>Prop</th>
            <th style={thStyle}>Type</th>
            <th style={thStyle}>Default</th>
            <th style={thStyle}>Description</th>
          </tr>
        </thead>
        <tbody>
          {props.map((prop) => (
            <tr key={prop.name} style={{ borderTop: '1px solid var(--docs-border)' }}>
              <td style={tdStyle}>
                <code style={{ color: 'var(--docs-accent)', fontSize: 13, fontFamily: 'var(--docs-font-mono)' }}>
                  {prop.name}
                </code>
              </td>
              <td style={tdStyle}>
                <code style={{ fontSize: 12, fontFamily: 'var(--docs-font-mono)', color: 'var(--docs-text-secondary)' }}>
                  {prop.type}
                </code>
              </td>
              <td style={tdStyle}>
                {prop.default ? (
                  <code style={{ fontSize: 12, fontFamily: 'var(--docs-font-mono)', color: 'var(--docs-text-tertiary)' }}>
                    {prop.default}
                  </code>
                ) : (
                  <span style={{ color: 'var(--docs-text-tertiary)' }}>—</span>
                )}
              </td>
              <td style={{ ...tdStyle, color: 'var(--docs-text-secondary)' }}>
                {prop.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 16px',
  fontWeight: 600,
  fontSize: 12,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--docs-text-secondary)',
  whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 16px',
  verticalAlign: 'top',
};
