/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import React, {
	useState,
	useRef,
	useEffect,
	useCallback,
	useMemo,
} from 'react';
import { createPluginRegistration } from '@embedpdf/core';
import { EmbedPDF } from '@embedpdf/core/react';
import { usePdfiumEngine } from '@embedpdf/engines/react';

// Core plugins
import { Viewport, ViewportPluginPackage } from
	'@embedpdf/plugin-viewport/react';
import {
	Scroller,
	ScrollPluginPackage,
	useScroll,
	useScrollCapability
} from '@embedpdf/plugin-scroll/react';
import { LoaderPluginPackage } from '@embedpdf/plugin-loader/react';
import { RenderLayer, RenderPluginPackage } from
	'@embedpdf/plugin-render/react';
import { TilingLayer, TilingPluginPackage } from
	'@embedpdf/plugin-tiling/react';

// Interaction and selection
import {
	InteractionManagerPluginPackage,
	PagePointerProvider,
	GlobalPointerProvider,
} from '@embedpdf/plugin-interaction-manager/react';
import { SelectionLayer, SelectionPluginPackage } from
	'@embedpdf/plugin-selection/react';
import { PanPluginPackage, usePan } from '@embedpdf/plugin-pan/react';

// Features
import {
	ThumbnailPluginPackage,
	ThumbnailsPane,
	ThumbImg,
} from '@embedpdf/plugin-thumbnail/react';
import { ZoomPluginPackage, useZoom } from '@embedpdf/plugin-zoom/react';
import { RotatePluginPackage, useRotate, Rotate } from
	'@embedpdf/plugin-rotate/react';
import { PrintPluginPackage, usePrintCapability } from
	'@embedpdf/plugin-print/react';
import { SpreadPluginPackage } from '@embedpdf/plugin-spread/react';
import { SearchLayer, SearchPluginPackage,  useSearchCapability } from
	'@embedpdf/plugin-search/react';
import {
	AnnotationPluginPackage,
	AnnotationLayer,
	useAnnotationCapability,
} from '@embedpdf/plugin-annotation/react';
import { HistoryPluginPackage, useHistoryCapability } from
	'@embedpdf/plugin-history/react';

// Lucide icons for toolbar
import {
	ZoomIn,
	ZoomOut,
	Printer,
	Search,
	ChevronUp,
	ChevronDown,
	File,
	Menu,
	X,
	Type,
	Pencil,
	Highlighter,
	MousePointer,
	Hand,
	Grid,
	Download,
	Trash2,
	Image as ImageIcon,
	RotateCw as RotateIcon,
	Undo,
	Redo,
	Hash,
	Waves,
	Circle,
	Square,
	ArrowUpRight,
	CornerDownRight,
	Bold,
	Italic,
	AlignLeft,
	AlignCenter,
	AlignRight,
	AlignJustify,
	Underline,
	Palette,
	Palette as PaletteIcon,
	AlignVerticalJustifyCenter,
	AlignVerticalJustifyStart,
	AlignVerticalJustifyEnd,
} from 'lucide-react';

// Import models for types
import {
	PdfStandardFont,
	standardFontFamily,
	standardFontIsBold,
	standardFontIsItalic,
	makeStandardFont,
	PdfTextAlignment,
	PdfVerticalAlignment,
	PdfAnnotationSubtype,
	PdfAnnotationBorderStyle,
	PdfAnnotationLineEnding,
	PdfBlendMode,
	blendModeSelectOptions,
	STANDARD_FONT_FAMILIES,
	standardFontFamilyLabel,
	MatchFlag
} from '@embedpdf/models';

