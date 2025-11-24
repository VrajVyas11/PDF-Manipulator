import {
    useState,
    useEffect,
    useMemo,
} from 'react';

import {
    ScrollStrategy,
} from '@embedpdf/plugin-scroll/react';

import { usePan } from '@embedpdf/plugin-pan/react';

import { useZoom, ZoomMode } from '@embedpdf/plugin-zoom/react';
import { useRotate } from
    '@embedpdf/plugin-rotate/react';
import { usePrintCapability } from
    '@embedpdf/plugin-print/react';
import { SpreadMode, useSpread } from '@embedpdf/plugin-spread/react';
import {
    useAnnotationCapability,
} from '@embedpdf/plugin-annotation/react';
import { useHistoryCapability } from
    '@embedpdf/plugin-history/react';
import { useCaptureCapability } from '@embedpdf/plugin-capture/react'
import { useRedactionCapability } from '@embedpdf/plugin-redaction/react'
import { useExportCapability } from '@embedpdf/plugin-export/react'
// Lucide icons for toolbar
import {
    ZoomIn,
    ZoomOut,
    Printer,
    ChevronDown,
    X,
    Type,
    Pencil,
    Highlighter,
    MousePointer,
    Hand,
    Trash2,
    Image as ImageIcon,
    Undo,
    Redo,

    Waves,
    Circle,
    Square,
    ArrowUpRight,
    CornerDownRight,
    Underline,
    ChevronDown as DropdownIcon,
    Shapes as ShapesIcon,
    Download,
    Camera,
    Tickets,
    TextCursorInput,
    SquareDashedMousePointer,
    FileCog,
    RotateCw,
    RotateCcw,
    ArrowUpDown,
    ArrowLeftRight,
    BookOpen,
    Book,
    Maximize2,
    Maximize,
    DownloadIcon,
    MoveRight,
} from 'lucide-react';

import Image from 'next/image';

