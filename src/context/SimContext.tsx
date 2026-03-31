import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { TopologyType } from '@/lib/topologies';
import type { SimulationResult, LogEntry } from '@/lib/simulation';

interface SimState {
  topology: TopologyType;
  nodeCount: number;
  source: string;
  destination: string;
  packetSize: number;
  congestion: boolean;
  showPaths: boolean;
  showTrails: boolean;
  speed: number;
  failedNodes: Set<string>;
  failedLinks: Set<string>;
  isRunning: boolean;
  activePath: string[];
  logs: LogEntry[];
  results: SimulationResult[];
  metrics: { latency: number; throughput: number; packetLoss: number; hops: number } | null;
}

type Action =
  | { type: 'SET_TOPOLOGY'; payload: TopologyType }
  | { type: 'SET_NODE_COUNT'; payload: number }
  | { type: 'SET_SOURCE'; payload: string }
  | { type: 'SET_DESTINATION'; payload: string }
  | { type: 'SET_PACKET_SIZE'; payload: number }
  | { type: 'SET_CONGESTION'; payload: boolean }
  | { type: 'SET_SHOW_PATHS'; payload: boolean }
  | { type: 'SET_SHOW_TRAILS'; payload: boolean }
  | { type: 'SET_SPEED'; payload: number }
  | { type: 'TOGGLE_FAILED_NODE'; payload: string }
  | { type: 'TOGGLE_FAILED_LINK'; payload: string }
  | { type: 'SET_RUNNING'; payload: boolean }
  | { type: 'SET_ACTIVE_PATH'; payload: string[] }
  | { type: 'ADD_LOGS'; payload: LogEntry[] }
  | { type: 'CLEAR_LOGS' }
  | { type: 'ADD_RESULT'; payload: SimulationResult }
  | { type: 'SET_METRICS'; payload: SimState['metrics'] }
  | { type: 'RESET' };

const initial: SimState = {
  topology: 'mesh',
  nodeCount: 6,
  source: 'A',
  destination: 'D',
  packetSize: 512,
  congestion: false,
  showPaths: true,
  showTrails: true,
  speed: 1,
  failedNodes: new Set(),
  failedLinks: new Set(),
  isRunning: false,
  activePath: [],
  logs: [],
  results: [],
  metrics: null,
};

function reducer(state: SimState, action: Action): SimState {
  switch (action.type) {
    case 'SET_TOPOLOGY': return { ...state, topology: action.payload, failedNodes: new Set(), failedLinks: new Set(), activePath: [], logs: [] };
    case 'SET_NODE_COUNT': return { ...state, nodeCount: action.payload, failedNodes: new Set(), failedLinks: new Set(), activePath: [], logs: [] };
    case 'SET_SOURCE': return { ...state, source: action.payload };
    case 'SET_DESTINATION': return { ...state, destination: action.payload };
    case 'SET_PACKET_SIZE': return { ...state, packetSize: action.payload };
    case 'SET_CONGESTION': return { ...state, congestion: action.payload };
    case 'SET_SHOW_PATHS': return { ...state, showPaths: action.payload };
    case 'SET_SHOW_TRAILS': return { ...state, showTrails: action.payload };
    case 'SET_SPEED': return { ...state, speed: action.payload };
    case 'TOGGLE_FAILED_NODE': {
      const s = new Set(state.failedNodes);
      s.has(action.payload) ? s.delete(action.payload) : s.add(action.payload);
      return { ...state, failedNodes: s };
    }
    case 'TOGGLE_FAILED_LINK': {
      const s = new Set(state.failedLinks);
      s.has(action.payload) ? s.delete(action.payload) : s.add(action.payload);
      return { ...state, failedLinks: s };
    }
    case 'SET_RUNNING': return { ...state, isRunning: action.payload };
    case 'SET_ACTIVE_PATH': return { ...state, activePath: action.payload };
    case 'ADD_LOGS': return { ...state, logs: [...state.logs, ...action.payload] };
    case 'CLEAR_LOGS': return { ...state, logs: [] };
    case 'ADD_RESULT': return { ...state, results: [...state.results.slice(-19), action.payload] };
    case 'SET_METRICS': return { ...state, metrics: action.payload };
    case 'RESET': return { ...initial };
    default: return state;
  }
}

const SimContext = createContext<{ state: SimState; dispatch: React.Dispatch<Action> } | null>(null);

export function SimProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  return <SimContext.Provider value={{ state, dispatch }}>{children}</SimContext.Provider>;
}

export function useSim() {
  const ctx = useContext(SimContext);
  if (!ctx) throw new Error('useSim must be inside SimProvider');
  return ctx;
}