const PDFAnnotator = () => {
	const [pdfUrl, setPdfUrl] = useState(
		'https://snippet.embedpdf.com/ebook.pdf'
	);
	const [showSidebar, setShowSidebar] = useState(true);
	const [sidebarTab, setSidebarTab] = useState('thumbnails'); // 'thumbnails' or 'styles'
	const [searchQuery, setSearchQuery] = useState('');
	const [showSearch, setShowSearch] = useState(false);
	const [annotationMode, setAnnotationMode] = useState('select');
	const [urlInput, setUrlInput] = useState(pdfUrl);
	const [showUrlDialog, setShowUrlDialog] = useState(false);

	const fileInputRef = useRef(null); // upload PDF
	const annotationApiRef = useRef(null);
	const [selectedAnnotation, setSelectedAnnotation] = useState(null);

	// Memoize plugins so they don't re-register on every render
	const plugins = useMemo(
		() => [
			createPluginRegistration(LoaderPluginPackage, {
				loadingOptions: {
					type: 'url',
					pdfFile: {
						id: 'pdf-document',
						url: pdfUrl,
					},
				},
			}),
			createPluginRegistration(ViewportPluginPackage),
			createPluginRegistration(RenderPluginPackage),
			createPluginRegistration(TilingPluginPackage),
			createPluginRegistration(InteractionManagerPluginPackage),
			createPluginRegistration(SelectionPluginPackage),
			createPluginRegistration(HistoryPluginPackage),
			createPluginRegistration(PanPluginPackage),
			createPluginRegistration(ScrollPluginPackage),
			createPluginRegistration(ThumbnailPluginPackage, {
				width: 120,
				gap: 8,
			}),
			createPluginRegistration(ZoomPluginPackage, {
				initialZoom: 1.0,
				minZoom: 0.25,
				maxZoom: 5.0,
			}),
			createPluginRegistration(RotatePluginPackage),
			createPluginRegistration(PrintPluginPackage),
			createPluginRegistration(SpreadPluginPackage),
			createPluginRegistration(SearchPluginPackage),
			createPluginRegistration(AnnotationPluginPackage, {
				annotationAuthor: 'User',
			}),
		],
		[pdfUrl]
	);

	const { engine, isLoading, error } = usePdfiumEngine();

	const handleFileUpload = useCallback((event) => {
		const file = event.target.files?.[0];
		if (file && file.type === 'application/pdf') {
			const url = URL.createObjectURL(file);
			setPdfUrl(url);
		}
	}, []);

	const handleUrlLoad = useCallback(() => {
		if (urlInput.trim()) {
			setPdfUrl(urlInput);
			setShowUrlDialog(false);
		}
	}, [urlInput]);

	useEffect(() => {
		setSearchQuery('');
		setShowSearch(false);
	}, [pdfUrl]);

	if (error) {
		return (
			<div className="flex items-center justify-center h-screen bg-gray-900 text-red-300">
				<div className="text-center p-8 bg-gray-800 rounded-xl border border-red-600/30 shadow-xl">
					<p className="text-xl mb-2 font-bold text-red-300">Error loading PDF engine</p>
					<p className="text-sm text-gray-400">{error.message}</p>
					<button
						onClick={() => window.location.reload()}
						className="mt-4 px-6 py-2 bg-blue-800 hover:bg-blue-900 rounded-lg transition-all duration-200 font-medium text-blue-200"
					>
						Reload Page
					</button>
				</div>
			</div>
		);
	}

	if (isLoading || !engine) {
		return (
			<div className="flex items-center justify-center h-screen bg-gray-900">
				<div className="text-center">
					<div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
					<p className="text-gray-300 text-lg font-medium">Loading PDF Engine...</p>
					<p className="text-gray-500 text-sm mt-2">
						Please wait while we initialize the viewer
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-screen bg-gray-900 text-gray-100 font-sans">
			<style>{`
        .custom-sticky-note {
          background: #1f2937;
          border: 1px solid rgba(255,255,255,0.12);
          box-shadow: 0 8px 22px rgba(0,0,0,0.35);
          transform: rotate(-1.5deg);
          padding: 8px;
          border-radius: 6px;
          color: #f3f4f6;
          font-size: 13px;
          line-height: 1.2;
        }
        .pdf-page-container {
          -webkit-user-select: text;
          user-select: text;
        }
        .pdf-page-container * {
          -webkit-user-drag: none;
        }
        .thumbnails-pane-hidden { opacity: 0; visibility: hidden; transform: translateX(-8px); transition: opacity .18s ease, transform .18s ease, visibility .18s ease; }
        .thumbnails-pane-visible { opacity: 1; visibility: visible; transform: translateX(0); transition: opacity .18s ease, transform .18s ease, visibility .18s ease; }
      `}</style>

			<div className="flex items-center justify-between bg-gray-800 border-b border-gray-700/50 px-6 py-3 shadow">
				<div className="flex items-center space-x-4">
					<button
						onClick={() => setShowSidebar(!showSidebar)}
						className="p-2 hover:bg-gray-700/50 rounded-lg transition-all duration-200"
						title="Toggle Sidebar"
					>
						<Menu size={20} className="text-gray-300" />
					</button>
					<div className="flex items-center space-x-2">
						<File size={20} className="text-blue-400" />
						<span className="font-bold text-sm tracking-tight text-blue-200">PDF Annotator Pro</span>
						<span className="text-xs text-gray-500 ml-2">Dark Mode</span>
					</div>
				</div>

				<div className="flex items-center space-x-2">
					<button
						onClick={() => fileInputRef.current?.click()}
						className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg font-medium text-blue-100"
						title="Upload PDF"
					>
						<Download size={16} />
						<span>Upload PDF</span>
					</button>
					<input
						ref={fileInputRef}
						type="file"
						accept="application/pdf"
						onChange={handleFileUpload}
						className="hidden"
					/>
					<button
						onClick={() => setShowUrlDialog(!showUrlDialog)}
						className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg text-sm transition-all duration-200 flex items-center space-x-2"
						title="Load from URL"
					>
						<Hash size={16} />
						<span>Load URL</span>
					</button>
				</div>
			</div>

			{showUrlDialog && (
				<div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-gray-800 border border-gray-700/50 px-6 py-4 rounded-xl z-50 max-w-md w-full mx-4 shadow-2xl backdrop-blur-sm">
					<div className="flex items-center space-x-3">
						<input
							type="text"
							value={urlInput}
							onChange={(e) => setUrlInput(e.target.value)}
							placeholder="https://example.com/doc.pdf"
							className="flex-1 px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:border-blue-500/50 text-sm transition-all duration-200 text-gray-200"
							onKeyPress={(e) => e.key === 'Enter' && handleUrlLoad()}
						/>
						<button
							onClick={handleUrlLoad}
							className="px-5 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-all duration-200 font-medium shadow-md text-blue-100"
						>
							Load
						</button>
						<button
							onClick={() => setShowUrlDialog(false)}
							className="p-2 hover:bg-gray-700/50 rounded-lg transition-all duration-200"
						>
							<X size={18} className="text-gray-400" />
						</button>
					</div>
				</div>
			)}

			<EmbedPDF engine={engine} plugins={plugins}>
				<div className="flex flex-1 overflow-hidden">
					{showSidebar && (
						<div className="w-64 bg-gray-800 border-r border-gray-700/50 flex flex-col overflow-hidden shadow-lg">
							<div className="flex border-b border-gray-700/50">
								<button
									onClick={() => setSidebarTab('thumbnails')}
									className={`flex-1 px-4 py-4 text-sm font-semibold transition-all duration-200 ${sidebarTab === 'thumbnails' ? 'bg-gray-700/50 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:bg-gray-700/30'}`}
								>
									<Grid size={16} className="inline mr-2" />
									Thumbnails
								</button>
								<button
									onClick={() => setSidebarTab('styles')}
									className={`flex-1 px-4 py-4 text-sm font-semibold transition-all duration-200 ${sidebarTab === 'styles' ? 'bg-gray-700/50 text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:bg-gray-700/30'}`}
								>
									<PaletteIcon size={16} className="inline mr-2" />
									Styles
								</button>
							</div>

							<div className="flex-1 overflow-y-auto p-3">
								{sidebarTab === 'thumbnails' ? (
									<div
										className={
											true ? 'thumbnails-pane-visible' : 'thumbnails-pane-hidden'
										}
										style={{ minHeight: 40 }}
									>
										<ThumbnailsPanel />
									</div>
								) : (
									<StylesPanel
										selectedAnnotation={selectedAnnotation}
										annotationMode={annotationMode}
									/>
								)}
							</div>
						</div>
					)}

					<div className="flex-1 flex flex-col overflow-hidden">
						<div className="bg-gray-800 border-b border-gray-700/50 px-6 py-3 shadow">
							<MainToolbar
								showSearch={showSearch}
								setShowSearch={setShowSearch}
								searchQuery={searchQuery}
								setSearchQuery={setSearchQuery}
								annotationMode={annotationMode}
								setAnnotationMode={setAnnotationMode}
								annotationApiRef={annotationApiRef}
								setSelectedAnnotation={setSelectedAnnotation}
								setSidebarTab={setSidebarTab}
								setShowSidebar={setShowSidebar}
							/>
						</div>

						{showSearch && (
							<div className="px-6 py-3 border-b border-gray-700/50 bg-gray-800/50">
								<SearchRenderer />
							</div>
						)}

						<div className="flex-1 overflow-hidden bg-gray-900">
							<GlobalPointerProvider draggable={false}>
								<Viewport draggable={false}>
									<Scroller
										renderPage={({ width, height, pageIndex, scale, rotation }) => (
											<div
												className="pdf-page-container"
												style={{
													width,
													height,
													position: 'relative',
													margin: '12px',
													boxShadow: '0 4px 20px -4px rgba(0,0,0,0.8)',
													backgroundColor: '#ffffff',
													borderRadius: 12,
													overflow: 'hidden',
												}}
												onDragStart={(e) => e.preventDefault()}
											>

												<SearchLayer
													pageIndex={pageIndex}
													scale={scale}
													className="pointer-events-none"
												/>
												<Rotate pageSize={{ width, height }}>
													<PagePointerProvider
														pageIndex={pageIndex}
														pageWidth={width}
														pageHeight={height}
														scale={scale}
														rotation={rotation}
														draggable={false}
													>
														<RenderLayer
															pageIndex={pageIndex}
															scale={1}
															style={{
																width: '100%',
																height: '100%',
																userSelect: 'text',
																pointerEvents: 'auto',
																backgroundColor: '#fff',
															}}
														/>
														<TilingLayer
															pageIndex={pageIndex}
															scale={scale}
														/>
														<SelectionLayer
															pageIndex={pageIndex}
															scale={scale}
														/>
														<AnnotationLayer
															pageIndex={pageIndex}
															scale={scale}
															pageWidth={width}
															pageHeight={height}
															rotation={rotation}
															selectionOutlineColor="#3B82F6"
														/>
													</PagePointerProvider>
												</Rotate>
											</div>
										)}
									/>
								</Viewport>
							</GlobalPointerProvider>
						</div>
					</div>
				</div>
			</EmbedPDF>
		</div>
	);
};

// Thumbnails Panel Component
const ThumbnailsPanel = React.memo(() => {
	const { state, provides } = useScroll();
	return (
		<ThumbnailsPane>
			{(meta) => {
				const isActive = state.currentPage === meta.pageIndex + 1;
				return (
					<div
						key={meta.pageIndex}
						style={{
							position: 'absolute',
							top: meta.top,
							height: meta.wrapperHeight,
							cursor: 'pointer',
						}}
						className={`border rounded-xl overflow-hidden hover:border-blue-400/50 transition-all duration-200 bg-gray-800/50 shadow-md hover:shadow-lg ${isActive ? 'border-blue-400 ring-2 ring-blue-400/20' : 'border-gray-700/50'}`}
						onClick={() =>
							provides?.scrollToPage({ pageNumber: meta.pageIndex + 1 })
						}
					>
						<div
							style={{
								width: meta.width,
								height: meta.height,
							}}
							className="bg-white overflow-hidden rounded-t-xl"
						>
							<ThumbImg meta={meta} />
						</div>
						<div className="px-2 py-2 text-xs text-center text-gray-400 font-medium bg-gray-800/50">
							Page {meta.pageIndex + 1}
						</div>
					</div>
				);
			}}
		</ThumbnailsPane>
	);
});
ThumbnailsPanel.displayName = "ThumbnailsPanel";

// Styles Panel Component
const StylesPanel = ({ selectedAnnotation, annotationMode }) => {
	console.log(selectedAnnotation)
	const { provides: annotationApi } = useAnnotationCapability();
	if (!annotationApi) return <EmptyState />;

	let subtype = null;
	if (selectedAnnotation) {
		subtype = selectedAnnotation?.object?.type;
	} else if (annotationMode !== 'select') {
		// Map annotationMode to subtype
		const modeToSubtype = {
			highlight: 'HIGHLIGHT',
			underline: 'UNDERLINE',
			strikeout: 'STRIKEOUT',
			squiggly: 'SQUIGGLY',
			ink: 'INK',
			inkHighlighter: 'INK',
			circle: 'CIRCLE',
			square: 'SQUARE',
			line: 'LINE',
			lineArrow: 'LINE',
			polygon: 'POLYGON',
			polyline: 'POLYLINE',
			freeText: 'FREETEXT',
			stamp: 'STAMP',
		};
		subtype = modeToSubtype[annotationMode] || null;
	}

	if (!subtype) return <EmptyState />;

	const entry = SIDEbars[subtype];
	if (!entry) return <EmptyState />;

	const { component: Sidebar, title } = entry;

	const commonProps = {
		selected: selectedAnnotation,
		activeTool: annotationApi.getTool(annotationMode !== 'select' ? annotationMode : null),
		colorPresets: ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', 'transparent'],
	};

	const computedTitle = typeof title === 'function' ? title(commonProps) : title;

	return (
		<div className="h-full overflow-y-auto p-4 bg-gray-800 text-gray-200">
			{computedTitle && (
				<h2 className="text-md mb-4 font-medium text-blue-300">
					{computedTitle} {selectedAnnotation ? 'Styles' : 'Defaults'}
				</h2>
			)}
			<Sidebar {...commonProps} />
		</div>
	);
};

// Main Toolbar Component
const MainToolbar = ({
	showSearch,
	setShowSearch,
	annotationMode,
	setAnnotationMode,
	annotationApiRef,
	setSelectedAnnotation,
	setSidebarTab,
	setShowSidebar,
}) => {
	const { state: scrollState, provides: scrollApi } = useScroll();
	const { provides: zoomApi, state: zoomState } = useZoom();
	const { provides: rotateApi } = useRotate();
	const { provides: printApi } = usePrintCapability();
	const { provides: panApi } = usePan();
	const { provides: annotationApi } = useAnnotationCapability();
	const { provides: historyApi } = useHistoryCapability();

	const [, setSelected] = useState(null);
	const [canUndo, setCanUndo] = useState(false);
	const [canRedo, setCanRedo] = useState(false);

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
				setSelected(sel);
				setSelectedAnnotation(sel);
				// Open styles sidebar when selected
				setShowSidebar(true);
				setSidebarTab('styles');
			} else {
				setSelected(null);
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
							backgroundColor: '#1f2937',
							borderColor: 'rgba(255,255,255,0.12)',
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

	const totalPages = scrollState?.totalPages || 0;
	const currentPage = scrollState?.currentPage || 1;

	const modeMap = useMemo(() => ({
		highlight: 'highlight',
		underline: 'underline',
		strikeout: 'strikeout',
		squiggly: 'squiggly',
		ink: 'ink',
		inkHighlighter: 'inkHighlighter',
		circle: 'circle',
		square: 'square',
		line: 'polyline',
		lineArrow: 'lineArrow',
		polygon: 'polygon',
		polyline: 'polyline',
		freeText: 'freeText',
		stamp: 'stamp',
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

	const handlePageChange = (e) => {
		const page = parseInt(e.target.value, 10);
		if (page >= 1 && page <= totalPages) {
			scrollApi?.scrollToPage({ pageNumber: page });
		}
	};

	const zoom = zoomState?.currentZoomLevel ?? 1;
	const zoomLevels = [0.5, 0.75, 1, 1.25, 1.5, 2, 3];

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

	if (!totalPages) {
		return (
			<div className="flex items-center justify-center py-3 text-gray-500 text-sm w-full">
				Loading document...
			</div>
		);
	}

	return (
		<>
			<div className="flex items-center justify-between flex-wrap gap-3">
				<div className="flex items-center space-x-2">
					<div className="flex items-center space-x-1 bg-gray-700/50 rounded-lg px-3 py-1.5 shadow-inner">
						<input
							type="number"
							value={currentPage}
							min={1}
							max={totalPages}
							onChange={handlePageChange}
							className="w-14 bg-transparent text-center text-sm focus:outline-none text-blue-400 font-mono"
						/>
						<span className="text-xs text-gray-500">/ {totalPages}</span>
					</div>
					<button
						onClick={() => scrollApi?.scrollToPreviousPage()}
						disabled={currentPage <= 1}
						className="p-2 hover:bg-gray-700/50 rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed shadow-md"
						title="Previous Page"
					>
						<ChevronUp size={16} className="text-gray-300" />
					</button>
					<button
						onClick={() => scrollApi?.scrollToNextPage()}
						disabled={currentPage >= totalPages}
						className="p-2 hover:bg-gray-700/50 rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed shadow-md"
						title="Next Page"
					>
						<ChevronDown size={16} className="text-gray-300" />
					</button>
				</div>

				<div className="flex items-center space-x-1 bg-gray-700/50 rounded-xl p-1.5 shadow-inner overflow-x-auto">
					<button
						onClick={() => setAnnotationMode('select')}
						className={`p-2 rounded-lg transition-all duration-200 flex-shrink-0 ${annotationMode === 'select' ? 'bg-blue-600/20 text-blue-300 shadow-md' : 'hover:bg-gray-700/30 text-gray-300'}`}
						title="Select Tool"
					>
						<MousePointer size={16} />
					</button>
					<button
						onClick={() => setAnnotationMode('pan')}
						className={`p-2 rounded-lg transition-all duration-200 flex-shrink-0 ${annotationMode === 'pan' ? 'bg-blue-600/20 text-blue-300 shadow-md' : 'hover:bg-gray-700/30 text-gray-300'}`}
						title="Pan/Hand Tool"
					>
						<Hand size={16} />
					</button>
					<div className="w-px h-6 bg-gray-700/50 mx-1 flex-shrink-0" />

					<button
						onClick={() => setAnnotationMode('highlight')}
						className={`p-2 rounded-lg transition-all duration-200 flex-shrink-0 ${annotationMode === 'highlight' ? 'bg-yellow-600/20 text-yellow-300 shadow-md' : 'hover:bg-gray-700/30 text-gray-300'}`}
						title="Highlight Text"
					>
						<Highlighter size={16} />
					</button>
					<button
						onClick={() => setAnnotationMode('underline')}
						className={`p-2 rounded-lg transition-all duration-200 flex-shrink-0 ${annotationMode === 'underline' ? 'bg-blue-600/20 text-blue-300 shadow-md' : 'hover:bg-gray-700/30 text-gray-300'}`}
						title="Underline Text"
					>
						<Underline size={16} />
					</button>
					<button
						onClick={() => setAnnotationMode('strikeout')}
						className={`p-2 rounded-lg transition-all duration-200 flex-shrink-0 ${annotationMode === 'strikeout' ? 'bg-red-600/20 text-red-300 shadow-md' : 'hover:bg-gray-700/30 text-gray-300'}`}
						title="Strikeout Text"
					>
						<X size={16} />
					</button>
					<button
						onClick={() => setAnnotationMode('squiggly')}
						className={`p-2 rounded-lg transition-all duration-200 flex-shrink-0 ${annotationMode === 'squiggly' ? 'bg-purple-600/20 text-purple-300 shadow-md' : 'hover:bg-gray-700/30 text-gray-300'}`}
						title="Squiggly Text"
					>
						<Waves size={16} />
					</button>

					<button
						onClick={() => setAnnotationMode('ink')}
						className={`p-2 rounded-lg transition-all duration-200 flex-shrink-0 ${annotationMode === 'ink' ? 'bg-green-600/20 text-green-300 shadow-md' : 'hover:bg-gray-700/30 text-gray-300'}`}
						title="Pen/Ink"
					>
						<Pencil size={16} />
					</button>
					<button
						onClick={() => setAnnotationMode('inkHighlighter')}
						className={`p-2 rounded-lg transition-all duration-200 flex-shrink-0 ${annotationMode === 'inkHighlighter' ? 'bg-yellow-600/20 text-yellow-300 shadow-md' : 'hover:bg-gray-700/30 text-gray-300'}`}
						title="Ink Highlighter"
					>
						<Highlighter size={16} />
					</button>

					<button
						onClick={() => setAnnotationMode('circle')}
						className={`p-2 rounded-lg transition-all duration-200 flex-shrink-0 ${annotationMode === 'circle' ? 'bg-indigo-600/20 text-indigo-300 shadow-md' : 'hover:bg-gray-700/30 text-gray-300'}`}
						title="Circle"
					>
						<Circle size={16} />
					</button>
					<button
						onClick={() => setAnnotationMode('square')}
						className={`p-2 rounded-lg transition-all duration-200 flex-shrink-0 ${annotationMode === 'square' ? 'bg-indigo-600/20 text-indigo-300 shadow-md' : 'hover:bg-gray-700/30 text-gray-300'}`}
						title="Square"
					>
						<Square size={16} />
					</button>
					<button
						onClick={() => setAnnotationMode('lineArrow')}
						className={`p-2 rounded-lg transition-all duration-200 flex-shrink-0 ${annotationMode === 'lineArrow' ? 'bg-gray-600/20 text-gray-300 shadow-md' : 'hover:bg-gray-700/30 text-gray-300'}`}
						title="Arrow"
					>
						<ArrowUpRight size={16} />
					</button>
					<button
						onClick={() => setAnnotationMode('polygon')}
						className={`p-2 rounded-lg transition-all duration-200 flex-shrink-0 ${annotationMode === 'polygon' ? 'bg-gray-600/20 text-gray-300 shadow-md' : 'hover:bg-gray-700/30 text-gray-300'}`}
						title="Polygon"
					>
						<CornerDownRight size={16} />
					</button>

					<button
						onClick={() => setAnnotationMode('freeText')}
						className={`p-2 rounded-lg transition-all duration-200 flex-shrink-0 ${annotationMode === 'freeText' ? 'bg-blue-600/20 text-blue-300 shadow-md' : 'hover:bg-gray-700/30 text-gray-300'}`}
						title="Add Text/Free Text"
					>
						<Type size={16} />
					</button>
					<button
						onClick={() => setAnnotationMode('stamp')}
						className={`p-2 rounded-lg transition-all duration-200 flex-shrink-0 hover:bg-gray-700/30 text-gray-300 ${annotationMode === 'stamp' ? 'bg-blue-600/20 text-blue-300 shadow-md' : ''}`}
						title="Insert Image/Stamp (Opens File Picker)"
					>
						<ImageIcon size={16} />
					</button>

					<button
						onClick={handleDeleteSelected}
						className="p-2 rounded-lg transition-all duration-200 flex-shrink-0 hover:bg-red-600/20 text-red-300 shadow-md"
						title="Delete Selected"
					>
						<Trash2 size={16} />
					</button>

					<div className="w-px h-6 bg-gray-700/50 mx-1 flex-shrink-0" />

					<button
						onClick={handleUndo}
						disabled={!canUndo}
						className={`p-2 rounded-lg transition-all duration-200 flex-shrink-0 shadow-md ${canUndo ? 'hover:bg-gray-700/30 text-gray-300' : 'opacity-40 cursor-not-allowed text-gray-600'}`}
						title="Undo"
					>
						<Undo size={16} />
					</button>
					<button
						onClick={handleRedo}
						disabled={!canRedo}
						className={`p-2 rounded-lg transition-all duration-200 flex-shrink-0 shadow-md ${canRedo ? 'hover:bg-gray-700/30 text-gray-300' : 'opacity-40 cursor-not-allowed text-gray-600'}`}
						title="Redo"
					>
						<Redo size={16} />
					</button>
				</div>

				<div className="flex items-center space-x-2">
					<button
						onClick={() => setShowSearch(!showSearch)}
						className={`p-2 rounded-lg transition-all duration-200 ${showSearch ? 'bg-blue-600/20 text-blue-300 shadow-md' : 'hover:bg-gray-700/30 text-gray-300'}`}
						title="Search in Document"
					>
						<Search size={18} />
					</button>

					<div className="flex items-center space-x-1 bg-gray-700/50 rounded-lg shadow-inner">
						<button
							onClick={() => zoomApi?.zoomOut()}
							className="p-2 hover:bg-gray-700/30 rounded-l-lg transition-all duration-200"
							title="Zoom Out"
						>
							<ZoomOut size={16} className="text-gray-300" />
						</button>
						<select
							value={Math.round(zoom * 100)}
							onChange={(e) =>
								zoomApi?.requestZoom(parseInt(e.target.value, 10) / 100)
							}
							className="bg-transparent px-3 py-1.5 text-sm focus:outline-none cursor-pointer text-blue-400 font-mono"
							style={{ appearance: 'none', width: '60px' }}
						>
							{zoomLevels.map((level) => (
								<option key={level} value={Math.round(level * 100)}>
									{Math.round(level * 100)}%
								</option>
							))}
						</select>
						<button
							onClick={() => zoomApi?.zoomIn()}
							className="p-2 hover:bg-gray-700/30 rounded-r-lg transition-all duration-200"
							title="Zoom In"
						>
							<ZoomIn size={16} className="text-gray-300" />
						</button>
					</div>

					<button
						onClick={() => rotateApi?.rotateForward()}
						className="p-2 hover:bg-gray-700/30 rounded-lg transition-all duration-200"
						title="Rotate Clockwise"
					>
						<RotateIcon size={18} className="text-gray-300" />
					</button>
					<button
						onClick={() => printApi?.print()}
						className="p-2 hover:bg-gray-700/30 rounded-lg transition-all duration-200"
						title="Print Document"
					>
						<Printer size={18} className="text-gray-300" />
					</button>
				</div>
			</div>

			{/* Removed ContextualToolbar, moved to sidebar */}
		</>
	);
};

function HitLine({ hit, onClick, active }) {
  const { before, match, after, truncatedLeft, truncatedRight } = hit.context;
  const ref = useRef(null);

  useEffect(() => {
    if (active && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [active]);

  return (
    <button
      ref={ref}
      onClick={() => onClick(hit)}
      className={`w-full text-left rounded-lg p-3 transition-all duration-200
        relative overflow-hidden border
        bg-gradient-to-b from-black/30 to-white/2 backdrop-blur-md
        shadow-[0_6px_20px_rgba(2,6,23,0.6)]
        ${
          active
            ? 'border-blue-400/40 ring-1 ring-blue-400/30 bg-blue-900/25 text-blue-200'
            : 'border-gray-700/60 hover:border-gray-500/60 hover:bg-gray-800/40'
        }`}
      aria-current={active ? 'true' : 'false'}
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1 text-sm leading-tight text-gray-200">
          <div className="truncate">
            {truncatedLeft && <span className="text-gray-400">… </span>}
            <span className="text-gray-300">{before}</span>
            <span className="font-semibold text-blue-300 mx-1">{match}</span>
            <span className="text-gray-300">{after}</span>
            {truncatedRight && <span className="text-gray-400"> …</span>}
          </div>
        </div>
        <div className="ml-auto flex-shrink-0 text-xs text-gray-400">
          Pg {hit.pageIndex + 1}
        </div>
      </div>
    </button>
  );
}

export const Checkbox = ({ label, checked, onChange }) => {
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer select-none text-sm text-gray-300">
      <span
        className={`relative flex h-5 w-5 items-center justify-center rounded-sm
          transition-all duration-150
          ${checked ? 'bg-blue-400/90 border-none shadow-[0_4px_14px_rgba(59,130,246,0.15)]' : 'bg-gray-800 border border-gray-600/60'}`}
      >
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="absolute inset-0 m-0 h-full w-full opacity-0 cursor-pointer"
          aria-checked={checked}
        />
        <svg
          viewBox="0 0 24 24"
          className={`h-3 w-3 transition-opacity duration-150 ${checked ? 'opacity-100 text-white' : 'opacity-0'}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
      <span className="select-none">{label}</span>
    </label>
  );
};

export function Button({
  id,
  children,
  onClick,
  active = false,
  disabled = false,
  className = '',
  tooltip,
  ref,
  ...props
}) {
  return (
    <button
      id={id}
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      className={`flex h-9 min-w-[36px] items-center justify-center gap-2 rounded-md px-3 text-sm transition-all
        ${active ? 'bg-blue-900/30 text-blue-300 ring-1 ring-blue-400/30 shadow-sm' : 'bg-transparent text-gray-300 hover:bg-gray-800/40 hover:text-white'}
        ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

export const SearchRenderer = () => {
  const inputRef = useRef(null);
  const [inputValue, setInputValue] = useState('');
  const [results, setResults] = useState([]);
  const [flags, setFlags] = useState([]);
  const [activeResultIndex, setActiveResultIndex] = useState(-1);
  const { provides: search } = useSearchCapability?.() ?? {};
  const { provides: scroll } = useScrollCapability?.() ?? {};
  const debouncedValue = useDebounce(inputValue, 120);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (debouncedValue === '') {
      search?.stopSearch();
      setResults([]);
      setActiveResultIndex(-1);
    } else {
      const newResults = search?.searchAllPages(debouncedValue)?.state?.result?.results ?? [];
      setResults(newResults);
      setActiveResultIndex(newResults.length > 0 ? 0 : -1);
    }
  }, [debouncedValue, search]);

  const scrollToItem = useCallback(
    (index) => {
      const item = results[index];
      if (!item || index < 0) return;

      const minCoordinates = item.rects.reduce(
        (min, rect) => ({
          x: Math.min(min.x, rect.origin.x),
          y: Math.min(min.y, rect.origin.y),
        }),
        { x: Infinity, y: Infinity }
      );

      scroll?.scrollToPage({
        pageNumber: item.pageIndex + 1,
        pageCoordinates: minCoordinates,
        center: true,
      });
    },
    [results, scroll]
  );

  useEffect(() => {
    if (activeResultIndex >= 0) scrollToItem(activeResultIndex);
  }, [activeResultIndex, scrollToItem]);

  const handleInputChange = (e) => setInputValue(e.target.value);

  const handleFlagChange = useCallback(
    (flag, checked) => {
      setFlags((prev) => {
        let newFlags = [...prev];
        if (checked) {
          if (!newFlags.includes(flag)) newFlags.push(flag);
        } else {
          newFlags = newFlags.filter((f) => f !== flag);
        }
        search?.setFlags(newFlags);
        return newFlags;
      });
    },
    [search]
  );

  const clearInput = () => {
    setInputValue('');
    search?.stopSearch();
    setResults([]);
    setActiveResultIndex(-1);
    inputRef.current?.focus();
  };

  function groupByPage(resultsArr) {
    return resultsArr.reduce((map, r, i) => {
      (map[r.pageIndex] ??= []).push({ hit: r, index: i });
      return map;
    }, {});
  }

  const grouped = groupByPage(results);
  const totalResults = results.length;

  // keyboard navigation: up/down + Enter to open + Esc to clear
  useEffect(() => {
    const onKey = (ev) => {
      if (ev.key === 'ArrowDown') {
        ev.preventDefault();
        if (results.length === 0) return;
        setActiveResultIndex((s) => (s < results.length - 1 ? s + 1 : s));
      } else if (ev.key === 'ArrowUp') {
        ev.preventDefault();
        setActiveResultIndex((s) => (s > 0 ? s - 1 : s));
      } else if (ev.key === 'Enter') {
        if (activeResultIndex >= 0 && results[activeResultIndex]) {
          ev.preventDefault();
          search?.goToResult(activeResultIndex);
        }
      } else if (ev.key === 'Escape') {
        clearInput();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [results, activeResultIndex, search]);

  return (
    <div className="flex h-full flex-col bg-[radial-gradient(ellipse_at_top_left,_#01050a,_#030312)] text-gray-200">
      <div
        className="p-5"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.02)',
        }}
      >
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>

          <input
            ref={inputRef}
            type="text"
            placeholder="Search (press ↑/↓ to navigate, Enter to open)"
            value={inputValue}
            onInput={handleInputChange}
            className="w-full rounded-lg border border-gray-700 bg-gradient-to-b from-black/40 to-white/1 py-3 pl-12 pr-12 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-400/40 focus:border-blue-400"
            aria-label="Search"
          />

          {inputValue ? (
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-200"
              onClick={clearInput}
              aria-label="Clear search"
            >
              <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-4">
            <Checkbox
              label="Case sensitive"
              checked={flags.includes(MatchFlag.MatchCase)}
              onChange={(checked) => handleFlagChange(MatchFlag.MatchCase, checked)}
            />
            <Checkbox
              label="Whole word"
              checked={flags.includes(MatchFlag.MatchWholeWord)}
              onChange={(checked) => handleFlagChange(MatchFlag.MatchWholeWord, checked)}
            />
          </div>

          <div className="ml-auto text-sm text-gray-400">{totalResults} results</div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-5">
        <div
          className="flex flex-col gap-3 overflow-y-auto pr-2"
          style={{ maxHeight: 'calc(100% - 20px)' }}
        >
          {totalResults === 0 ? (
            <div className="mt-6 text-center text-sm text-gray-400">No results</div>
          ) : (
            Object.entries(grouped).map(([page, hits]) => (
              <div key={page} className="mt-1 first:mt-0">
                <div className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-white/2 to-black/0 px-3 py-1 text-xs text-gray-300">
                  <span className="inline-block h-2 w-2 rounded-full bg-blue-400/60 shadow-[0_4px_12px_rgba(59,130,246,0.12)]" />
                  Page {Number(page) + 1}
                </div>

                <div className="mt-2 flex flex-col gap-2">
                  {hits.map(({ hit, index }) => (
                    <HitLine
                      key={index}
                      hit={hit}
                      active={index === activeResultIndex}
                      onClick={() => {
                        setActiveResultIndex(index);
                        search?.goToResult(index);
                      }}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// useDropdown hook
const useDropdown = () => {
	const [open, setOpen] = useState(false);
	const rootRef = useRef(null);
	const selectedItemRef = useRef(null);

	useEffect(() => {
		if (!open) return;
		const onDocClick = (e) => {
			if (rootRef.current && !rootRef.current.contains(e.target)) {
				setOpen(false);
			}
		};
		document.addEventListener('click', onDocClick);
		return () => document.removeEventListener('click', onDocClick);
	}, [open]);

	useEffect(() => {
		if (open && selectedItemRef.current) {
			selectedItemRef.current.scrollIntoView({
				block: 'center',
				inline: 'start',
			});
		}
	}, [open]);

	return { open, setOpen, rootRef, selectedItemRef };
};

// Slider Component
const Slider = ({
	value,
	min = 0,
	max = 1,
	step = 0.1,
	onChange,
}) => (
	<input
		type="range"
		className="range-sm mb-2 h-1 w-full cursor-pointer appearance-none rounded-lg bg-gray-700"
		value={value}
		min={min}
		max={max}
		step={step}
		onInput={(e) => onChange(parseFloat(e.target.value))}
	/>
);

// ColorSwatch Component
const ColorSwatch = ({
	color,
	active,
	onSelect,
}) => {
	const isTransparent = (c) =>
		c === 'transparent' ||
		/^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*0\s*\)$/i.test(c) ||
		(/^#([0-9a-f]{8})$/i.test(c) && c.slice(-2).toLowerCase() === '00') ||
		(/^#([0-9a-f]{4})$/i.test(c) && c.slice(-1).toLowerCase() === '0');

	const baseStyle = isTransparent(color)
		? {
			backgroundColor: '#fff',
			backgroundImage:
				'linear-gradient(45deg, transparent 40%, red 40%, red 60%, transparent 60%)',
			backgroundSize: '100% 100%',
		}
		: { backgroundColor: color };

	return (
		<button
			title={color}
			className={`h-5 w-5 rounded-full border border-gray-600 ${active ? 'outline outline-2 outline-offset-2 outline-blue-500' : ''}`}
			style={baseStyle}
			onClick={() => onSelect(color)}
		/>
	);
};

// StrokeStyleSelect Component
const STROKES = [
	{ id: PdfAnnotationBorderStyle.SOLID },
	{ id: PdfAnnotationBorderStyle.DASHED, dash: [6, 2] },
	{ id: PdfAnnotationBorderStyle.DASHED, dash: [8, 4] },
	{ id: PdfAnnotationBorderStyle.DASHED, dash: [3, 3] },
	{ id: PdfAnnotationBorderStyle.DASHED, dash: [1, 2] },
	{ id: PdfAnnotationBorderStyle.DASHED, dash: [4, 2, 1, 2] },
	{ id: PdfAnnotationBorderStyle.DASHED, dash: [8, 4, 1, 4] },
];

const renderStrokeSvg = (dash) => (
	<svg width="80" height="8" viewBox="0 0 80 8">
		<line
			x1="0"
			y1="4"
			x2="80"
			y2="4"
			style={{
				strokeDasharray: dash?.join(' '),
				stroke: '#f3f4f6',
				strokeWidth: '2',
			}}
		/>
	</svg>
);

const StrokeStyleSelect = ({ value, onChange }) => (
	<GenericSelect
		value={value}
		onChange={onChange}
		options={STROKES}
		getOptionKey={(s) => s.id + (s.dash?.join('-') || '')}
		renderValue={(v) => renderStrokeSvg(v.dash)}
		renderOption={(s) => <div className="px-1 py-2">{renderStrokeSvg(s.dash)}</div>}
	/>
);

// LineEndingSelect Component
const ENDINGS = [
	PdfAnnotationLineEnding.None,
	PdfAnnotationLineEnding.Square,
	PdfAnnotationLineEnding.Circle,
	PdfAnnotationLineEnding.Diamond,
	PdfAnnotationLineEnding.OpenArrow,
	PdfAnnotationLineEnding.ClosedArrow,
	PdfAnnotationLineEnding.ROpenArrow,
	PdfAnnotationLineEnding.RClosedArrow,
	PdfAnnotationLineEnding.Butt,
	PdfAnnotationLineEnding.Slash,
];

const LineEndingIcon = ({ ending, position }) => {
	const MARKERS = {
		[PdfAnnotationLineEnding.Square]: <path d="M68 -4 L76 -4 L76 4 L68 4 Z" />,
		[PdfAnnotationLineEnding.Circle]: <circle cx="72" cy="0" r="4" />,
		[PdfAnnotationLineEnding.Diamond]: <path d="M72 -5 L77 0 L72 5 L67 0 Z" />,
		[PdfAnnotationLineEnding.OpenArrow]: <path d="M67 -5 L77 0 L67 5" fill="none" />,
		[PdfAnnotationLineEnding.ClosedArrow]: <path d="M67 -5 L77 0 L67 5 Z" />,
		[PdfAnnotationLineEnding.ROpenArrow]: <path d="M77 -5 L67 0 L77 5" fill="none" />,
		[PdfAnnotationLineEnding.RClosedArrow]: <path d="M77 -5 L67 0 L77 5 Z" />,
		[PdfAnnotationLineEnding.Butt]: <path d="M72 -5 L72 5" fill="none" />,
		[PdfAnnotationLineEnding.Slash]: <path d="M67 -5 L77 5" fill="none" />,
	};
	const LINE_ENDPOINT_ADJUSTMENTS = {
		[PdfAnnotationLineEnding.Square]: 68,
		[PdfAnnotationLineEnding.Circle]: 68,
		[PdfAnnotationLineEnding.Diamond]: 67,
		[PdfAnnotationLineEnding.OpenArrow]: 76,
		[PdfAnnotationLineEnding.ClosedArrow]: 67,
		[PdfAnnotationLineEnding.ROpenArrow]: 67,
		[PdfAnnotationLineEnding.RClosedArrow]: 67,
		[PdfAnnotationLineEnding.Butt]: 72,
		[PdfAnnotationLineEnding.Slash]: 72,
	};
	const marker = MARKERS[ending];
	const lineEndX = LINE_ENDPOINT_ADJUSTMENTS[ending] ?? 77;
	const groupTransform = position === 'start' ? 'rotate(180 40 10)' : '';

	return (
		<svg width="80" height="20" viewBox="0 0 80 20" className="text-gray-200">
			<g transform={groupTransform}>
				<line x1="4" y1="10" x2={lineEndX} y2="10" stroke="currentColor" strokeWidth="1.5" />
				{marker && (
					<g
						transform="translate(0, 10)"
						fill="currentColor"
						stroke="currentColor"
						strokeWidth="1.5"
					>
						{marker}
					</g>
				)}
			</g>
		</svg>
	);
};

const LineEndingSelect = ({ value, onChange, position }) => (
	<GenericSelect
		value={value}
		onChange={onChange}
		options={ENDINGS}
		getOptionKey={(e) => e}
		triggerClass="px-3 py-1"
		renderValue={(v) => <LineEndingIcon ending={v} position={position} />}
		renderOption={(e) => (
			<div className="px-1 py-1">
				<LineEndingIcon ending={e} position={position} />
			</div>
		)}
	/>
);

// FontFamilySelect Component
const FontFamilySelect = ({ value, onChange }) => (
	<GenericSelect
		value={value}
		onChange={onChange}
		options={STANDARD_FONT_FAMILIES}
		getOptionKey={(f) => f}
		triggerClass="px-2 py-1 text-sm"
		renderValue={(v) => <span>{standardFontFamilyLabel(v)}</span>}
		renderOption={(f) => <div className="px-2 py-1">{standardFontFamilyLabel(f)}</div>}
	/>
);

// FontSizeInputSelect Component
const FontSizeInputSelect = ({ value, onChange, options = [8, 9, 10, 11, 12, 14, 16, 18, 24, 36, 48, 72] }) => {
	const { open, setOpen, rootRef, selectedItemRef } = useDropdown();

	const handleInput = (e) => {
		const n = parseInt(e.target.value, 10);
		if (Number.isFinite(n) && n > 0) onChange(n);
	};

	return (
		<div ref={rootRef} className="relative w-full">
			<input
				type="number"
				min="1"
				className="w-full rounded border border-gray-600 bg-gray-700 px-2 py-1 pr-7 text-sm text-gray-200"
				value={value}
				onInput={handleInput}
				onClick={() => setOpen(true)}
			/>
			<button
				type="button"
				className="absolute inset-y-0 right-1 flex items-center"
				onClick={() => setOpen(!open)}
				tabIndex={-1}
			>
				<svg className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
					<path
						fillRule="evenodd"
						d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
						clipRule="evenodd"
					/>
				</svg>
			</button>

			{open && (
				<div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded border bg-gray-700 shadow-lg border-gray-600">
					{options.map((sz) => {
						const isSelected = sz === value;
						return (
							<button
								ref={isSelected ? selectedItemRef : null}
								key={sz}
								className={`block w-full px-2 py-1 text-left text-sm hover:bg-gray-600 text-gray-200 ${isSelected ? 'bg-gray-600' : ''}`}
								onClick={() => {
									onChange(sz);
									setOpen(false);
								}}
							>
								{sz}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
};

// GenericSelect Component
const GenericSelect = ({
	value,
	onChange,
	options,
	getOptionKey,
	renderValue,
	renderOption,
	triggerClass = 'px-3 py-2',
}) => {
	const { open, setOpen, rootRef, selectedItemRef } = useDropdown();

	return (
		<div ref={rootRef} className="relative inline-block w-full">
			<button
				type="button"
				className={`flex w-full items-center justify-between gap-2 rounded border border-gray-600 bg-gray-700 ${triggerClass} text-gray-200`}
				onClick={() => setOpen(!open)}
			>
				{renderValue(value)}
				<svg
					className="h-4 w-4 text-gray-400"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fillRule="evenodd"
						d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
						clipRule="evenodd"
					/>
				</svg>
			</button>

			{open && (
				<div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded border bg-gray-700 p-1 shadow-lg border-gray-600">
					{options.map((option) => {
						const isSelected = getOptionKey(option) === getOptionKey(value);
						return (
							<button
								ref={isSelected ? selectedItemRef : null}
								key={getOptionKey(option)}
								className={`block w-full rounded text-left hover:bg-gray-600 text-gray-200 ${isSelected ? 'bg-gray-600' : ''}`}
								onClick={() => {
									onChange(option);
									setOpen(false);
								}}
							>
								{renderOption(option, isSelected)}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
};

// EmptyState Component
const EmptyState = () => (
	<div className="flex flex-col items-center gap-2 p-4 text-gray-500">
		<Palette size={48} className="text-gray-500" />
		<div className="max-w-[150px] text-center text-sm text-gray-500">
			Select an annotation or tool to see styles
		</div>
	</div>
);

// FreeTextSidebar Component (converted to React)
const FreeTextSidebar = ({
	selected,
	activeTool,
	colorPresets,
}) => {
	const { provides: annotation } = useAnnotationCapability();
	if (!annotation) return null;

	const anno = selected?.object;
	const defaults = activeTool?.defaults;
	const editing = !!anno;

	const baseFont = editing
		? anno.fontFamily
		: (defaults?.fontFamily ?? PdfStandardFont.Helvetica);
	const baseFamily = standardFontFamily(baseFont);
	const baseBold = standardFontIsBold(baseFont);
	const baseItalic = standardFontIsItalic(baseFont);

	const baseFontColor = editing ? anno.fontColor : (defaults?.fontColor ?? '#ffffff');
	const baseOpacity = editing ? anno.opacity : (defaults?.opacity ?? 1);
	const baseBackgroundColor = editing
		? anno.backgroundColor
		: (defaults?.backgroundColor ?? '#000000');
	const baseFontSize = editing ? anno.fontSize : (defaults?.fontSize ?? 12);
	const baseTextAlign = editing ? anno.textAlign : (defaults?.textAlign ?? PdfTextAlignment.Left);
	const baseVerticalAlign = editing
		? anno.verticalAlign
		: (defaults?.verticalAlign ?? PdfVerticalAlignment.Top);

	const [fontFamily, setFontFamily] = useState(baseFamily);
	const [fontSize, setFontSize] = useState(baseFontSize);
	const [bold, setBold] = useState(baseBold);
	const [italic, setItalic] = useState(baseItalic);
	const [textAlign, setTextAlign] = useState(baseTextAlign);
	const [verticalAlign, setVerticalAlign] = useState(baseVerticalAlign);

	const [fontColor, setFontColor] = useState(baseFontColor);
	const [opacity, setOpacity] = useState(baseOpacity);
	const [backgroundColor, setBackgroundColor] = useState(baseBackgroundColor);

	useEffect(() => {
		setFontFamily(baseFamily);
		setBold(baseBold);
		setItalic(baseItalic);
	}, [baseFamily, baseBold, baseItalic]);

	useEffect(() => setFontColor(baseFontColor), [baseFontColor]);
	useEffect(() => setOpacity(baseOpacity), [baseOpacity]);
	useEffect(() => setBackgroundColor(baseBackgroundColor), [baseBackgroundColor]);
	useEffect(() => setFontSize(baseFontSize), [baseFontSize]);
	useEffect(() => setTextAlign(baseTextAlign), [baseTextAlign]);
	useEffect(() => setVerticalAlign(baseVerticalAlign), [baseVerticalAlign]);

	const applyPatch = useCallback((patch) => {
		if (!annotation) return;
		if (editing) {
			annotation.updateAnnotation(anno.pageIndex, anno.id, patch);
		} else if (activeTool) {
			annotation.setToolDefaults(activeTool.id, patch);
		}
	}, [activeTool, anno.id, anno.pageIndex, annotation, editing])

	const debOpacity = useDebounce(opacity, 300);
	const debBackgroundColor = useDebounce(backgroundColor, 300);
	useEffect(() => applyPatch({ opacity: debOpacity }), [applyPatch, debOpacity]);
	useEffect(() => applyPatch({ backgroundColor: debBackgroundColor }), [applyPatch, debBackgroundColor]);

	const changeFontColor = (c) => {
		setFontColor(c);
		applyPatch({ fontColor: c });
	};

	const changeBackgroundColor = (c) => {
		setBackgroundColor(c);
		applyPatch({ backgroundColor: c });
	};

	const changeFontSize = (size) => {
		if (!Number.isFinite(size) || size <= 0) return;
		setFontSize(size);
		applyPatch({ fontSize: size });
	};

	const updateFontEnum = (fam, b, i) => {
		const id = makeStandardFont(fam, { bold: b, italic: i });
		applyPatch({ fontFamily: id, fontWeight: 900 });
	};

	const onFamilyChange = (fam) => {
		const supportsBold = standardFontIsBold(makeStandardFont(fam, { bold: true, italic: false }));
		const supportsItalic = standardFontIsItalic(
			makeStandardFont(fam, { bold: false, italic: true }),
		);
		const newBold = supportsBold ? bold : false;
		const newItalic = supportsItalic ? italic : false;

		setFontFamily(fam);
		setBold(newBold);
		setItalic(newItalic);
		updateFontEnum(fam, newBold, newItalic);
	};

	const toggleBold = () => {
		const supports = standardFontIsBold(
			makeStandardFont(fontFamily, { bold: true, italic: false }),
		);
		if (!supports) return;
		const newBold = !bold;
		setBold(newBold);
		updateFontEnum(fontFamily, newBold, italic);
	};

	const toggleItalic = () => {
		const supports = standardFontIsItalic(
			makeStandardFont(fontFamily, { bold: false, italic: true }),
		);
		if (!supports) return;
		const newItalic = !italic;
		setItalic(newItalic);
		updateFontEnum(fontFamily, bold, newItalic);
	};

	const changeTextAlign = (align) => {
		setTextAlign(align);
		applyPatch({ textAlign: align });
	};

	const changeVerticalAlign = (align) => {
		setVerticalAlign(align);
		applyPatch({ verticalAlign: align });
	};

	return (
		<>
			{/* font family + style */}
			<section className="mb-6">
				<label className="mb-2 block text-sm font-medium text-gray-200">Font</label>

				{/* Family + size */}
				<div className="mb-3 flex gap-2">
					<FontFamilySelect value={fontFamily} onChange={onFamilyChange} />
					<div className="w-36">
						<FontSizeInputSelect value={fontSize} onChange={changeFontSize} />
					</div>
				</div>

				{/* Bold / Italic toggles */}
				<div className="flex gap-2">
					<button
						type="button"
						title="Bold"
						disabled={
							!standardFontIsBold(makeStandardFont(fontFamily, { bold: true, italic: false }))
						}
						onClick={toggleBold}
						className={`h-9 w-9 rounded border border-gray-600 px-2 py-1 text-sm font-bold ${bold ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'} disabled:opacity-40`}
					>
						<Bold size={18} />
					</button>

					<button
						type="button"
						title="Italic"
						disabled={
							!standardFontIsItalic(makeStandardFont(fontFamily, { bold: false, italic: true }))
						}
						onClick={toggleItalic}
						className={`h-9 w-9 rounded border border-gray-600 px-2 py-1 text-sm italic ${italic ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'} disabled:opacity-40`}
					>
						<Italic size={18} />
					</button>
				</div>
			</section>

			{/* text alignment */}
			<section className="mb-6">
				<label className="mb-2 block text-sm font-medium text-gray-200">Text alignment</label>
				<div className="flex gap-2">
					<button
						type="button"
						title="Align left"
						onClick={() => changeTextAlign(PdfTextAlignment.Left)}
						className={`h-9 w-9 rounded border border-gray-600 px-2 py-1 text-sm ${textAlign === PdfTextAlignment.Left ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'} disabled:opacity-40`}
					>
						<AlignLeft size={18} />
					</button>
					<button
						type="button"
						title="Align center"
						onClick={() => changeTextAlign(PdfTextAlignment.Center)}
						className={`h-9 w-9 rounded border border-gray-600 px-2 py-1 text-sm ${textAlign === PdfTextAlignment.Center ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'} disabled:opacity-40`}
					>
						<AlignCenter size={18} />
					</button>
					<button
						type="button"
						title="Align right"
						onClick={() => changeTextAlign(PdfTextAlignment.Right)}
						className={`h-9 w-9 rounded border border-gray-600 px-2 py-1 text-sm ${textAlign === PdfTextAlignment.Right ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'} disabled:opacity-40`}
					>
						<AlignRight size={18} />
					</button>
					<button
						type="button"
						title="Justify"
						onClick={() => changeTextAlign(PdfTextAlignment.Justify)}
						className={`h-9 w-9 rounded border border-gray-600 px-2 py-1 text-sm ${textAlign === PdfTextAlignment.Justify ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'} disabled:opacity-40`}
					>
						<AlignJustify size={18} />
					</button>
				</div>
			</section>

			{/* vertical alignment */}
			<section className="mb-6">
				<label className="mb-2 block text-sm font-medium text-gray-200">Vertical alignment</label>
				<div className="flex gap-2">
					<button
						type="button"
						title="Align top"
						onClick={() => changeVerticalAlign(PdfVerticalAlignment.Top)}
						className={`h-9 w-9 rounded border border-gray-600 px-2 py-1 text-sm ${verticalAlign === PdfVerticalAlignment.Top ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'} disabled:opacity-40`}
					>
						<AlignVerticalJustifyStart size={18} />
					</button>
					<button
						type="button"
						title="Align middle"
						onClick={() => changeVerticalAlign(PdfVerticalAlignment.Middle)}
						className={`h-9 w-9 rounded border border-gray-600 px-2 py-1 text-sm ${verticalAlign === PdfVerticalAlignment.Middle ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'} disabled:opacity-40`}
					>
						<AlignVerticalJustifyCenter size={18} />
					</button>
					<button
						type="button"
						title="Align bottom"
						onClick={() => changeVerticalAlign(PdfVerticalAlignment.Bottom)}
						className={`h-9 w-9 rounded border border-gray-600 px-2 py-1 text-sm ${verticalAlign === PdfVerticalAlignment.Bottom ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'} disabled:opacity-40`}
					>
						<AlignVerticalJustifyEnd size={18} />
					</button>
				</div>
			</section>

			{/* font colour */}
			<section className="mb-6">
				<label className="mb-3 block text-sm font-medium text-gray-200">Font colour</label>
				<div className="grid grid-cols-6 gap-x-1 gap-y-4">
					{colorPresets.map((c) => (
						<ColorSwatch key={c} color={c} active={c === fontColor} onSelect={changeFontColor} />
					))}
				</div>
			</section>

			{/* background colour */}
			<section className="mb-6">
				<label className="mb-3 block text-sm font-medium text-gray-200">Background colour</label>
				<div className="grid grid-cols-6 gap-x-1 gap-y-4">
					{colorPresets.map((c) => (
						<ColorSwatch
							key={c}
							color={c}
							active={c === backgroundColor}
							onSelect={changeBackgroundColor}
						/>
					))}
					<ColorSwatch
						color="transparent"
						active={backgroundColor === 'transparent'}
						onSelect={changeBackgroundColor}
					/>
				</div>
			</section>

			{/* opacity */}
			<section className="mb-6">
				<label className="mb-1 block text-sm font-medium text-gray-200">Opacity</label>
				<Slider value={opacity} min={0.1} max={1} step={0.05} onChange={setOpacity} />
				<span className="text-xs text-gray-500">{Math.round(opacity * 100)}%</span>
			</section>
		</>
	);
};

// LineSidebar Component (converted to React)
const LineSidebar = ({
	selected,
	activeTool,
	colorPresets,
}) => {
	const { provides: annotation } = useAnnotationCapability();
	if (!annotation) return null;

	const anno = selected?.object;
	const defaults = activeTool?.defaults;
	const editing = !!anno;

	const baseFill = editing ? anno.color : (defaults?.color ?? '#000000');
	const baseStroke = editing ? anno.strokeColor : (defaults?.strokeColor ?? '#ffffff');
	const baseOpac = editing ? anno.opacity : (defaults?.opacity ?? 1);
	const baseWidth = editing ? anno.strokeWidth : (defaults?.strokeWidth ?? 2);
	const baseLineEndings = editing
		? (anno.lineEndings ?? {
			start: PdfAnnotationLineEnding.None,
			end: PdfAnnotationLineEnding.None,
		})
		: (defaults?.lineEndings ?? {
			start: PdfAnnotationLineEnding.None,
			end: PdfAnnotationLineEnding.None,
		});
	const baseStyle = useMemo(() => (editing
		? { id: anno.strokeStyle, dash: anno.strokeDashArray }
		: {
			id: defaults?.strokeStyle ?? PdfAnnotationBorderStyle.SOLID,
			dash: defaults?.strokeDashArray,
		}), [anno.strokeDashArray, anno.strokeStyle, defaults?.strokeDashArray, defaults?.strokeStyle, editing]);

	const [fill, setFill] = useState(baseFill);
	const [stroke, setStroke] = useState(baseStroke);
	const [opacity, setOpac] = useState(baseOpac);
	const [strokeW, setWidth] = useState(baseWidth);
	const [style, setStyle] = useState(baseStyle);
	const [startEnding, setStartEnding] = useState(baseLineEndings.start);
	const [endEnding, setEndEnding] = useState(baseLineEndings.end);

	useEffect(() => setFill(baseFill), [baseFill]);
	useEffect(() => setStroke(baseStroke), [baseStroke]);
	useEffect(() => setOpac(baseOpac), [baseOpac]);
	useEffect(() => setWidth(baseWidth), [baseWidth]);
	useEffect(() => setStyle(baseStyle), [baseStyle]);
	useEffect(() => setStartEnding(baseLineEndings.start), [baseLineEndings.start]);
	useEffect(() => setEndEnding(baseLineEndings.end), [baseLineEndings.end]);

	const applyPatch = useCallback((patch) => {
		if (!annotation) return;
		if (editing) {
			annotation.updateAnnotation(anno.pageIndex, anno.id, patch);
		} else if (activeTool) {
			annotation.setToolDefaults(activeTool.id, patch);
		}
	}, [activeTool, anno.id, anno.pageIndex, annotation, editing])

	const debOpacity = useDebounce(opacity, 300);
	const debWidth = useDebounce(strokeW, 300);
	useEffect(() => applyPatch({ opacity: debOpacity }), [applyPatch, debOpacity]);
	useEffect(() => applyPatch({ strokeWidth: debWidth }), [applyPatch, debWidth]);

	const changeFill = (c) => {
		setFill(c);
		applyPatch({ color: c });
	};

	const changeStroke = (c) => {
		setStroke(c);
		applyPatch({ strokeColor: c });
	};

	const changeStyle = (s) => {
		setStyle(s);
		applyPatch({ strokeStyle: s.id, strokeDashArray: s.dash });
	};

	const changeStartEnding = (e) => {
		setStartEnding(e);
		applyPatch({ lineEndings: { start: e, end: endEnding } });
	};
	const changeEndEnding = (e) => {
		setEndEnding(e);
		applyPatch({ lineEndings: { start: startEnding, end: e } });
	};


	return (
		<>
			{/* stroke color */}
			<section className="mb-6">
				<label className="mb-3 block text-sm font-medium text-gray-200">Stroke color</label>
				<div className="grid grid-cols-6 gap-x-1 gap-y-4">
					{colorPresets.map((c) => (
						<ColorSwatch key={c} color={c} active={c === stroke} onSelect={changeStroke} />
					))}
					<ColorSwatch
						color="transparent"
						active={stroke === 'transparent'}
						onSelect={changeStroke}
					/>
				</div>
			</section>

			{/* opacity */}
			<section className="mb-6">
				<label className="mb-1 block text-sm font-medium text-gray-200">Opacity</label>
				<Slider value={opacity} min={0.1} max={1} step={0.05} onChange={setOpac} />
				<span className="text-xs text-gray-500">{Math.round(opacity * 100)}%</span>
			</section>

			{/* stroke style */}
			<section className="mb-6">
				<label className="mb-3 block text-sm font-medium text-gray-200">Stroke style</label>
				<StrokeStyleSelect value={style} onChange={changeStyle} />
			</section>

			{/* stroke width */}
			<section className="mb-6">
				<label className="mb-1 block text-sm font-medium text-gray-200">Stroke width</label>
				<Slider value={strokeW} min={1} max={10} step={1} onChange={setWidth} />
				<span className="text-xs text-gray-500">{strokeW}</span>
			</section>

			{/* line endings in a grid */}
			<section className="mb-6">
				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="mb-3 block text-sm font-medium text-gray-200">
							Line start
						</label>
						<LineEndingSelect value={startEnding} onChange={changeStartEnding} position="start" />
					</div>
					<div>
						<label className="mb-3 block text-sm font-medium text-gray-200">
							Line end
						</label>
						<LineEndingSelect value={endEnding} onChange={changeEndEnding} position="end" />
					</div>
				</div>
			</section>

			{/* fill color */}
			<section className="mb-6">
				<label className="mb-3 block text-sm font-medium text-gray-200">Fill color</label>
				<div className="grid grid-cols-6 gap-x-1 gap-y-4">
					{colorPresets.map((c) => (
						<ColorSwatch key={c} color={c} active={c === fill} onSelect={changeFill} />
					))}
					<ColorSwatch color="transparent" active={fill === 'transparent'} onSelect={changeFill} />
				</div>
			</section>
		</>
	);
};

// InkSidebar Component (converted to React)
const InkSidebar = ({
	selected,
	activeTool,
	colorPresets,
}) => {
	const { provides: annotation } = useAnnotationCapability();
	if (!annotation) return null;

	const anno = selected?.object;
	const defaults = activeTool?.defaults;

	const baseColor = anno?.color ?? defaults?.color ?? '#ffffff';
	const baseOpacity = anno?.opacity ?? defaults?.opacity ?? 1;
	const baseStroke = anno?.strokeWidth ?? defaults?.strokeWidth ?? 2;

	const [color, setColor] = useState(baseColor);
	const [opacity, setOpacity] = useState(baseOpacity);
	const [stroke, setStroke] = useState(baseStroke);

	useEffect(() => setColor(baseColor), [baseColor]);
	useEffect(() => setOpacity(baseOpacity), [baseOpacity]);
	useEffect(() => setStroke(baseStroke), [baseStroke]);
	const applyPatch = useCallback((patch) => {
		if (!annotation) return;
		if (anno) {
			annotation.updateAnnotation(anno.pageIndex, anno.id, patch);
		} else if (activeTool) {
			annotation.setToolDefaults(activeTool.id, patch);
		}
	}, [activeTool, anno, annotation])

	const debOpacity = useDebounce(opacity, 300);
	const debStroke = useDebounce(stroke, 300);
	useEffect(() => applyPatch({ opacity: debOpacity }), [applyPatch, debOpacity]);
	useEffect(() => applyPatch({ strokeWidth: debStroke }), [applyPatch, debStroke]);

	const changeColor = (c) => {
		setColor(c);
		applyPatch({ color: c });
	};


	return (
		<>
			{/* color */}
			<section className="mb-6">
				<label className="mb-3 block text-sm font-medium text-gray-200">Color</label>
				<div className="grid grid-cols-6 gap-x-1 gap-y-4">
					{colorPresets.map((c) => (
						<ColorSwatch key={c} color={c} active={c === color} onSelect={changeColor} />
					))}
				</div>
			</section>

			{/* opacity */}
			<section className="mb-6">
				<label className="mb-1 block text-sm font-medium text-gray-200">Opacity</label>
				<Slider value={opacity} min={0.1} max={1} step={0.05} onChange={setOpacity} />
				<span className="text-xs text-gray-500">{Math.round(opacity * 100)}%</span>
			</section>

			{/* stroke-width */}
			<section className="mb-6">
				<label className="mb-1 block text-sm font-medium text-gray-200">Stroke width</label>
				<Slider value={stroke} min={1} max={30} step={1} onChange={setStroke} />
				<span className="text-xs text-gray-500">{stroke}px</span>
			</section>
		</>
	);
};

// TextMarkupSidebar Component (converted to React)
const TextMarkupSidebar = ({
	selected,
	activeTool,
	colorPresets,
}) => {
	const { provides: annotation } = useAnnotationCapability();
	if (!annotation) return null;

	const anno = selected?.object;
	const defaults = activeTool?.defaults;
	const editing = !!anno;

	const baseColor = editing ? anno.color : (defaults?.color ?? '#FFFF00');
	const baseOpacity = editing ? anno.opacity : (defaults?.opacity ?? 1);
	const baseBlend = editing
		? (anno.blendMode ?? PdfBlendMode.Normal)
		: (defaults?.blendMode ?? PdfBlendMode.Normal);

	const [color, setColor] = useState(baseColor);
	const [opacity, setOpacity] = useState(baseOpacity);
	const [blend, setBlend] = useState(baseBlend);

	useEffect(() => setColor(baseColor), [baseColor]);
	useEffect(() => setOpacity(baseOpacity), [baseOpacity]);
	useEffect(() => setBlend(baseBlend), [baseBlend]);

	const applyPatch = useCallback((patch) => {
		if (!annotation) return;
		if (editing) {
			annotation.updateAnnotation(anno.pageIndex, anno.id, patch);
		} else if (activeTool) {
			annotation.setToolDefaults(activeTool.id, patch);
		}
	}, [activeTool, anno.id, anno.pageIndex, annotation, editing])

	const debOpacity = useDebounce(opacity, 300);
	useEffect(() => applyPatch({ opacity: debOpacity }), [applyPatch, debOpacity]);

	const changeColor = (c) => {
		setColor(c);
		applyPatch({ color: c });
	};

	const changeBlend = (val) => {
		const bm = val;
		setBlend(bm);
		applyPatch({ blendMode: bm });
	};


	return (
		<>
			{/* color */}
			<section className="mb-6">
				<label className="mb-3 block text-sm font-medium text-gray-200">Color</label>
				<div className="grid grid-cols-6 gap-x-1 gap-y-4">
					{colorPresets.map((c) => (
						<ColorSwatch key={c} color={c} active={c === color} onSelect={changeColor} />
					))}
				</div>
			</section>

			{/* opacity */}
			<section className="mb-6">
				<label className="mb-1 block text-sm font-medium text-gray-200">Opacity</label>
				<Slider value={opacity} min={0.1} max={1} step={0.05} onChange={setOpacity} />
				<span className="text-xs text-gray-500">{Math.round(opacity * 100)}%</span>
			</section>

			{/* blend mode */}
			<section className="mb-6">
				<label className="mb-1 block text-sm font-medium text-gray-200">Blend mode</label>
				<select
					className="w-full rounded border border-gray-600 bg-gray-700 px-2 py-1 text-sm text-gray-200"
					value={blend}
					onChange={(e) => changeBlend(parseInt(e.target.value, 10))}
				>
					{blendModeSelectOptions.map((o) => (
						<option key={o.value} value={o.value}>
							{o.label}
						</option>
					))}
				</select>
			</section>
		</>
	);
};

// ShapeSidebar Component (converted to React)
const ShapeSidebar = ({
	selected,
	activeTool,
	colorPresets,
}) => {
	const { provides: annotation } = useAnnotationCapability();
	if (!annotation) return null;

	const anno = selected?.object;
	const defaults = activeTool?.defaults;
	const editing = !!anno;

	const baseFill = editing ? anno.color : (defaults?.color ?? '#000000');
	const baseStroke = editing ? anno.strokeColor : (defaults?.strokeColor ?? '#ffffff');
	const baseOpac = editing ? anno.opacity : (defaults?.opacity ?? 1);
	const baseWidth = editing ? anno.strokeWidth : (defaults?.strokeWidth ?? 2);
	const baseStyle = useMemo(() => (editing
		? { id: anno.strokeStyle, dash: anno.strokeDashArray }
		: {
			id: defaults?.strokeStyle ?? PdfAnnotationBorderStyle.SOLID,
			dash: defaults?.strokeDashArray,
		}), [anno.strokeDashArray, anno.strokeStyle, defaults?.strokeDashArray, defaults?.strokeStyle, editing]);

	const [fill, setFill] = useState(baseFill);
	const [stroke, setStroke] = useState(baseStroke);
	const [opacity, setOpac] = useState(baseOpac);
	const [strokeW, setWidth] = useState(baseWidth);
	const [style, setStyle] = useState(baseStyle);

	useEffect(() => setFill(baseFill), [baseFill]);
	useEffect(() => setStroke(baseStroke), [baseStroke]);
	useEffect(() => setOpac(baseOpac), [baseOpac]);
	useEffect(() => setWidth(baseWidth), [baseWidth]);
	useEffect(() => setStyle(baseStyle), [baseStyle]);

	const applyPatch = useCallback((patch) => {
		if (!annotation) return;
		if (editing) {
			annotation.updateAnnotation(anno.pageIndex, anno.id, patch);
		} else if (activeTool) {
			annotation.setToolDefaults(activeTool.id, patch);
		}
	}, [activeTool, anno.id, anno.pageIndex, annotation, editing])

	const debOpacity = useDebounce(opacity, 300);
	const debWidth = useDebounce(strokeW, 300);
	useEffect(() => applyPatch({ opacity: debOpacity }), [applyPatch, debOpacity]);
	useEffect(() => applyPatch({ strokeWidth: debWidth }), [applyPatch, debWidth]);

	const changeFill = (c) => {
		setFill(c);
		applyPatch({ color: c });
	};
	const changeStroke = (c) => {
		setStroke(c);
		applyPatch({ strokeColor: c });
	};
	const changeStyle = (s) => {
		setStyle(s);
		applyPatch({ strokeStyle: s.id, strokeDashArray: s.dash });
	};


	return (
		<>
			{/* fill color */}
			<section className="mb-6">
				<label className="mb-3 block text-sm font-medium text-gray-200">Fill color</label>
				<div className="grid grid-cols-6 gap-x-1 gap-y-4">
					{colorPresets.map((c) => (
						<ColorSwatch key={c} color={c} active={c === fill} onSelect={changeFill} />
					))}
					<ColorSwatch color="transparent" active={fill === 'transparent'} onSelect={changeFill} />
				</div>
			</section>

			{/* opacity */}
			<section className="mb-6">
				<label className="mb-1 block text-sm font-medium text-gray-200">Opacity</label>
				<Slider value={opacity} min={0.1} max={1} step={0.05} onChange={setOpac} />
				<span className="text-xs text-gray-500">{Math.round(opacity * 100)}%</span>
			</section>

			{/* stroke color */}
			<section className="mb-6">
				<label className="mb-3 block text-sm font-medium text-gray-200">Stroke color</label>
				<div className="grid grid-cols-6 gap-x-1 gap-y-4">
					{colorPresets.map((c) => (
						<ColorSwatch key={c} color={c} active={c === stroke} onSelect={changeStroke} />
					))}
				</div>
			</section>

			{/* stroke style */}
			<section className="mb-6">
				<label className="mb-3 block text-sm font-medium text-gray-200">Stroke style</label>
				<StrokeStyleSelect value={style} onChange={changeStyle} />
			</section>

			{/* stroke-width */}
			<section className="mb-6">
				<label className="mb-1 block text-sm font-medium text-gray-200">Stroke width</label>
				<Slider value={strokeW} min={1} max={30} step={1} onChange={setWidth} />
				<span className="text-xs text-gray-500">{strokeW}px</span>
			</section>
		</>
	);
};

// PolygonSidebar can use ShapeSidebar since similar
const PolygonSidebar = ShapeSidebar;

// StampSidebar Component (converted to React)
const StampSidebar = () => {
	return <div className="text-sm text-gray-500">There are no styles for stamps.</div>;
};

// Sidebar Registry
const SIDEbars = {
	[PdfAnnotationSubtype.FREETEXT]: { component: FreeTextSidebar, title: 'Free Text' },
	[PdfAnnotationSubtype.LINE]: {
		component: LineSidebar,
		title: (p) => (p.activeTool?.id === 'lineArrow' ? 'Arrow' : 'Line'),
	},
	[PdfAnnotationSubtype.POLYLINE]: { component: LineSidebar, title: 'Polyline' },
	[PdfAnnotationSubtype.INK]: { component: InkSidebar, title: 'Ink' },
	[PdfAnnotationSubtype.HIGHLIGHT]: { component: TextMarkupSidebar, title: 'Highlight' },
	[PdfAnnotationSubtype.UNDERLINE]: { component: TextMarkupSidebar, title: 'Underline' },
	[PdfAnnotationSubtype.STRIKEOUT]: { component: TextMarkupSidebar, title: 'Strikeout' },
	[PdfAnnotationSubtype.SQUIGGLY]: { component: TextMarkupSidebar, title: 'Squiggly' },
	[PdfAnnotationSubtype.CIRCLE]: { component: ShapeSidebar, title: 'Circle' },
	[PdfAnnotationSubtype.SQUARE]: { component: ShapeSidebar, title: 'Square' },
	[PdfAnnotationSubtype.POLYGON]: { component: PolygonSidebar, title: 'Polygon' },
	[PdfAnnotationSubtype.STAMP]: { component: StampSidebar, title: 'Stamp' },
};

export default PDFAnnotator;