const MainToolbar = ({
    annotationMode,
    scrollLayout,
    setScrollLayout,
    setAnnotationMode,
    annotationApiRef,
    setSelectedAnnotation,
    setSidebarTab,
    setShowSidebar,
    toolDropdown,
    setToolDropdown,
}) => {
    const { provides: zoomApi, state: zoomState } = useZoom();
    const { provides: rotateApi } = useRotate();
    const { provides: printApi } = usePrintCapability();
    const { provides: exportApi } = useExportCapability();
    const { provides: panApi } = usePan();
    const { provides: annotationApi } = useAnnotationCapability();
    const { provides: historyApi } = useHistoryCapability();
    const { provides: redactApi } = useRedactionCapability();
    const { provides: spread } = useSpread();
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const { provides: capture } = useCaptureCapability();
    const [selectedMode, setSelectedMode] = useState(() => scrollLayout === ScrollStrategy.Vertical ? 'scroll-vertical' : 'scroll-horizontal');
    const [layoutDropdown, setLayoutDropdown] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);

    // Zoom-specific state and handlers
    const [zoomInputValue, setZoomInputValue] = useState('');
    const [zoomDropdownOpen, setZoomDropdownOpen] = useState(false);
    const zoomLevels = [0.25, 0.5, 1, 2, 4, 8, 16]; // 25%, 50%, 100%, 200%, 400%, 800%, 1600%
    const zoom = zoomState?.currentZoomLevel ?? 1;
    const zoomPercentage = Math.round(zoom * 100);

    useEffect(() => {
        zoomApi?.requestZoom(ZoomMode.FitPage);
    }, [zoomApi])

    useEffect(() => {
        setZoomInputValue(zoomPercentage.toString());
    }, [zoomPercentage]);

    const handleZoomInputChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, ''); // Only allow numbers
        setZoomInputValue(value);
    };

    const handleZoomSubmit = (e) => {
        e.preventDefault();
        const parsedValue = parseFloat(zoomInputValue) / 100;
        if (!isNaN(parsedValue) && parsedValue > 0) {
            zoomApi?.requestZoom(parsedValue);
        }
        setZoomDropdownOpen(false);
    };

    const handleZoomSelect = (level) => {
        zoomApi?.requestZoom(level);
        setZoomDropdownOpen(false);
    };

    const handleFitToPage = () => {
        zoomApi?.requestZoom(ZoomMode.FitPage);
        setZoomDropdownOpen(false);
    };

    const handleFitToWidth = () => {
        zoomApi?.requestZoom(ZoomMode.FitWidth);
        setZoomDropdownOpen(false);
    };

    const ZoomDropdown = () => (
        <div className="absolute top-full  left-0 mt-2 bg-gray-950/95 border border-slate-700/30 rounded-xl shadow-2xl z-50 min-w-[120px] overflow-hidden">
            {/* Fit options */}
            <button
                onClick={handleFitToPage}
                className="w-full px-4 py-3 text-left text-sm text-slate-300 hover:bg-slate-700/50 transition-all duration-300 flex items-center space-x-3"
            >
                <Maximize2 size={16} strokeWidth={3} />
                <span>Fit to Page</span>
            </button>
            <button
                onClick={handleFitToWidth}
                className="w-full px-4 py-3 text-left text-sm text-slate-300 hover:bg-slate-700/50 transition-all duration-300 flex items-center space-x-3"
            >
                <Maximize size={16} strokeWidth={3} />
                <span>Fit to Width</span>
            </button>
            <div className="px-4 py-2 text-xs text-slate-500 uppercase font-semibold border-t border-slate-700/30">Presets</div>
            {zoomLevels.map((level) => {
                const percentage = Math.round(level * 100);
                const isActive = Math.abs(zoom - level) < 0.01;
                return (
                    <button
                        key={level}
                        onClick={() => handleZoomSelect(level)}
                        className={`w-full px-4 py-3 text-left text-sm text-slate-300 hover:bg-slate-700/50 transition-all duration-300 flex items-center space-x-3 ${isActive ? 'bg-blue-900/30 text-white' : ''}`}
                    >
                        <ZoomIn size={16} strokeWidth={3} />
                        <span>{percentage}%</span>
                    </button>
                );
            })}
        </div>
    );

    useEffect(() => {
        if (scrollLayout === ScrollStrategy.Vertical) {
            setSelectedMode('scroll-vertical');
        } else if (scrollLayout === ScrollStrategy.Horizontal) {
            setSelectedMode('scroll-horizontal');
        }
    }, [scrollLayout]);

    useEffect(() => {
        if (annotationApi) {
            annotationApiRef.current = annotationApi;
        }
    }, [annotationApi, annotationApiRef]);

    // selection listener
    useEffect(() => {
        if (!annotationApi) return;
        const unsub = annotationApi.onStateChange?.((state) => {
            if (state?.selectedUid) {
                const sel = annotationApi.getSelectedAnnotation?.();
                setSelectedAnnotation(sel);
                // Open styles sidebar when selected
                setShowSidebar(true);
                setSidebarTab('styles');
            } else {
                setSelectedAnnotation(null);
            }
        });
        return () => {
            try { if (unsub) unsub(); } catch { }
        };
    }, [annotationApi, setSelectedAnnotation, setShowSidebar, setSidebarTab]);

    // Undo/redo state management
    useEffect(() => {
        const checkUndoRedo = async () => {
            if (historyApi) {
                try {
                    const undoState = typeof historyApi.canUndo === 'function'
                        ? await historyApi.canUndo()
                        : historyApi.canUndo;
                    const redoState = typeof historyApi.canRedo === 'function'
                        ? await historyApi.canRedo()
                        : historyApi.canRedo;

                    setCanUndo(!!undoState);
                    setCanRedo(!!redoState);
                } catch {
                    setCanUndo(false);
                    setCanRedo(false);
                }
            } else {
                setCanUndo(false);
                setCanRedo(false);
            }
        };

        checkUndoRedo();
        const interval = setInterval(checkUndoRedo, 100);
        return () => clearInterval(interval);
    }, [historyApi]);

    // register annotationAdded to style sticky notes
    useEffect(() => {
        const api = annotationApiRef.current || annotationApi;
        if (!api) return;
        const handler = async (event) => {
            const annotation = event.annotation ?? event;
            const type =
                annotation?.type ||
                annotation?.annotationType ||
                annotation?.object?.type;
            if (type && (type === 'freeText' || type === 'note' || type === 'text')) {
                try {
                    const pageIndex = annotation.pageIndex ?? annotation.object?.pageIndex ?? 0;
                    const id = annotation.id ?? annotation.object?.id;
                    if (api.updateAnnotation && id != null) {
                        await api.updateAnnotation(pageIndex, id, {
                            backgroundColor: 'rgba(15, 23, 42, 0.7)',
                            borderColor: 'rgba(100, 116, 139, 0.3)',
                        });
                    }
                } catch { }
                setTimeout(() => {
                    try {
                        let el =
                            document.querySelector(`[data-annotation-id="${annotation.id}"]`) ||
                            document.querySelector(`[data-annotation-id="${annotation.object?.id}"]`) ||
                            document.querySelector(`[data-annotation="${annotation.id}"]`);
                        if (!el) {
                            const candidates = Array.from(document.querySelectorAll('[data-annotation-type], .annotation--freetext, .freetext-annotation'));
                            for (const c of candidates) {
                                if ((c.textContent || '').trim() === (annotation.text || annotation.content || '')) {
                                    el = c;
                                    break;
                                }
                            }
                        }
                        if (el) el.classList.add('custom-sticky-note');
                    } catch { }
                }, 200);
            }
        };

        if (api.onAnnotationEvent) {
            const unsub = api.onAnnotationEvent((e) => {
                if (e.type === 'create') handler(e.annotation ?? e);
            });
            return () => unsub && unsub();
        }
        // fallback event names
        if (api.on) {
            try { api.on('annotationAdded', handler); } catch { }
            return () => { try { if (api.off) api.off('annotationAdded', handler); } catch { } };
        }
    }, [annotationApi, annotationApiRef]);


    useEffect(() => {
        if (!capture) return;

        const unsubscribe = capture.onCaptureArea((result) => {
            const newUrl = URL.createObjectURL(result.blob);
            setImageUrl(newUrl);
        });

        return () => {
            unsubscribe();
            if (imageUrl) URL.revokeObjectURL(imageUrl);
        };
    }, [capture, imageUrl]);


    const modeMap = useMemo(() => ({
        highlight: 'highlight',
        underline: 'underline',
        strikeout: 'strikeout',
        squiggly: 'squiggly',
        ink: 'ink',
        inkHighlighter: 'inkHighlighter',
        circle: 'circle',
        square: 'square',
        line: 'line',
        lineArrow: 'lineArrow',
        polygon: 'polygon',
        polyline: 'polyline',
        freeText: 'freeText',
        stamp: 'stamp',
        capture: 'capture',
        pan: null,
        select: null,
    }), []);

    useEffect(() => {
        if (annotationMode === 'pan') {
            panApi?.enablePan?.();
            annotationApi?.setActiveTool?.(null);
            setSidebarTab('thumbnails'); // Reset to thumbnails if pan
        } else {
            panApi?.disablePan?.();
            if (annotationMode === 'select') {
                annotationApi?.setActiveTool?.(null);
            } else {
                const toolId = modeMap[annotationMode];
                if (toolId) {
                    annotationApi?.setActiveTool?.(toolId);
                    // Open styles for tool
                    setShowSidebar(true);
                    setSidebarTab('styles');
                }
            }
        }
    }, [annotationMode, panApi, annotationApi, setShowSidebar, setSidebarTab, modeMap]);

    useEffect(() => {
        if (annotationMode === 'redactText') {
            redactApi?.toggleRedactSelection()
        }
        else if (annotationMode === 'redactSelection') {
            redactApi?.toggleMarqueeRedact()
        }
    }, [annotationMode, panApi, annotationApi, setShowSidebar, setSidebarTab, modeMap, redactApi]);

    //for imagge Capture toggle call as it was bugging out inline 
    useEffect(() => {
        if (annotationMode == 'capture') {
            capture.toggleMarqueeCapture()
        }
    }, [capture, annotationMode])

    const handleDeleteSelected = async () => {
        try {
            const api = annotationApiRef.current || annotationApi;
            const sel = api?.getSelectedAnnotation?.();
            if (!sel) return;
            const obj = sel.object ?? sel;
            const pageIndex = obj.pageIndex ?? sel.pageIndex;
            const id = obj.id ?? sel.id;
            if (api && pageIndex != null && id != null) {
                await api.deleteAnnotation?.(pageIndex, id);
            }
        } catch (e) {
            console.warn('Delete failed', e);
        }
    };

    const handleUndo = async () => {
        try {
            if (historyApi?.undo) {
                await historyApi.undo();
            }
        } catch (e) {
            console.warn('Undo failed', e);
        }
    };
    const handleRedo = async () => {
        try {
            if (historyApi?.redo) {
                await historyApi.redo();
            }
        } catch (e) {
            console.warn('Redo failed', e);
        }
    };


    const ToolDropdown = ({ group, onSelect, onClose }) => {
        const groups = {
            shapes: [
                { mode: 'circle', icon: Circle, label: 'Orb' },
                { mode: 'square', icon: Square, label: 'Cube' },
                { mode: 'polygon', icon: CornerDownRight, label: 'Prism' },
            ],
            lines: [
                { mode: 'line', icon: MoveRight, label: 'Line' },
                { mode: 'lineArrow', icon: ArrowUpRight, label: 'Arrow' },
                { mode: 'polyline', icon: CornerDownRight, label: 'Polyline' },
            ],
            markup: [
                { mode: 'highlight', icon: Highlighter, label: 'Highlight' },
                { mode: 'underline', icon: Underline, label: 'Underline' },
                { mode: 'strikeout', icon: X, label: 'Strikeout' },
                { mode: 'squiggly', icon: Waves, label: 'Squiggly' },
            ],
            ink: [
                { mode: 'ink', icon: Pencil, label: 'Pencil' },
                { mode: 'inkHighlighter', icon: Highlighter, label: 'Highlighter' },
            ],
            redact: [
                { mode: 'redactText', icon: TextCursorInput, label: 'Redact Text' },
                { mode: 'redactSelection', icon: SquareDashedMousePointer, label: 'Redact Selection' },
            ]
        };

        return (
            <div className="absolute top-full left-0 mt-2  bg-gray-950/95 border border-slate-700/30 rounded-xl shadow-2xl z-50 min-w-[200px] overflow-hidden">
                {groups[group]?.map(({ mode, icon: Icon, label }) => (
                    <button
                        key={mode}
                        onClick={() => {
                            onSelect(mode);
                            onClose();
                        }}
                        className={`w-full px-4 py-3 text-left text-sm text-slate-300 hover:bg-slate-700/50 transition-all duration-300 flex items-center space-x-3 ${annotationMode === mode ? 'bg-blue-900/30 text-white' : ''
                            }`}
                    >
                        <Icon strokeWidth={3} size={16} />
                        <span>{label}</span>
                    </button>
                ))}
            </div>
        );
    };
    // Add this new state in MainToolbar component
    const [pageMode, setPageMode] = useState('single'); // Initial state for page layout

    // Update handleModeSelect to handle both scroll and page modes
    const handleModeSelect = (mode) => {
        if (['scroll-vertical', 'scroll-horizontal'].includes(mode)) {
            setSelectedMode(mode);
            if (mode === 'scroll-vertical') {
                setScrollLayout(ScrollStrategy.Vertical);
            } else if (mode === 'scroll-horizontal') {
                setScrollLayout(ScrollStrategy.Horizontal);
            }
        } else if (['single', 'double'].includes(mode)) {
            setPageMode(mode);
            if (mode === 'single') {
                spread.setSpreadMode(SpreadMode.None);
            } else if (mode === 'double') {
                spread.setSpreadMode(SpreadMode.Odd);
            }
            // Apply page layout logic here, e.g., scrollApi?.setPageLayout(mode === 'double' ? 'facing' : 'continuous') or similar API call
        }
        setLayoutDropdown(null);
    };

    // Update isLayoutActive to check both selectedMode and pageMode

    const LayoutDropdown = ({ onSelect, onClose, selectedMode, pageMode, isHorizontal }) => {
        const rotateOptions = [
            { mode: 'rotate-cw', icon: RotateCw, label: 'Rotate Clockwise' },
            { mode: 'rotate-ccw', icon: RotateCcw, label: 'Rotate Counterclockwise' },
        ];

        const scrollOptions = [
            { mode: 'scroll-vertical', icon: ArrowUpDown, label: 'Scroll Vertical' },
            { mode: 'scroll-horizontal', icon: ArrowLeftRight, label: 'Scroll Horizontal' },
        ];

        const pageOptions = [
            { mode: 'single', icon: BookOpen, label: 'Single Page' },
            { mode: 'double', icon: Book, label: 'Double Page' },
        ];

        const handleRotate = (mode) => {
            if (mode === 'rotate-cw') {
                rotateApi?.rotateForward?.();
            } else if (mode === 'rotate-ccw') {
                // Assuming API supports backward or simulate by calling forward 3 times for 270 degrees equivalent
                rotateApi?.rotateForward?.();
                rotateApi?.rotateForward?.();
                rotateApi?.rotateForward?.();
            }
            onClose();
        };

        return (
            <div className="absolute top-full left-0 mt-2 bg-gray-950/95 border border-slate-700/30 rounded-xl shadow-2xl z-50 min-w-[200px] overflow-hidden">
                <div className="px-4 py-2 text-xs text-slate-500 uppercase font-semibold border-b border-slate-700/30">Rotate Page</div>
                {rotateOptions.map(({ mode, icon: Icon, label }) => (
                    <button
                        key={mode}
                        onClick={() => handleRotate(mode)}
                        className="w-full px-4 py-3 text-left text-sm text-slate-300 hover:bg-slate-700/50 transition-all duration-300 flex items-center space-x-3"
                    >
                        <Icon strokeWidth={3} size={16} />
                        <span>{label}</span>
                    </button>
                ))}
                <div className="px-4 py-2 text-xs text-slate-500 uppercase font-semibold border-t border-slate-700/30">Scroll Layout</div>
                {scrollOptions.map(({ mode, icon: Icon, label }) => {
                    const isActive = selectedMode === mode;
                    return (
                        <button
                            key={mode}
                            onClick={() => {
                                onSelect(mode);
                                onClose();
                            }}
                            className={`w-full px-4 py-3 text-left text-sm text-slate-300 hover:bg-slate-700/50 transition-all duration-300 flex items-center space-x-3 ${isActive ? 'bg-blue-900/30 text-white' : ''}`}
                        >
                            <Icon strokeWidth={3} size={16} />
                            <span>{label}</span>
                        </button>
                    );
                })}

                <div className="px-4 py-2 text-xs text-slate-500 uppercase font-semibold border-t border-slate-700/30">Page Layout</div>
                {pageOptions.map(({ mode, icon: Icon, label }) => {
                    const isActive = pageMode === mode;
                    return (
                        <button
                            disabled={isHorizontal}
                            key={mode}
                            onClick={() => {
                                onSelect(mode);
                                onClose();
                            }}
                            className={`w-full disabled:opacity-40 px-4 py-3 text-left text-sm text-slate-300 hover:bg-slate-700/50 transition-all duration-300 flex items-center space-x-3 ${isActive ? 'bg-blue-900/30 text-white' : ''}`}
                        >
                            <Icon strokeWidth={3} size={16} />
                            <span>{label}</span>
                        </button>
                    );
                })}
            </div>
        );
    };
    return (
        <>
            <div className="flex items-center justify-between flex-wrap">
                {imageUrl && <div className=' bg-black/80 z-50 flex justify-start items-center h-full w-full absolute inset-0'>
                    <div className='absolute px-7 flex flex-row items-center justify-between top-12 w-full'>
                        <h1 className=' flex flex-row text-xl justify-center items-center gap-3 w-fit'>
                            <Camera strokeWidth={3} className='w-6 h-6 ' />
                            Captured Image
                        </h1>
                        <div className=' gap-12 flex flex-row items-center'>
                            <a
                                href={imageUrl}
                                download={`PDF_Captured_Image.jpg`} className='flex flex-row items-center justify-center gap-3'>
                                <Download strokeWidth={3} className='w-5 h-5' />
                                Download
                            </a>
                            <button onClick={() => { setImageUrl(null); setAnnotationMode("select") }} className=''><X strokeWidth={3} className='w-5 h-5' /></button></div>
                    </div>
                    <Image width={300} height={300} className='w-auto h-auto' src={imageUrl} alt="Captured PDF area" />
                </div>
                }
                <div className="flex z-40 relative justify-between w-full items-center space-x-3 bg-gray-950/40  rounded-tr-3xl backdrop-blur-xl border-b border-slate-800/50 shadow-2xl px-6 pt-5 pb-4">
                    <div className="relative">
                        <button
                            onClick={() => setLayoutDropdown(layoutDropdown === 'layout' ? null : 'layout')}
                            className={`p-3.5 px-4 rounded-xl min-w-fit flex items-center gap-1 transition-all duration-300 flex-shrink-0 ${layoutDropdown === 'layout' ? ' !shadow-[inset_0_0_5px_rgba(100,100,255,0.6)] text-blue-300' : 'hover:bg-slate-700/30 !shadow-[inset_0_0_5px_rgba(200,200,200,0.2)] text-slate-300'}`}
                            title="Layout & Rotate"
                        >
                            <FileCog strokeWidth={3} size={16} />
                            <DropdownIcon strokeWidth={3} size={14} className={`ml-1 ${layoutDropdown === 'layout' ? "rotate-180" : ""}`} />
                        </button>
                        {layoutDropdown === 'layout' && (
                            <LayoutDropdown
                                onSelect={handleModeSelect}
                                onClose={() => setLayoutDropdown(null)}
                                selectedMode={selectedMode}
                                pageMode={pageMode}
                                isHorizontal={selectedMode === 'scroll-horizontal'}
                            />
                        )}
                    </div>
                    <div className="w-px h-8 bg-slate-700/30 mx-2 flex-shrink-0" />

                    {/*  Zoom Section */}
                    <div className="flex py-2.5 pr-4 min-w-fit items-center space-x-1 !shadow-[inset_0_0_5px_rgba(200,200,200,0.2)] rounded-xl relative">
                        <form onSubmit={handleZoomSubmit} className="flex  gap-1  items-center">
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="\d*"
                                className="h-6 w-10 border-0 bg-transparent p-0 -mt-0.5 text-right text-sm text-white focus:outline-none"
                                aria-label="Set zoom"
                                value={zoomInputValue}
                                onChange={handleZoomInputChange}
                            />
                            <span className="text-sm text-slate-400">%</span>
                        </form>

                        <div className="relative ">
                            <button
                                onClick={() => setZoomDropdownOpen(!zoomDropdownOpen)}
                                className="p-1 hover:bg-slate-700/30 rounded transition-all duration-300"
                                title="Zoom Options"
                            >
                                <ChevronDown strokeWidth={3} size={12} className={`text-slate-300 transition-transform duration-300 ${zoomDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {zoomDropdownOpen && <ZoomDropdown />}
                        </div>
                        <button
                            onClick={() => zoomApi?.zoomOut()}
                            className="p-1 hover:bg-slate-700/30 rounded transition-all duration-300"
                            title="Zoom Out"
                        >
                            <ZoomOut strokeWidth={3} size={16} className="text-slate-300" />
                        </button>
                        <button
                            onClick={() => zoomApi?.zoomIn()}
                            className="p-1 mr-5 hover:bg-slate-700/30 rounded transition-all duration-300"
                            title="Zoom In"
                        >
                            <ZoomIn strokeWidth={3} size={16} className="text-slate-300" />
                        </button>
                    </div>
                    <div className="w-px h-8 bg-slate-700/30 mx-2 flex-shrink-0" />

                    <button
                        onClick={() => setAnnotationMode('select')}
                        className={`p-3 rounded-xl transition-all duration-300 flex-shrink-0 ${annotationMode === 'select' ? ' text-white !shadow-[inset_0_0_5px_rgba(100,100,255,0.9)]' : '!shadow-[inset_0_0_5px_rgba(200,200,200,0.2)] text-slate-300'}`}
                        title="Selector"
                    >
                        <MousePointer strokeWidth={3} size={16} />
                    </button>
                    <button
                        onClick={() => setAnnotationMode('pan')}
                        className={`p-3 rounded-xl transition-all duration-300 flex-shrink-0 ${annotationMode === 'pan' ? ' text-white !shadow-[inset_0_0_5px_rgba(100,100,255,0.9)]' : '!shadow-[inset_0_0_5px_rgba(200,200,200,0.2)] text-slate-300'}`}
                        title="Drift"
                    >
                        <Hand strokeWidth={3} size={16} />
                    </button>
                    <div className="w-px h-8 bg-slate-700/30 mx-2 flex-shrink-0" />

                    <button
                        onClick={handleDeleteSelected}
                        className="p-3 rounded-xl transition-all duration-300 flex-shrink-0 hover:!shadow-[inset_0_0_5px_rgba(200,0,0,0.6)] text-red-300  !shadow-[inset_0_0_5px_rgba(200,0,0,0.4)]"
                        title="Vaporize"
                    >
                        <Trash2 size={16} />
                    </button>
                    <button
                        onClick={() => printApi?.print()}
                        className="p-3 !shadow-[inset_0_0_5px_rgba(200,200,200,0.2)]  rounded-xl transition-all duration-300"
                        title="print"
                    >
                        <Printer strokeWidth={3} size={16} className="text-slate-300" />
                    </button>

                    <button
                        onClick={() => exportApi?.download()}
                        className="p-3 !shadow-[inset_0_0_5px_rgba(200,200,200,0.2)]  rounded-xl transition-all duration-300"
                        title="download"
                    >
                        <DownloadIcon strokeWidth={3} size={16} className="text-slate-300" />
                    </button>
                    <div className="w-px h-8 bg-slate-700/30 mx-2 flex-shrink-0" />

                    <button
                        onClick={handleUndo}
                        disabled={!canUndo}
                        className={`p-3 !shadow-[inset_0_0_5px_rgba(200,200,200,0.2)]  rounded-xl transition-all duration-300 ${canUndo ? 'hover:bg-slate-700/30 text-slate-300' : 'opacity-40 cursor-not-allowed text-slate-500'}`}
                        title="Undo"
                    >
                        <Undo strokeWidth={3} size={16} />
                    </button>
                    <button
                        onClick={handleRedo}
                        disabled={!canRedo}
                        className={`p-3 !shadow-[inset_0_0_5px_rgba(200,200,200,0.2)]  rounded-xl transition-all duration-300 ${canRedo ? 'hover:bg-slate-700/30 text-slate-300' : 'opacity-40 cursor-not-allowed text-slate-500'}`}
                        title="Redo"
                    >
                        <Redo strokeWidth={3} size={16} />
                    </button>

                </div>

                {/* below toolbar */}
                <div className="flex relative z-10 justify-between w-fit items-center space-x-4 mx-auto bg-slate-900/40  rounded-b-3xl backdrop-blur-xl border border-t-0 border-slate-800/50 shadow-2xl px-5 py-3 ">

                    {/* Grouped Tool Buttons */}
                    {/* <div className="relative flex items-center space-x-2 "> */}
                    {/* Markup Group */}
                    <div className="relative">
                        <button
                            onClick={() => setToolDropdown(toolDropdown === 'markup' ? null : 'markup')}
                            className={`p-3 px-4 rounded-xl min-w-fit flex-row flex items-center gap-1 transition-all duration-300 flex-shrink-0 ${toolDropdown === 'markup' || ['squiggly', 'strikeout', 'underline', 'highlight'].includes(annotationMode) ? ' !shadow-[inset_0_0_5px_rgba(252,211,77,0.6)] text-amber-300  ' : 'hover:bg-slate-700/30 !shadow-[inset_0_0_5px_rgba(200,200,200,0.2)] text-slate-300'}`}
                            title="Text Markup"
                        >
                            <Highlighter strokeWidth={3} size={14} />
                            <DropdownIcon strokeWidth={3} size={12} className={`ml-1 ${toolDropdown === 'markup' ? "rotate-180" : ""}`} />
                        </button>
                        {toolDropdown === 'markup' && (
                            <ToolDropdown group="markup" onSelect={setAnnotationMode} onClose={() => setToolDropdown(null)} />
                        )}
                    </div>

                    {/* Ink Group */}
                    <div className="relative">
                        <button
                            onClick={() => setToolDropdown(toolDropdown === 'ink' ? null : 'ink')}
                            className={`p-3  px-4 rounded-xl min-w-fit flex-row flex items-center gap-1 transition-all duration-300 flex-shrink-0 ${toolDropdown === 'ink' || ['ink', 'inkHighlighter'].includes(annotationMode) ? ' !shadow-[inset_0_0_5px_rgba(110,231,183,0.6)] text-emerald-300  ' : 'hover:bg-slate-700/30 !shadow-[inset_0_0_5px_rgba(200,200,200,0.2)] text-slate-300'}`}
                            title="Ink Tools"
                        >
                            <Pencil strokeWidth={3} size={14} />
                            <DropdownIcon strokeWidth={3} size={12} className={`ml-1 ${toolDropdown === 'ink' ? "rotate-180" : ""}`} />
                        </button>
                        {toolDropdown === 'ink' && (
                            <ToolDropdown group="ink" onSelect={setAnnotationMode} onClose={() => setToolDropdown(null)} />
                        )}
                    </div>

                    {/* Shapes Group */}
                    <div className="relative">
                        <button
                            onClick={() => setToolDropdown(toolDropdown === 'shapes' ? null : 'shapes')}
                            className={`p-3  px-4 rounded-xl min-w-fit flex-row flex items-center gap-1 transition-all duration-300 flex-shrink-0 ${toolDropdown === 'shapes' || ['circle', 'square', 'polygon'].includes(annotationMode) ? ' !shadow-[inset_0_0_5px_rgba(147,197,253,0.6)] text-white  ' : 'hover:bg-slate-700/30 !shadow-[inset_0_0_5px_rgba(200,200,200,0.2)] text-slate-300'}`}
                            title="Shapes"
                        >
                            <ShapesIcon strokeWidth={3} size={14} />
                            <DropdownIcon strokeWidth={3} size={12} className={`ml-1 ${toolDropdown === 'shapes' ? "rotate-180" : ""}`} />
                        </button>
                        {toolDropdown === 'shapes' && (
                            <ToolDropdown group="shapes" onSelect={setAnnotationMode} onClose={() => setToolDropdown(null)} />
                        )}
                    </div>

                    {/* Lines Group */}
                    <div className="relative">
                        <button
                            onClick={() => setToolDropdown(toolDropdown === 'lines' ? null : 'lines')}
                            className={`p-3  px-4 rounded-xl min-w-fit flex-row flex items-center gap-1 transition-all duration-300 flex-shrink-0 ${toolDropdown === 'lines' || ['line', 'lineArrow', 'polyline'].includes(annotationMode) ? ' !shadow-[inset_0_0_5px_rgba(252,165,165,0.6)] text-red-300  ' : 'hover:bg-slate-700/30 !shadow-[inset_0_0_5px_rgba(200,200,200,0.2)] text-slate-300'}`}
                            title="Lines"
                        >
                            <ArrowUpRight strokeWidth={3} size={14} />
                            <DropdownIcon strokeWidth={3} size={12} className={`ml-1 ${toolDropdown === 'lines' ? "rotate-180" : ""}`} />
                        </button>
                        {toolDropdown === 'lines' && (
                            <ToolDropdown group="lines" onSelect={setAnnotationMode} onClose={() => setToolDropdown(null)} />
                        )}
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setToolDropdown(toolDropdown === 'redact' ? null : 'redact')}
                            className={`p-3 px-4 rounded-xl min-w-fit flex-row flex items-center gap-1 transition-all duration-300 flex-shrink-0 ${toolDropdown === 'redact' || ['redactText', 'redactSelection'].includes(annotationMode) ? ' !shadow-[inset_0_0_5px_rgba(200,234,128,0.6)] text-p3  ' : 'hover:bg-slate-700/30 !shadow-[inset_0_0_5px_rgba(200,200,200,0.2)] text-slate-300'}`}
                            title="Area/Text Redaction"
                        >
                            <Tickets strokeWidth={3} size={14} />
                            <DropdownIcon strokeWidth={3} size={12} className={`ml-1 ${toolDropdown === 'redact' ? "rotate-180" : ""}`} />
                        </button>
                        {toolDropdown === 'redact' && (
                            <ToolDropdown group="redact" onSelect={setAnnotationMode} onClose={() => setToolDropdown(null)} />
                        )}
                    </div>

                    <div className="w-px h-8 bg-slate-700/30 mx-2 flex-shrink-0" />

                    <button
                        onClick={() => setAnnotationMode('freeText')}
                        className={`p-3 rounded-xl transition-all duration-300 flex-shrink-0 ${annotationMode === 'freeText' ? ' text-white !shadow-[inset_0_0_5px_rgba(100,100,255,0.9)]' : '!shadow-[inset_0_0_5px_rgba(200,200,200,0.2)] text-slate-300'}`}
                        title="Inscribe"
                    >
                        <Type strokeWidth={3} size={14} />
                    </button>
                    <button
                        onClick={() => setAnnotationMode('stamp')}
                        className={`p-3 rounded-xl transition-all duration-300 flex-shrink-0 ${annotationMode === 'stamp' ? ' text-white !shadow-[inset_0_0_5px_rgba(100,100,255,0.9)]' : '!shadow-[inset_0_0_5px_rgba(200,200,200,0.2)] text-slate-300'}`}
                        title="Add Image"
                    >
                        <ImageIcon strokeWidth={3} size={14} />
                    </button>

                    <button
                        onClick={() => {
                            if (!!(annotationMode === "capture")) {
                                setAnnotationMode("select")
                            }
                            else {
                                setAnnotationMode('capture')
                            }
                        }}
                        className={`p-3 text-xs rounded-xl transition-all duration-300 flex-shrink-0 ${annotationMode === 'capture' ? ' text-white !shadow-[inset_0_0_5px_rgba(100,100,255,0.9)]' : '!shadow-[inset_0_0_5px_rgba(200,200,200,0.2)] text-slate-300'}`}
                        title="Capture Image"
                    >
                        {annotationMode === 'capture' ? 'Cancel' : <Camera strokeWidth={3} size={14} />}
                    </button>
                    {/* </div> */}

                </div>
            </div>
        </>
    );
};

export default MainToolbar