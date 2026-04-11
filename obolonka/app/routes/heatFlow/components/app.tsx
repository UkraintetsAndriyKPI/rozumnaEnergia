import React, { useState, useCallback, useRef, useEffect, type JSX } from 'react';
import {
    ReactFlow,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
    Background,
    BackgroundVariant,
    Controls,
    useReactFlow,
    ReactFlowProvider,
    type Node,
    type Edge,
    type OnNodesChange,
    type OnEdgesChange,
    type OnConnect,
    type Connection,
    type XYPosition
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Sidebar, nodeTypes } from './sidebar';

const initialNodes: Node[] = [];

function FlowInner(): JSX.Element {

    const [mounted, setMounted] = useState(false);
    const [sidebarWidth, setSidebarWidth] = useState(200);
    const [nodes, setNodes] = useState<Node[]>(initialNodes);
    const [edges, setEdges] = useState<Edge[]>([]);

    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const { screenToFlowPosition } = useReactFlow();

    useEffect(() => {
        const saved = localStorage.getItem('sidebar-width');
        if (saved) setSidebarWidth(parseInt(saved, 10));
        setMounted(true); // Позначаємо, що ми на клієнті
    }, []);




    const onNodesChange: OnNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );

    const onEdgesChange: OnEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );

    const onConnect: OnConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        []
    );

    const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');

            if (!type) {
                return;
            }

            const position: XYPosition = screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            const newNode: Node = {
                id: `node_${Date.now()}`,
                type,
                position,
                data: { label: type === 'house' ? 'House' : 'Heat Source' },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [screenToFlowPosition]
    );

    // Поки не змонтовано, рендеримо порожній блок або скелетон
    if (!mounted) return (
        <div className="flex w-screen h-screen justify-center items-center">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
    );


    return (
        <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
            <Sidebar width={sidebarWidth} setWidth={setSidebarWidth} />

            <div
                style={{ flexGrow: 1, height: '100%', position: 'relative' }}
                ref={reactFlowWrapper}
            >
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    nodeTypes={nodeTypes}
                    fitView
                >
                    <Background gap={20} variant={BackgroundVariant.Cross} />
                    <Controls />
                </ReactFlow>
            </div>
        </div>
    );
}

export default function App(): JSX.Element {
    
    return (
        <ReactFlowProvider>
            <FlowInner />
        </ReactFlowProvider>
    );
}
