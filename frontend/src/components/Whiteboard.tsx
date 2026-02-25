import React, { useRef, useEffect, useState } from 'react';
import { socketService } from '../services/socketService';

interface WhiteboardProps {
    sessionCode: string;
    isTeacher: boolean;
    onClose: () => void;
}

const Whiteboard: React.FC<WhiteboardProps> = ({ sessionCode, isTeacher, onClose }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#ffffff');
    const [brushSize, setBrushSize] = useState(3);
    const [tool, setTool] = useState<'pen' | 'eraser'>('pen');

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const resizeCanvas = () => {
            const parent = canvas.parentElement;
            if (parent) {
                canvas.width = parent.clientWidth;
                canvas.height = parent.clientHeight - 60; // Subtract toolbar height

                // Redraw background
                ctx.fillStyle = '#1e1e1e';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Socket Listeners for Students (and Teacher for Sync)
        socketService.onWhiteboardDraw((data) => {
            drawOnCanvas(data.x0, data.y0, data.x1, data.y1, data.color, data.size, false);
        });

        socketService.onWhiteboardClear(() => {
            ctx.fillStyle = '#1e1e1e';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        });

        socketService.onWhiteboardClose(() => {
            if (!isTeacher) onClose();
        });

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            socketService.offWhiteboardEvents();
        };
    }, []);

    const drawOnCanvas = (x0: number, y0: number, x1: number, y1: number, strokeColor: string, strokeSize: number, emit: boolean) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeSize;
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.closePath();

        if (emit && isTeacher) {
            socketService.emitWhiteboardDraw(sessionCode, { x0, y0, x1, y1, color: strokeColor, size: strokeSize });
        }
    };

    const handleMouseDown = () => {
        if (!isTeacher) return;
        setIsDrawing(true);
    };

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isTeacher || !isDrawing) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x1 = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
        const y1 = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

        // Use previous coordinates to draw a smooth line
        const x0 = (canvas as any).lastX || x1;
        const y0 = (canvas as any).lastY || y1;

        drawOnCanvas(x0, y0, x1, y1, tool === 'eraser' ? '#1e1e1e' : color, brushSize, true);

        (canvas as any).lastX = x1;
        (canvas as any).lastY = y1;
    };

    const handleMouseUp = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            (canvas as any).lastX = undefined;
            (canvas as any).lastY = undefined;
        }
    };

    const clearBoard = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#1e1e1e';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            socketService.emitWhiteboardClear(sessionCode);
        }
    };

    return (
        <div className="glass-card anim-scale-up" style={{
            position: 'fixed',
            top: '5%',
            left: '5%',
            width: '90%',
            height: '90%',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            background: '#1e1e1e'
        }}>
            {/* Toolbar */}
            <div style={{
                height: '60px',
                background: 'rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 1.5rem',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--color-primary-light)' }}>
                        🎨 {isTeacher ? 'Whiteboard Tool' : 'Teacher\'s Whiteboard'}
                    </h3>

                    {isTeacher && (
                        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', marginLeft: '1rem' }}>
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                style={{ width: '30px', height: '30px', border: 'none', background: 'none' }}
                            />
                            <select
                                value={brushSize}
                                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                                className="form-input"
                                style={{ padding: '0.2rem', width: '60px' }}
                            >
                                <option value="2">Thin</option>
                                <option value="5">Med</option>
                                <option value="10">Thick</option>
                            </select>
                            <button
                                onClick={() => setTool('pen')}
                                className={`btn ${tool === 'pen' ? 'btn-primary' : 'btn-secondary'}`}
                                style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}
                            >
                                Pen
                            </button>
                            <button
                                onClick={() => setTool('eraser')}
                                className={`btn ${tool === 'eraser' ? 'btn-primary' : 'btn-secondary'}`}
                                style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}
                            >
                                Eraser
                            </button>
                            <button
                                onClick={clearBoard}
                                className="btn btn-secondary"
                                style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem', color: '#ef4444' }}
                            >
                                Clear
                            </button>
                        </div>
                    )}
                </div>

                <button
                    onClick={onClose}
                    style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}
                >
                    &times;
                </button>
            </div>

            {/* Canvas Area */}
            <div style={{ flex: 1, position: 'relative', cursor: isTeacher ? (tool === 'eraser' ? 'cell' : 'crosshair') : 'default' }}>
                <canvas
                    ref={canvasRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseOut={handleMouseUp}
                    onTouchStart={handleMouseDown}
                    onTouchMove={handleMouseMove}
                    onTouchEnd={handleMouseUp}
                    style={{ display: 'block' }}
                />
                {!isTeacher && (
                    <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        padding: '4px 8px',
                        background: 'rgba(0,0,0,0.5)',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        color: 'rgba(255,255,255,0.7)'
                    }}>
                        View Only
                    </div>
                )}
            </div>
        </div>
    );
};

export default Whiteboard;
