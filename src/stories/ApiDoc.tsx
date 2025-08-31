import React, { useState } from 'react';
import type { ApiService, ApiMethod } from './api.schemas';

export function ApiDoc({ services }: { services: ApiService[] }) {
  return (
    <div style={{ padding: 16, fontFamily: 'ui-sans-serif, system-ui' }}>
      <h1 style={{ marginBottom: 8 }}>API Reference</h1>
      <p style={{ color: '#555', marginBottom: 24 }}>
        프로젝트의 서비스 계층 메서드를 Swagger 스타일로 요약합니다.
      </p>

      {services.map((svc) => (
        <ServiceCard key={svc.name} service={svc} />
      ))}
    </div>
  );
}

function ServiceCard({ service }: { service: ApiService }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 16 }}>
      <div
        onClick={() => setOpen(!open)}
        style={{ cursor: 'pointer', padding: '12px 16px', background: '#f9fafb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <div>
          <strong>{service.name}</strong>
          <div style={{ color: '#666', fontSize: 12 }}>{service.module}</div>
        </div>
        <div style={{ color: '#888', fontSize: 12 }}>{open ? '▲' : '▼'}</div>
      </div>
      {open && (
        <div style={{ padding: 16 }}>
          {service.methods.map((m) => (
            <MethodRow key={m.name} method={m} />
          ))}
        </div>
      )}
    </div>
  );
}

function MethodRow({ method }: { method: ApiMethod }) {
  return (
    <details style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12, marginTop: 12 }}>
      <summary style={{ listStyle: 'none', cursor: 'pointer', fontWeight: 600 }}>{method.name}</summary>
      {method.description && <p style={{ marginTop: 8 }}>{method.description}</p>}
      {method.params && method.params.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontWeight: 600 }}>Params</div>
          <ul style={{ marginTop: 4 }}>
            {method.params.map((p) => (
              <li key={p.name}>
                <code>{p.name}</code>
                {': '}
                <code>{p.type}</code>
                {p.required ? ' (required)' : ''}
                {p.description ? ` - ${p.description}` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}
      {method.returns && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontWeight: 600 }}>Returns</div>
          <code>{method.returns}</code>
        </div>
      )}
      {'responseExample' in method && method.responseExample !== undefined && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontWeight: 600 }}>Response Example</div>
          <pre style={{ background: '#0b1020', color: '#e3e3e3', padding: 12, borderRadius: 6, overflow: 'auto' }}>
            {JSON.stringify(method.responseExample, null, 2)}
          </pre>
        </div>
      )}
      {method.example && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontWeight: 600 }}>Example</div>
          <pre style={{ background: '#0b1020', color: '#e3e3e3', padding: 12, borderRadius: 6, overflow: 'auto' }}>
            {method.example}
          </pre>
        </div>
      )}
      {method.notes && method.notes.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontWeight: 600 }}>Notes</div>
          <ul>
            {method.notes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>
      )}
    </details>
  );
}

export default ApiDoc;
