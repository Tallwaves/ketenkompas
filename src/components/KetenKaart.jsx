import React, { useState, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const STATUS_COLOR  = { ok: '#1d9e75', warning: '#ba7517', danger: '#e24b4a', neutral: '#888780' };
const STATUS_BG     = { ok: '#f0fdf4', warning: '#fefce8', danger: '#fef2f2', neutral: '#f8fafc' };
const STATUS_LABEL  = { ok: 'Stabiel', warning: 'Aandacht vereist', danger: 'Kritiek', neutral: 'Neutraal' };

const WaterschapNode = ({ data, selected }) => (
  <div style={{
    background: selected ? '#dbeafe' : '#eff6ff',
    border: `1.5px solid ${selected ? '#3b82f6' : '#93c5fd'}`,
    borderLeft: '4px solid #185fa5',
    borderRadius: '8px',
    padding: '8px 12px',
    minWidth: '130px',
    boxShadow: selected ? '0 0 0 2px #bfdbfe' : '0 1px 3px rgba(0,0,0,0.08)',
    cursor: 'pointer',
  }}>
    <Handle type="source" position={Position.Right} style={{ background: '#185fa5' }} />
    <div style={{ fontSize: '9px', fontWeight: 700, color: '#185fa5', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Waterschap</div>
    <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e40af' }}>{data.naam}</div>
    <div style={{ fontSize: '10px', color: '#6b7280', marginTop: 1 }}>{data.capaciteit}</div>
  </div>
);

const VerwerkerNode = ({ data, selected }) => (
  <div style={{
    background: selected ? '#1e3a5f' : '#0e1b2a',
    border: `2px solid ${selected ? '#60a5fa' : '#185fa5'}`,
    borderRadius: '10px',
    padding: '14px 20px',
    minWidth: '160px',
    boxShadow: selected ? '0 0 0 3px #bfdbfe' : '0 2px 8px rgba(0,0,0,0.25)',
    cursor: 'pointer',
    textAlign: 'center',
  }}>
    <Handle type="target" position={Position.Left}  style={{ background: '#60a5fa' }} />
    <Handle type="source" position={Position.Right} style={{ background: '#60a5fa' }} />
    <div style={{ fontSize: '9px', fontWeight: 700, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Verwerker</div>
    <div style={{ fontSize: '20px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>{data.naam}</div>
    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: 3 }}>{data.capaciteit}</div>
  </div>
);

const InstallatieNode = ({ data, selected }) => {
  const c = STATUS_COLOR[data.status] || STATUS_COLOR.neutral;
  const bg = STATUS_BG[data.status] || STATUS_BG.neutral;
  return (
    <div style={{
      background: selected ? '#fff' : bg,
      border: `1px solid ${c}`,
      borderLeft: `4px solid ${c}`,
      borderRadius: '8px',
      padding: '10px 14px',
      minWidth: '150px',
      boxShadow: selected ? `0 0 0 2px ${c}40` : '0 1px 3px rgba(0,0,0,0.08)',
      cursor: 'pointer',
    }}>
      <Handle type="target" position={Position.Left}  style={{ background: c }} />
      <Handle type="source" position={Position.Right} style={{ background: c }} />
      <div style={{ fontSize: '9px', fontWeight: 700, color: c, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Installatie</div>
      <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{data.naam}</div>
      <div style={{ fontSize: '10px', color: '#6b7280', marginTop: 1 }}>{data.capaciteit}</div>
    </div>
  );
};

const ReststroomNode = ({ data, selected }) => (
  <div style={{
    background: selected ? '#f1f5f9' : '#f8fafc',
    border: `1.5px solid ${selected ? '#64748b' : '#cbd5e1'}`,
    borderRadius: '20px',
    padding: '7px 14px',
    minWidth: '130px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    cursor: 'pointer',
    textAlign: 'center',
  }}>
    <Handle type="target" position={Position.Left} style={{ background: '#888780' }} />
    <div style={{ fontSize: '9px', fontWeight: 700, color: '#888780', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 1 }}>Reststroom</div>
    <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569' }}>{data.naam}</div>
  </div>
);

const nodeTypes = {
  waterschap: WaterschapNode,
  verwerker:  VerwerkerNode,
  installatie: InstallatieNode,
  reststroom: ReststroomNode,
};

const NODE_DETAILS = {
  agv:       { naam: 'AGV',              type: 'Waterschap',  capaciteit: '~120 ton/dag', status: 'ok',      risicovlaggen: [] },
  hhnk:      { naam: 'HHNK',             type: 'Waterschap',  capaciteit: '~95 ton/dag',  status: 'ok',      risicovlaggen: [] },
  rijnland:  { naam: 'Rijnland',          type: 'Waterschap',  capaciteit: '~85 ton/dag',  status: 'ok',      risicovlaggen: [] },
  hhsk:      { naam: 'HHSK',             type: 'Waterschap',  capaciteit: '~60 ton/dag',  status: 'ok',      risicovlaggen: [] },
  waternet:  { naam: 'Waternet / Overig', type: 'Waterschap',  capaciteit: '~40 ton/dag',  status: 'ok',      risicovlaggen: [] },
  hvc:       { naam: 'HVC',              type: 'Verwerker',   capaciteit: '450 ton/dag',  status: 'warning', risicovlaggen: ['Enige verwerker GR Slib', 'Contract afloop 2026', 'Hoge afhankelijkheidsgraad'] },
  svi:       { naam: 'SVI — Dordrecht',   type: 'Installatie', capaciteit: '250 ton/dag',  status: 'warning', risicovlaggen: ['Onderhoud gepland Q2 2026', 'Beperkte reservecapaciteit'] },
  sdi:       { naam: 'SDI — Alkmaar',     type: 'Installatie', capaciteit: '200 ton/dag',  status: 'danger',  risicovlaggen: ['Storing actief', 'Uitval verwacht 3-4 weken', 'Noodopslag in gebruik'] },
  granulaat: { naam: 'Granulaat BEC',     type: 'Reststroom',  capaciteit: 'n.v.t.',       status: 'ok',      risicovlaggen: [] },
  fosfaat:   { naam: 'Fosfaat Puraloop',  type: 'Reststroom',  capaciteit: 'n.v.t.',       status: 'ok',      risicovlaggen: [] },
};

const initialNodes = [
  { id: 'agv',       type: 'waterschap',  position: { x: 0,   y: 0   }, data: NODE_DETAILS.agv },
  { id: 'hhnk',      type: 'waterschap',  position: { x: 0,   y: 75  }, data: NODE_DETAILS.hhnk },
  { id: 'rijnland',  type: 'waterschap',  position: { x: 0,   y: 150 }, data: NODE_DETAILS.rijnland },
  { id: 'hhsk',      type: 'waterschap',  position: { x: 0,   y: 225 }, data: NODE_DETAILS.hhsk },
  { id: 'waternet',  type: 'waterschap',  position: { x: 0,   y: 300 }, data: NODE_DETAILS.waternet },
  { id: 'hvc',       type: 'verwerker',   position: { x: 290, y: 130 }, data: NODE_DETAILS.hvc },
  { id: 'svi',       type: 'installatie', position: { x: 540, y: 65  }, data: NODE_DETAILS.svi },
  { id: 'sdi',       type: 'installatie', position: { x: 540, y: 215 }, data: NODE_DETAILS.sdi },
  { id: 'fosfaat',   type: 'reststroom',  position: { x: 775, y: 78  }, data: NODE_DETAILS.fosfaat },
  { id: 'granulaat', type: 'reststroom',  position: { x: 775, y: 228 }, data: NODE_DETAILS.granulaat },
];

const EDGE_BASE = { type: 'smoothstep', labelStyle: { fontSize: 9, fill: '#6b7280', fontWeight: 600 }, labelBgStyle: { fill: '#f8fafc', fillOpacity: 0.85 } };

const initialEdges = [
  { id: 'e-agv-hvc',      source: 'agv',      target: 'hvc', label: '120 t/d', ...EDGE_BASE, style: { stroke: '#93c5fd', strokeWidth: 1.5 } },
  { id: 'e-hhnk-hvc',     source: 'hhnk',     target: 'hvc', label: '95 t/d',  ...EDGE_BASE, style: { stroke: '#93c5fd', strokeWidth: 1.5 } },
  { id: 'e-rijnland-hvc', source: 'rijnland',  target: 'hvc', label: '85 t/d',  ...EDGE_BASE, style: { stroke: '#93c5fd', strokeWidth: 1.5 } },
  { id: 'e-hhsk-hvc',     source: 'hhsk',     target: 'hvc', label: '60 t/d',  ...EDGE_BASE, style: { stroke: '#93c5fd', strokeWidth: 1.5 } },
  { id: 'e-waternet-hvc', source: 'waternet', target: 'hvc', label: '40 t/d',  ...EDGE_BASE, style: { stroke: '#93c5fd', strokeWidth: 1.5 } },
  { id: 'e-hvc-svi',      source: 'hvc',      target: 'svi',       type: 'smoothstep', style: { stroke: '#185fa5', strokeWidth: 2 } },
  { id: 'e-hvc-sdi',      source: 'hvc',      target: 'sdi',       type: 'smoothstep', style: { stroke: '#185fa5', strokeWidth: 2 } },
  { id: 'e-svi-fosfaat',  source: 'svi',      target: 'fosfaat',   type: 'smoothstep', style: { stroke: '#ba7517', strokeWidth: 1.5, strokeDasharray: '5 3' } },
  { id: 'e-sdi-granulaat',source: 'sdi',      target: 'granulaat', type: 'smoothstep', style: { stroke: '#e24b4a', strokeWidth: 1.5, strokeDasharray: '5 3' } },
];

const DetailPanel = ({ nodeId, onClose }) => {
  const d = NODE_DETAILS[nodeId];
  if (!d) return null;
  const color = STATUS_COLOR[d.status];
  const bg    = STATUS_BG[d.status];
  return (
    <div style={{
      width: '270px',
      background: '#fff',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      borderLeft: `4px solid ${color}`,
      padding: '20px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      flexShrink: 0,
      overflowY: 'auto',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', marginBottom: 4 }}>{d.type}</div>
          <div style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.2 }}>{d.naam}</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '20px', lineHeight: 1, padding: '0 4px', marginTop: '-2px' }}>×</button>
      </div>

      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: bg, border: `1px solid ${color}`, borderRadius: 20, padding: '3px 10px', fontSize: 10, fontWeight: 700, color, marginBottom: 16 }}>
        {STATUS_LABEL[d.status]}
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.08em', marginBottom: 4 }}>Capaciteit</div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>{d.capaciteit}</div>
      </div>

      <div>
        <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.08em', marginBottom: 6 }}>Risicovlaggen</div>
        {d.risicovlaggen.length === 0 ? (
          <div style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>Geen actieve risicovlaggen</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {d.risicovlaggen.map((r, i) => (
              <div key={i} style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '4px 8px', fontSize: 11, color: '#991b1b', fontWeight: 500 }}>
                ⚑ {r}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const KetenKaart = () => {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const onNodeClick  = useCallback((_, node) => setSelectedNodeId(node.id), []);
  const onPaneClick  = useCallback(() => setSelectedNodeId(null), []);

  return (
    <div>
      <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8' }}>GR Slib — Ketenkaart</span>
        <span style={{ fontSize: '9px', color: '#cbd5e1' }}>•</span>
        <span style={{ fontSize: '9px', color: '#94a3b8' }}>Klik een node voor details</span>
      </div>
      <div style={{ display: 'flex', gap: 16, height: 580 }}>
        <div style={{ flex: 1, borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.18 }}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="#e2e8f0" gap={20} size={1} style={{ background: '#f8fafc' }} />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>
        {selectedNodeId && (
          <DetailPanel nodeId={selectedNodeId} onClose={() => setSelectedNodeId(null)} />
        )}
      </div>
    </div>
  );
};

export default KetenKaart;
