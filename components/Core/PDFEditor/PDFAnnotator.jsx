/* eslint-disable @typescript-eslint/no-unused-vars */
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
	ScrollStrategy,
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
import { SearchLayer, SearchPluginPackage, useSearchCapability } from
	'@embedpdf/plugin-search/react';
import {
	AnnotationPluginPackage,
	AnnotationLayer,
	useAnnotationCapability,
} from '@embedpdf/plugin-annotation/react';
import { HistoryPluginPackage, useHistoryCapability } from
	'@embedpdf/plugin-history/react';
import { CapturePluginPackage, MarqueeCapture, useCaptureCapability } from '@embedpdf/plugin-capture/react'
import { RedactionPluginPackage, RedactionLayer, useRedactionCapability } from '@embedpdf/plugin-redaction/react'

// Lucide icons for toolbar
import {
	ZoomIn,
	ZoomOut,
	Printer,
	Search,
	ChevronUp,
	ChevronDown,
	// File,
	Menu,
	FileSearch,
	X,
	Type,
	Pencil,
	Highlighter,
	MousePointer,
	Hand,
	// Download,
	Trash2,
	Image as ImageIcon,
	RotateCw as RotateIcon,
	Undo,
	Redo,
	// Hash,
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
	ChevronDown as DropdownIcon,
	Shapes as ShapesIcon,
	Layers,
	FileText,
	Download,
	Camera,
	Tickets,
	TextCursorInput,
	SquareDashedMousePointer,
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
import Image from 'next/image';

const PDFAnnotator = () => {
	const [pdfUrl, setPdfUrl] = useState(
		'https://snippet.embedpdf.com/ebook.pdf'
	);
	const [showSidebar, setShowSidebar] = useState(true);
	const [sidebarTab, setSidebarTab] = useState('thumbnails'); // 'thumbnails' or 'styles'
	const [searchQuery, setSearchQuery] = useState('');
	// const [showSearch, setShowSearch] = useState(false);
	const [annotationMode, setAnnotationMode] = useState('select');
	const [urlInput, setUrlInput] = useState(pdfUrl);
	const [showUrlDialog, setShowUrlDialog] = useState(false);
	const [toolDropdown, setToolDropdown] = useState(null); // 'shapes', 'lines', 'markup', etc.
	const [scrollLayout, setScrollLayout] = useState(ScrollStrategy.Vertical);

	// const fileInputRef = useRef(null); // upload PDF
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
			createPluginRegistration(ScrollPluginPackage, {
				strategy: scrollLayout
			}),
			createPluginRegistration(ThumbnailPluginPackage, {
				width: 96,
				gap: 6,
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
			// Register and configure the capture plugin
			createPluginRegistration(CapturePluginPackage, {
				scale: 2.0, // Render captured image at 2x resolution
				imageType: 'image/png',
				withAnnotations: true,
			}),
			// Register and configure the redaction plugin
			createPluginRegistration(RedactionPluginPackage, {
				drawBlackBoxes: false, // Draw black boxes over redacted content
			}),
		],
		[pdfUrl, scrollLayout]
	);

	const { engine, isLoading, error } = usePdfiumEngine();

	// const handleFileUpload = useCallback((event) => {
	// 	const file = event.target.files?.[0];
	// 	if (file && file.type === 'application/pdf') {
	// 		const url = URL.createObjectURL(file);
	// 		setPdfUrl(url);
	// 	}
	// }, []);

	const handleUrlLoad = useCallback(() => {
		if (urlInput.trim()) {
			setPdfUrl(urlInput);
			setShowUrlDialog(false);
		}
	}, [urlInput]);

	useEffect(() => {
		setSearchQuery('');
	}, [pdfUrl]);

	if (error) {
		return (
			<div className="flex items-center justify-center h-screen bg-black text-white/80">
				<div className="text-center p-10 bg-black/30 border border-blue-500/20 rounded-2xl shadow-2xl backdrop-blur-xl">
					<p className="text-xl mb-3 font-bold text-blue-400">PDF Engine Error</p>
					<p className="text-sm text-gray-400 mb-5">{error.message}</p>
					<button
						onClick={() => window.location.reload()}
						className="px-6 py-2 bg-blue-900/50 hover:bg-blue-800/50 rounded-xl transition-all duration-300 font-semibold text-blue-100 border border-blue-500/30 backdrop-blur-sm"
					>
						Reload
					</button>
				</div>
			</div>
		);
	}

	if (isLoading || !engine) {
		return (
			<div className="flex items-center justify-center h-screen bg-black">
				<div className="text-center bg-black/30 backdrop-blur-xl p-10 rounded-2xl border border-blue-500/20">
					<div className="animate-pulse rounded-full h-16 w-16 border-2 border-blue-500 mx-auto mb-5"></div>
					<p className="text-white text-lg font-semibold">Initializing Viewer</p>
					<p className="text-gray-500 text-sm mt-2">Stand by for cosmic launch</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex relative flex-col rounded-3xl over mt-12 overflow-hidden h-screen bg-black text-white font-mono">
			{showUrlDialog && (
				<div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-slate-900/80 border border-blue-500/20 px-8 py-6 rounded-2xl z-50 max-w-md w-full mx-4 shadow-2xl backdrop-blur-2xl animate-in fade-in-0 zoom-in-95 duration-300">
					<div className="flex items-center space-x-4">
						<input
							type="text"
							value={urlInput}
							onChange={(e) => setUrlInput(e.target.value)}
							placeholder="Enter cosmic coordinates (URL)"
							className="flex-1 px-5 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl focus:outline-none focus:border-blue-400/50 text-sm transition-all duration-300 text-slate-200 backdrop-blur-xl"
							onKeyPress={(e) => e.key === 'Enter' && handleUrlLoad()}
						/>
						<button
							onClick={handleUrlLoad}
							className="px-6 py-3 bg-blue-900/50 hover:bg-blue-800/50 rounded-xl text-sm transition-all duration-300 font-semibold text-blue-200 border border-blue-600/30 shadow-lg"
						>
							Warp
						</button>
						<button
							onClick={() => setShowUrlDialog(false)}
							className="p-3 hover:bg-slate-800/30 rounded-xl transition-all duration-300"
						>
							<X size={16} className="text-slate-400" />
						</button>
					</div>
				</div>
			)}

			<EmbedPDF engine={engine} plugins={plugins}>
				<div className="flex flex-1 overflow-hidden relative">
					{showSidebar ? (
						<aside className="w-60 bg-slate-900/60 rounded-3xl rounded-r-none border-r border-blue-500/10 flex flex-col overflow-hidden shadow-2xl backdrop-blur-2xl z-40">
							<nav className="flex flex-col border-b border-slate-800/50">
								<div className='flex flex-row text-lg p-4 gap-3  justify-start items-center font-pacifico'>
									<button
										onClick={() => setShowSidebar(!showSidebar)}
										className="p-2 flex justify-center hover:bg-slate-800/30 rounded-full transition-all duration-300 border border-slate-700/30"
										title="Orbit Control"
									>
										<Menu size={25} className="text-blue-400" />
									</button>
									{/* <Image src={"/images/options/edit.svg"} alt='edit' width={300} height={300} className='bg-gray-700/30 h-11 w-11 p-2 rounded-full' /> */}
									PDF Annotator

								</div>
								<div className="flex !shadow-[inset_0_0_5px_rgba(200,200,200,0.2)] rounded-full mx-auto w-[85%] flex-row mb-3 gap-0 sm:gap-4 justify-between items-center">
									{[
										{
											id: "thumbnails",
											label: "thumbnails",
											shortLabel: "Thumbnails",
											icon: Layers,
										},
										{
											id: "styles",
											label: "styles",
											shortLabel: "Styles",
											icon: PaletteIcon,
										},
										{
											id: "search",
											label: "search",
											shortLabel: "Search",
											icon: Search,
										},
									].map((tab) => (
										<button
											key={tab.id}
											onClick={() => setSidebarTab(tab.id)}
											className={`px-2 min-h-fit font-semibold py-4 text-xs sm:text-sm w-full  justify-center relative z-50 tracking-wider rounded-full flex items-center gap-2 duration-0 transition-all ${sidebarTab !== tab.id
												? "" : " !shadow-[inset_0_0_5px_rgba(100,100,255,0.7)] bg-gray-950/70 backdrop-blur-md  text-white "
												}`}
										>
											<tab.icon strokeWidth={3} size={18} className="sm:w-5 sm:h-5" />
										</button>
									))}
								</div>
							</nav>

							<div className="flex-1 overflow-y-auto  ">
								{
									sidebarTab === 'thumbnails' ? (
										<div
											className={"flex w-full h-full"}
											style={{ minHeight: 32 }}
										>
											<ThumbnailsPanel />
										</div>
									) : sidebarTab === 'styles' ? (
										<StylesPanel
											selectedAnnotation={selectedAnnotation}
											annotationMode={annotationMode}
										/>
									) : (
										<SearchRenderer />
									)
								}
							</div>
						</aside>
					) : (
						<aside className="w-fit bg-slate-900/60 rounded-3xl rounded-r-none  border-r border-blue-500/10 flex flex-col overflow-hidden shadow-2xl backdrop-blur-2xl z-40">
							<nav className="flex flex-col p-3 gap-4 border-b border-slate-800/50">

								<button
									onClick={() => setShowSidebar(!showSidebar)}
									className="p-2 flex justify-center hover:bg-slate-800/30 rounded-full transition-all duration-300 border border-slate-700/30"
									title="Orbit Control"
								>
									<Menu size={25} className="text-blue-400" />
								</button>
								<Image src={"/images/options/edit.svg"} alt='edit' width={300} height={300} className='bg-blue-700/10 brightness-200 h-12 w-12 p-3 rounded-full' />

								<button
									onClick={() => { setSidebarTab('thumbnails'); setShowSidebar(true) }}
									className="p-2 mt-8 flex justify-center hover:bg-slate-800/30 rounded-xl transition-all duration-300 border border-slate-700/30"
									title="Page Control"
								>
									<Layers strokeWidth={2.5} size={25} className="text-white" />
								</button>
								<button
									onClick={() => { setSidebarTab('styles'); setShowSidebar(true) }}
									className="p-2 flex justify-center hover:bg-slate-800/30 rounded-xl transition-all duration-300 border border-slate-700/30"
									title="Style Control"
								>
									<PaletteIcon strokeWidth={2.5} size={25} className="text-white" />
								</button>
								<button
									onClick={() => { setSidebarTab('search'); setShowSidebar(true) }}
									className="p-2 flex justify-center hover:bg-slate-800/30 rounded-xl transition-all duration-300 border border-slate-700/30"
									title="Scan Void"
								>
									<Search strokeWidth={2.5} size={25} className="text-white" />
								</button>
							</nav>
						</aside>
					)}


					<main className="flex-1 h-auto flex  flex-col overflow-hidden relative">
						<div className=" z-30">
							<MainToolbar
								scrollLayout={scrollLayout}
								setScrollLayout={setScrollLayout}
								searchQuery={searchQuery}
								setSearchQuery={setSearchQuery}
								annotationMode={annotationMode}
								setAnnotationMode={setAnnotationMode}
								annotationApiRef={annotationApiRef}
								setSelectedAnnotation={setSelectedAnnotation}
								setSidebarTab={setSidebarTab}
								setShowSidebar={setShowSidebar}
								toolDropdown={toolDropdown}
								setToolDropdown={setToolDropdown}
							/>
						</div>

						<div className="flex-1 overflow-hidden bg-black backdrop-blur-sm relative z-10">
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
													margin: '16px',
													boxShadow: '0 16px 48px -10px rgba(0,0,0,0.8)',
													backgroundColor: '#ffffff',
													borderRadius: 16,
													overflow: 'hidden',
													border: '1px solid rgba(100, 116, 139, 0.1)',
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
															selectionOutlineColor="#06b6d4"
														/>
														<MarqueeCapture pageIndex={pageIndex} scale={scale} />
														<RedactionLayer pageIndex={pageIndex} scale={scale} rotation={rotation} selectionMenu={(props) => <RedactionMenu {...props} />} />

													</PagePointerProvider>
												</Rotate>
											</div>
										)}
									/>
								</Viewport>
							</GlobalPointerProvider>
						</div>
					</main>
				</div>
			</EmbedPDF>
		</div>
	);
};

// Thumbnails Panel Component
const ThumbnailsPanel = React.memo(() => {
	const { state, provides } = useScroll();
	return (
		<ThumbnailsPane
			style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgb(24, 78, 132,0.8) rgba(0, 0, 0, 0.1)' }}
			className=' relative w-full !flex-row !flex !justify-center !items-center'>
			{(meta) => {
				const isActive = state.currentPage === meta.pageIndex + 1;
				return (
					<div
						key={meta.pageIndex}
						style={{
							position: 'relative',
							// height: meta.wrapperHeight,
							cursor: 'pointer',
						}}
						className={`border  w-fit my-4 !shadow-[inset_0_0_5px_rgba(200,200,200,0.2)]  flex flex-col justify-center items-center rounded-xl overflow-hidden hover:border-blue-400/30 transition-all duration-400 ease-out bg-slate-900/40 hover:shadow-blue-500/10 ${isActive ? 'border-blue-400/40 ring-2 ring-blue-400/20 bg-blue-900/20 scale-105' : 'border-slate-700/30'}`}
						onClick={() =>
							provides?.scrollToPage({ pageNumber: meta.pageIndex + 1 })
						}
					>
						<div
							style={{
								width: meta.width * 1.4,
								height: meta.height * 1.3,
							}}
							className="bg-white bg-contain overflow-hidden rounded-t-xl"
						>
							<ThumbImg className='h-full w-full ' meta={meta} />
						</div>
						<div className="px-2 py-2 text-xs text-center text-white/70 font-bold bg-slate-900/40 backdrop-blur-xl">
							page {meta.pageIndex + 1}
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
		<div className="h-full overflow-y-auto p-6 rounded-xl text-slate-200">
			{computedTitle && (
				<h2 className="text-lg mb-6 font-extrabold text-white border-b border-blue-500/20 pb-3 tracking-wide">
					{computedTitle} Styles
				</h2>
			)}
			<Sidebar {...commonProps} />
		</div>
	);
};


const RedactionMenu = (props) => {
	const { provides } = useRedactionCapability();
	if (!props.selected) return null;
	console.log(props)
	return (
		<div {...props.menuWrapperProps}>
			<div
				className='bg-black/40 backdrop-blur-md p-2 rounded-xl flex flex-row justify-center items-center'
				style={{
					position: 'absolute',
					top: props.rect.size.height + 10,
					left: 0,
					pointerEvents: 'auto'
				}}
			>
				<button className='bg-red-500 text-xs rounded-[9px] px-4 py-2' onClick={() => provides?.commitPending(props.item.page, props.item.id)}>Add</button>
				<button className='text-xs rounded-xl px-4 py-2' onClick={() => provides?.removePending(props.item.page, props.item.id)}>Remove</button>
			</div>
		</div>
	);
};


// Main Toolbar Component
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
	const { state: scrollState, provides: scrollApi } = useScroll();
	const { provides: zoomApi, state: zoomState } = useZoom();
	const { provides: rotateApi } = useRotate();
	const { provides: printApi } = usePrintCapability();
	const { provides: panApi } = usePan();
	const { provides: annotationApi } = useAnnotationCapability();
	const { provides: historyApi } = useHistoryCapability();
	const { provides: redactApi } = useRedactionCapability();
	const [, setSelected] = useState(null);
	const [canUndo, setCanUndo] = useState(false);
	const [canRedo, setCanRedo] = useState(false);
	const { provides: capture } = useCaptureCapability();

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

	const [imageUrl, setImageUrl] = useState(null);

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
	console.log(annotationMode)
	useEffect(() => {
		if (annotationMode === 'redactText') {
			redactApi?.toggleRedactSelection()
		}
		else if (annotationMode === 'redactSelection') {
			redactApi?.toggleMarqueeRedact()
		}
	}, [annotationMode, panApi, annotationApi, setShowSidebar, setSidebarTab, modeMap, redactApi]);


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
			<div className="flex items-center justify-center py-4 text-slate-400 text-sm w-full">
				Assembling fragments...
			</div>
		);
	}

	const ToolDropdown = ({ group, onSelect, onClose }) => {
		const groups = {
			shapes: [
				{ mode: 'circle', icon: Circle, label: 'Orb' },
				{ mode: 'square', icon: Square, label: 'Cube' },
				{ mode: 'polygon', icon: CornerDownRight, label: 'Prism' },
			],
			lines: [
				{ mode: 'line', icon: CornerDownRight, label: 'Line' },
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
			<div className="absolute top-full left-0 mt-2  bg-slate-800/80 border border-slate-700/30 rounded-xl shadow-2xl z-50 min-w-[200px] overflow-hidden">
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
	const handleScrollLayoutToggle = () => {
		if (scrollLayout === ScrollStrategy.Vertical) setScrollLayout(ScrollStrategy.Horizontal)
		else setScrollLayout(ScrollStrategy.Vertical)
	}
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
				<div className="flex justify-between w-full items-center space-x-3 bg-gray-950/40  rounded-tr-3xl backdrop-blur-xl border-b border-slate-800/50 shadow-2xl px-6 pt-5 pb-4">
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

					<div className="w-px h-8 bg-slate-700/30 mx-2 flex-shrink-0" />

					<button
						onClick={handleDeleteSelected}
						className="p-3 rounded-xl transition-all duration-300 flex-shrink-0 hover:!shadow-[inset_0_0_5px_rgba(200,0,0,0.6)] text-red-300  !shadow-[inset_0_0_5px_rgba(200,0,0,0.4)]"
						title="Vaporize"
					>
						<Trash2 size={16} />
					</button>
					{console.log("hehee", scrollLayout)
					}
					<div className="w-px h-8 bg-slate-700/30 mx-2 flex-shrink-0" />
					<label onMouseUp={handleScrollLayoutToggle} className="inline-flex items-center cursor-pointer">
						<input type="checkbox" value="" className="sr-only peer" />
						<div className={`relative w-20 h-9 ${scrollLayout === ScrollStrategy.Horizontal ? ' !shadow-[inset_0_0_5px_rgba(50,100,255,0.2)] ' : '!shadow-[inset_0_0_5px_rgba(200,200,200,0.2)] dark:bg-gray-700'} peer-focus:outline-none  rounded-xl  after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:!shadow-[inset_0_0_25px_rgba(50,100,250,1)]   after:rounded-[11px] after:h-8 after:w-8 after:transition-all dark:after:border-gray-600 ${scrollLayout === ScrollStrategy.Vertical ? 'after:-translate-x-0.5 after:border-gray-300' : 'after:translate-x-[130%] after:border-white'}`}></div>
					</label>
					{/* <select
						className="w-full rounded-xl border border-slate-700/50 bg-slate-950 px-3 py-3 text-sm text-slate-200 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/40"
						value={scrollLayout}
						onChange={(e) => setScrollLayout(e.target.value)}
					>

						{[ScrollStrategy.Horizontal, ScrollStrategy.Vertical].map((o) => (
							<option key={o} value={o} >
								{o}
							</option>
						))}
					</select> */}
					<div className="w-px h-8 bg-slate-700/30 mx-2 flex-shrink-0" />

					<button
						onClick={() => scrollApi?.scrollToPreviousPage()}
						disabled={currentPage <= 1}
						className="p-3 !shadow-[inset_0_0_5px_rgba(100,100,255,0.6)] bg-gray-950/70  text-white  rounded-xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed   backdrop-blur-xl"
						title="Ascend"
					>
						<ChevronUp strokeWidth={3} size={16} className="text-slate-300" />
					</button>
					<div className="flex items-center space-x-2 !shadow-[inset_0_0_5px_rgba(200,200,200,0.2)] bg-gray-950/70  text-white rounded-xl px-4 py-2.5  border border-slate-700/30 backdrop-blur-xl">
						<input
							type="number"
							value={currentPage}
							min={1}
							max={totalPages}
							onChange={handlePageChange}
							className="w-5 bg-transparent text-center font-semibold text-xs focus:outline-none text-white"
						/>
						<span className="text-xs font-semibold text-slate-400 pr-2"> / {totalPages}</span>
					</div>
					<button
						onClick={() => scrollApi?.scrollToNextPage()}
						disabled={currentPage >= totalPages}
						className="p-3 !shadow-[inset_0_0_5px_rgba(100,100,255,0.6)] bg-gray-950/70  text-white  rounded-xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed   backdrop-blur-xl"
						title="Descend"
					>
						<ChevronDown strokeWidth={3} size={16} className="text-slate-300" />
					</button>

					<div className="w-px h-8 bg-slate-700/30 mx-2 flex-shrink-0" />

					<div className="flex py-2.5 items-center space-x-2 !shadow-[inset_0_0_5px_rgba(200,200,200,0.2)]  rounded-xl ">
						<button
							onClick={() => zoomApi?.zoomOut()}
							className="px-3 hover:bg-slate-700/30 rounded-l-xl transition-all duration-300"
							title="Contract"
						>
							<ZoomOut strokeWidth={3} size={16} className="text-slate-300" />
						</button>
						<select
							value={Math.round(zoom * 100)}
							onChange={(e) =>
								zoomApi?.requestZoom(parseInt(e.target.value, 10) / 100)
							}
							className="bg-transparent px-4  text-sm focus:outline-none cursor-pointer text-white font-mono"
							style={{ appearance: 'none', width: 'fit-content' }}
						>
							{zoomLevels.map((level) => (
								<option key={level} value={Math.round(level * 100)} className=' bg-black-100'>
									{Math.round(level * 100)}%
								</option>
							))}
						</select>
						<button
							onClick={() => zoomApi?.zoomIn()}
							className="px-3 hover:bg-slate-700/30 rounded-r-xl transition-all duration-300"
							title="Expand"
						>
							<ZoomIn strokeWidth={3} size={16} className="text-slate-300" />
						</button>
					</div>

					<button
						onClick={() => rotateApi?.rotateForward()}
						className="p-3 !shadow-[inset_0_0_5px_rgba(200,200,200,0.2)] rounded-xl transition-all duration-300"
						title="Spin"
					>
						<RotateIcon strokeWidth={3} size={16} className="text-slate-300" />
					</button>
					<button
						onClick={() => printApi?.print()}
						className="p-3 !shadow-[inset_0_0_5px_rgba(200,200,200,0.2)]  rounded-xl transition-all duration-300"
						title="Manifest"
					>
						<Printer strokeWidth={3} size={16} className="text-slate-300" />
					</button>

				</div>

				{/* below toolbar */}
				<div className="flex justify-between w-fit items-center space-x-4 mx-auto bg-slate-900/40  rounded-b-3xl backdrop-blur-xl border border-t-0 border-slate-800/50 shadow-2xl px-5 py-3 ">
					<button
						onClick={() => setAnnotationMode('select')}
						className={`p-3 rounded-xl transition-all duration-300 flex-shrink-0 ${annotationMode === 'select' ? ' text-white !shadow-[inset_0_0_5px_rgba(100,100,255,0.9)]' : '!shadow-[inset_0_0_5px_rgba(200,200,200,0.2)] text-slate-300'}`}
						title="Selector"
					>
						<MousePointer strokeWidth={3} size={14} />
					</button>
					<button
						onClick={() => setAnnotationMode('pan')}
						className={`p-3 rounded-xl transition-all duration-300 flex-shrink-0 ${annotationMode === 'pan' ? ' text-white !shadow-[inset_0_0_5px_rgba(100,100,255,0.9)]' : '!shadow-[inset_0_0_5px_rgba(200,200,200,0.2)] text-slate-300'}`}
						title="Drift"
					>
						<Hand strokeWidth={3} size={14} />
					</button>
					<div className="w-px h-8 bg-slate-700/30 mx-2 flex-shrink-0" />

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
						onClick={() => capture?.toggleMarqueeCapture()}
						onMouseUp={() => {
							if (annotationMode === "capture") {
								setAnnotationMode("select")
							}
							else {
								setAnnotationMode('capture')
							}
						}}
						className={`p-3 rounded-xl transition-all duration-300 flex-shrink-0 ${annotationMode === 'capture' ? ' text-white !shadow-[inset_0_0_5px_rgba(100,100,255,0.9)]' : '!shadow-[inset_0_0_5px_rgba(200,200,200,0.2)] text-slate-300'}`}
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
			className={`w-full text-left rounded-xl p-3 transition-all duration-400 ease-out
        relative overflow-hidden border
        bg-slate-900/50 backdrop-blur-2xl
        shadow-2xl
        ${active
					? 'border-blue-400/40 ring-1 ring-blue-400/30 bg-blue-900/30 text-blue-200'
					: 'border-slate-700/30 border-l-4 border-l-blue-400/30  hover:border-blue-400/30 hover:bg-slate-800/30'
				}`}
			aria-current={active ? 'true' : 'false'}
		>
			<div className="flex items-start gap-4">
				<div className="min-w-0 flex-1 text-xs leading-tight text-slate-200">
					<div className="truncate">
						{truncatedLeft && <span className="text-slate-400">… </span>}
						<span className="text-slate-300">{before.slice(-15)}</span>
						<span className="font-bold text-white mx-1">{match}</span>
						<span className="text-slate-300">{after}</span>
						{truncatedRight && <span className="text-slate-400"> …</span>}
					</div>
				</div>
			</div>
		</button>
	);
}

export const Checkbox = ({ label, checked, onChange }) => {
	return (
		<label className="flex items-center gap-3 cursor-pointer select-none text-slate-300">
			<span
				className={`relative flex h-5 w-5 items-center justify-center rounded-[7px]
          transition-all duration-300 backdrop-blur-xl
          ${checked ? 'bg-blue-900/50 border border-blue-500/30 shadow-lg shadow-blue-500/20' : 'bg-slate-800/50 border border-slate-700/30'}`}
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
					className={`h-3 w-3 transition-opacity duration-300 ${checked ? 'opacity-100 text-blue-200' : 'opacity-0'}`}
					fill="none"
					stroke="currentColor"
					strokeWidth={3}
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<polyline points="20 6 9 17 4 12" />
				</svg>
			</span>
			<span className="select-none text-xs tracking-tight">{label}</span>
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
			className={`flex h-9 min-w-[36px] items-center justify-center gap-2 rounded-xl px-3 text-sm transition-all duration-300 backdrop-blur-xl border border-slate-700/30
        ${active ? 'bg-blue-900/40 text-white ring-2 ring-blue-400/30 shadow-lg shadow-blue-500/20' : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white'}
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

	const clearInput = useCallback(() => {
		setInputValue('');
		search?.stopSearch();
		setResults([]);
		setActiveResultIndex(-1);
		inputRef.current?.focus();
	}, [search]);

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
	}, [results, activeResultIndex, search, clearInput]);

	return (
		<div className="flex h-full w-full z-50 pointer-events-auto flex-col text-slate-200  border border-blue-500/10 overflow-hidden shadow-2xl  max-w-4xl mx-auto">
			<div className="py-6   border-b border-slate-800/50 flex-shrink-0">
				<div className="relative px-3">
					<div className="absolute inset-y-0 left-0 flex items-center pl-6 pointer-events-none">
						<Search className=' h-5 w-5' />
					</div>

					<input
						ref={inputRef}
						type="text"
						placeholder="Scan the void (↑/↓ navigate, Enter lock)"
						value={inputValue}
						onInput={handleInputChange}
						className="w-full rounded-xl  !shadow-[inset_0_0_5px_rgba(200,200,200,0.2)]  bg-slate-900/10 py-4 pl-12 pr-10 text-sm text-slate-200 placeholder-slate-400 focus:outline-none  transition-all duration-300 "
						aria-label="Scan"
					/>

					{inputValue ? (
						<button
							type="button"
							className="absolute inset-y-0 right-0 flex items-center pr-6 text-slate-400 hover:text-slate-200"
							onClick={clearInput}
							aria-label="Purge scan"
						>
							<svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
								<path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.416 0L10 8.586l4.293-4.293a1 1 0 111.416 1.416L11.416 10l4.293 4.293a1 1 0 01-1.416 1.416L10 11.416l-4.293 4.293a1 1 0 01-1.416-1.416L8.586 10 4.293 5.707a1 1 0 010-1.416z" clipRule="evenodd" />
							</svg>
						</button>
					) : null}
				</div>

				<div className="mt-5 flex flex-wrap items-center gap-5">
					<div className="flex items-center gap-2 mx-auto justify-center">
						<Checkbox
							label="Case lock"
							checked={flags.includes(MatchFlag.MatchCase)}
							onChange={(checked) => handleFlagChange(MatchFlag.MatchCase, checked)}
						/>
						<Checkbox
							label="Full echo"
							checked={flags.includes(MatchFlag.MatchWholeWord)}
							onChange={(checked) => handleFlagChange(MatchFlag.MatchWholeWord, checked)}
						/>
					</div>

					<div className="mx-auto text-sm text-blue-400/70 font-bold">{totalResults} Instances Found</div>
				</div>
			</div>

			<div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden  py-3 pl-2">
				<div
					className="flex flex-col gap-4 overflow-y-auto pr-2"
					style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgb(24, 78, 132,0.8) rgba(0, 0, 0, 0.1)', maxHeight: 'calc(100%)' }}
				>
					{totalResults === 0 ? (
						<div className="mt-8 flex justify-center items-center gap-4 text-center text-sm text-slate-400"><FileSearch className='w-5 h-5' />Found  Nothing</div>
					) : (
						Object.entries(grouped).map(([page, hits]) => (
							<div key={page} className="mt-2  relative first:mt-0">
								{/* <hr className=' w-24 top-0 rotate-90 -left-12  absolute border border-blue-400/30'/>  */}
								<div className='flex  w-fit pr-3 border-[1px] border-blue-400/20  mt-2 rounded-xl mb-3 gap-3 items-center'>

									<div className="inline-flex min-w-fit items-center gap-2 rounded-xl bg-slate-800/50 px-2 py-2 text-sm text-slate-300 border border-slate-700/30 backdrop-blur-xl">
										<FileText size={20} className='min-w-fit' />
										{/* <span className="inline-block  h-2 w-2 rounded-full bg-blue-400/80 shadow-lg shadow-blue-500/20" /> */}

									</div>
									<span className='whitespace-nowrap'>Page {Number(page) + 1}</span>
									{/* <hr className=' w-4 border-[1px] border-blue-400/30 border-dashed' /> */}
								</div>
								<div className="mt-3 flex flex-col  relative  pl-3 gap-3">
									<div className='absolute -mt-4 left-0 border-l-[2px] border-blue-400/30 h-full' />
									{hits.map(({ hit, index }) => (
										<div key={index} className=' relative'>
											<hr className='absolute border-blue-400/30  border-[1px] top-[52%] -left-3 w-4' />
											<HitLine
												key={index}
												hit={hit}
												active={index === activeResultIndex}
												onClick={() => {
													setActiveResultIndex(index);
													search?.goToResult(index);
												}}
											/>
										</div>
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
		className="range-sm mb-3 h-3.5  w-full cursor-pointer appearance-none rounded-full bg-slate-700/50"
		value={value}
		min={min}
		max={max}
		step={step}
		onInput={(e) => onChange(parseFloat(e.target.value))}
		style={{
			background: `linear-gradient(to right, #0055FF80 ${((value - min) / (max - min)) * 100}%, #284247 ${((value - min) / (max - min)) * 100}%)`,
		}}
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
			className={`h-7 w-7 rounded-full border border-gray-600 ${active ? 'outline outline-2 outline-offset-2 outline-blue-500' : ''}`}
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
	<svg width="72" height="8" viewBox="0 0 72 8" className="text-white">
		<line
			x1="0"
			y1="4"
			x2="72"
			y2="4"
			style={{
				strokeDasharray: dash?.join(' '),
				stroke: '#0ea5e9',
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
		renderOption={(s) => <div className="px-2 py-3">{renderStrokeSvg(s.dash)}</div>}
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
	const groupTransform = position === 'start' ? 'rotate(180 40 5)' : '';

	return (
		<svg width="72" height="16" viewBox="0 0 72 16" className="text-white">
			<g transform={groupTransform}>
				<line x1="4" y1="8" x2={lineEndX} y2="8" stroke="currentColor" strokeWidth="1.5" />
				{marker && (
					<g
						transform="translate(0, 8)"
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
		triggerClass="px-4 py-3"
		renderValue={(v) => <LineEndingIcon ending={v} position={position} />}
		renderOption={(e) => (
			<div className="px-2 py-3">
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
		triggerClass="px-3 py-3 text-sm"
		renderValue={(v) => <span className="text-slate-200">{standardFontFamilyLabel(v)}</span>}
		renderOption={(f) => <div className="px-3 py-3 text-slate-200">{standardFontFamilyLabel(f)}</div>}
	/>
);

// FontSizeInputSelect Component
const FontSizeInputSelect = ({ value, onChange, options = [8, 9, 10, 11, 12, 16, 16, 18, 24, 36, 48, 72] }) => {
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
				className="w-full rounded-xl border border-slate-700/50 bg-slate-800/50 px-3 py-3 pr-8 text-sm text-slate-200 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/40"
				value={value}
				onInput={handleInput}
				onClick={() => setOpen(true)}
			/>
			<button
				type="button"
				className="absolute inset-y-0 right-0 flex items-center pr-2 text-slate-400"
				onClick={() => setOpen(!open)}
				tabIndex={-1}
			>
				<svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
					<path
						fillRule="evenodd"
						d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
						clipRule="evenodd"
					/>
				</svg>
			</button>

			{open && (
				<div className="absolute z-10 mt-2 max-h-40 w-full overflow-y-auto rounded-xl border bg-slate-800/50 shadow-2xl border-slate-700/30 backdrop-blur-2xl">
					{options.map((sz) => {
						const isSelected = sz === value;
						return (
							<button
								ref={isSelected ? selectedItemRef : null}
								key={sz}
								className={`block w-full px-3 py-3 text-left text-sm hover:bg-slate-700/30 text-slate-200 ${isSelected ? 'bg-blue-900/30' : ''}`}
								onClick={() => {
									onChange(sz);
									setOpen(false);
								}}
							>
								{sz}px
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
	triggerClass = 'px-4 py-3',
}) => {
	const { open, setOpen, rootRef, selectedItemRef } = useDropdown();

	return (
		<div ref={rootRef} className="relative inline-block w-full">
			<button
				type="button"
				className={`flex w-full items-center justify-between gap-2 rounded-xl border border-slate-700/50 bg-slate-800/50 ${triggerClass} text-slate-200 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/40 transition-all duration-300`}
				onClick={() => setOpen(!open)}
			>
				{renderValue(value)}
				<svg
					className="h-4 w-4 text-slate-400"
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
				<div className="absolute z-10 mt-2 max-h-48 w-full overflow-y-auto rounded-xl border bg-slate-800/50 p-2 shadow-2xl border-slate-700/30 backdrop-blur-2xl">
					{options.map((option) => {
						const isSelected = getOptionKey(option) === getOptionKey(value);
						return (
							<button
								ref={isSelected ? selectedItemRef : null}
								key={getOptionKey(option)}
								className={`block w-full rounded-lg text-left hover:bg-slate-700/30 text-slate-200 transition-all duration-300 ${isSelected ? 'bg-blue-900/30' : ''}`}
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
	<div className="flex flex-col items-center gap-5 p-8 text-slate-400/60  border-b border-slate-700/30">
		<Palette size={48} className="text-slate-400/60" />
		<div className="max-w-[200px] text-center text-sm text-slate-400/60">
			Invoke an ether or select a fragment to forge styles
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
			<section className="mb-8">
				<label className="mb-4 block text-sm font-extrabold text-white border-b border-blue-500/20 pb-2 tracking-wide">Glyph Forge</label>

				{/* Family + size */}
				<div className="mb-5 flex gap-3">
					<FontFamilySelect value={fontFamily} onChange={onFamilyChange} />
					<div className="w-40">
						<FontSizeInputSelect value={fontSize} onChange={changeFontSize} />
					</div>
				</div>

				{/* Bold / Italic toggles */}
				<div className="flex gap-3">
					<button
						type="button"
						title="Forge Bold"
						disabled={
							!standardFontIsBold(makeStandardFont(fontFamily, { bold: true, italic: false }))
						}
						onClick={toggleBold}
						className={`h-11 w-11 rounded-xl border border-slate-700/30 px-2 py-2 text-sm font-bold backdrop-blur-xl shadow-lg transition-all duration-300 ${bold ? 'bg-blue-900/40 text-blue-200 shadow-blue-500/20' : 'bg-slate-800/50 text-slate-300'} disabled:opacity-40 hover:scale-105`}
					>
						<Bold size={18} />
					</button>

					<button
						type="button"
						title="Forge Italic"
						disabled={
							!standardFontIsItalic(makeStandardFont(fontFamily, { bold: false, italic: true }))
						}
						onClick={toggleItalic}
						className={`h-11 w-11 rounded-xl border border-slate-700/30 px-2 py-2 text-sm italic backdrop-blur-xl shadow-lg transition-all duration-300 ${italic ? 'bg-blue-900/40 text-blue-200 shadow-blue-500/20' : 'bg-slate-800/50 text-slate-300'} disabled:opacity-40 hover:scale-105`}
					>
						<Italic size={18} />
					</button>
				</div>
			</section>

			{/* text alignment */}
			<section className="mb-8">
				<label className="mb-4 block text-sm font-extrabold text-white border-b border-blue-500/20 pb-2 tracking-wide">Flow Align</label>
				<div className="flex gap-3">
					<button
						type="button"
						title="Left Drift"
						onClick={() => changeTextAlign(PdfTextAlignment.Left)}
						className={`h-11 w-11 rounded-xl border border-slate-700/30 px-2 py-2 text-sm backdrop-blur-xl shadow-lg transition-all duration-300 ${textAlign === PdfTextAlignment.Left ? 'bg-blue-900/40 text-blue-200 shadow-blue-500/20' : 'bg-slate-800/50 text-slate-300'} hover:scale-105`}
					>
						<AlignLeft size={18} />
					</button>
					<button
						type="button"
						title="Core Balance"
						onClick={() => changeTextAlign(PdfTextAlignment.Center)}
						className={`h-11 w-11 rounded-xl border border-slate-700/30 px-2 py-2 text-sm backdrop-blur-xl shadow-lg transition-all duration-300 ${textAlign === PdfTextAlignment.Center ? 'bg-blue-900/40 text-blue-200 shadow-blue-500/20' : 'bg-slate-800/50 text-slate-300'} hover:scale-105`}
					>
						<AlignCenter size={18} />
					</button>
					<button
						type="button"
						title="Right Drift"
						onClick={() => changeTextAlign(PdfTextAlignment.Right)}
						className={`h-11 w-11 rounded-xl border border-slate-700/30 px-2 py-2 text-sm backdrop-blur-xl shadow-lg transition-all duration-300 ${textAlign === PdfTextAlignment.Right ? 'bg-blue-900/40 text-blue-200 shadow-blue-500/20' : 'bg-slate-800/50 text-slate-300'} hover:scale-105`}
					>
						<AlignRight size={18} />
					</button>
					<button
						type="button"
						title="Full Span"
						onClick={() => changeTextAlign(PdfTextAlignment.Justify)}
						className={`h-11 w-11 rounded-xl border border-slate-700/30 px-2 py-2 text-sm backdrop-blur-xl shadow-lg transition-all duration-300 ${textAlign === PdfTextAlignment.Justify ? 'bg-blue-900/40 text-blue-200 shadow-blue-500/20' : 'bg-slate-800/50 text-slate-300'} hover:scale-105`}
					>
						<AlignJustify size={18} />
					</button>
				</div>
			</section>

			{/* vertical alignment */}
			<section className="mb-8">
				<label className="mb-4 block text-sm font-extrabold text-white border-b border-blue-500/20 pb-2 tracking-wide">Depth Align</label>
				<div className="flex gap-3">
					<button
						type="button"
						title="Apex"
						onClick={() => changeVerticalAlign(PdfVerticalAlignment.Top)}
						className={`h-11 w-11 rounded-xl border border-slate-700/30 px-2 py-2 text-sm backdrop-blur-xl shadow-lg transition-all duration-300 ${verticalAlign === PdfVerticalAlignment.Top ? 'bg-blue-900/40 text-blue-200 shadow-blue-500/20' : 'bg-slate-800/50 text-slate-300'} hover:scale-105`}
					>
						<AlignVerticalJustifyStart size={18} />
					</button>
					<button
						type="button"
						title="Nexus"
						onClick={() => changeVerticalAlign(PdfVerticalAlignment.Middle)}
						className={`h-11 w-11 rounded-xl border border-slate-700/30 px-2 py-2 text-sm backdrop-blur-xl shadow-lg transition-all duration-300 ${verticalAlign === PdfVerticalAlignment.Middle ? 'bg-blue-900/40 text-blue-200 shadow-blue-500/20' : 'bg-slate-800/50 text-slate-300'} hover:scale-105`}
					>
						<AlignVerticalJustifyCenter size={18} />
					</button>
					<button
						type="button"
						title="Abyss"
						onClick={() => changeVerticalAlign(PdfVerticalAlignment.Bottom)}
						className={`h-11 w-11 rounded-xl border border-slate-700/30 px-2 py-2 text-sm backdrop-blur-xl shadow-lg transition-all duration-300 ${verticalAlign === PdfVerticalAlignment.Bottom ? 'bg-blue-900/40 text-blue-200 shadow-blue-500/20' : 'bg-slate-800/50 text-slate-300'} hover:scale-105`}
					>
						<AlignVerticalJustifyEnd size={18} />
					</button>
				</div>
			</section>

			{/* font colour */}
			<section className="mb-8">
				<label className="mb-4 block text-sm font-extrabold text-white border-b border-blue-500/20 pb-2 tracking-wide">Ether Hue</label>
				<div className="grid grid-cols-6 gap-2">
					{colorPresets.map((c) => (
						<ColorSwatch key={c} color={c} active={c === fontColor} onSelect={changeFontColor} />
					))}
				</div>
			</section>

			{/* background colour */}
			<section className="mb-8">
				<label className="mb-4 block text-sm font-extrabold text-white border-b border-blue-500/20 pb-2 tracking-wide">Void Veil</label>
				<div className="grid grid-cols-6 gap-2">
					{colorPresets.map((c) => (
						<ColorSwatch
							key={c}
							color={c}
							active={c === backgroundColor}
							onSelect={changeBackgroundColor}
						/>
					))}
				</div>
			</section>

			{/* opacity */}
			<section className="mb-8">
				<label className="mb-2 block text-sm font-extrabold text-white border-b border-blue-500/20 pb-2 tracking-wide">Density</label>
				<Slider value={opacity} min={0.1} max={1} step={0.05} onChange={setOpacity} />
				<span className="text-xs text-slate-400">{Math.round(opacity * 100)}%</span>
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
			<section className="mb-8">
				<label className="mb-4 block text-sm font-extrabold text-white border-b border-blue-500/20 pb-2 tracking-wide">Edge Hue</label>
				<div className="grid grid-cols-6 gap-2">
					{colorPresets.map((c) => (
						<ColorSwatch key={c} color={c} active={c === stroke} onSelect={changeStroke} />
					))}
				</div>
			</section>

			{/* opacity */}
			<section className="mb-8">
				<label className="mb-2 block text-sm font-extrabold text-white border-b border-blue-500/20 pb-2 tracking-wide">Density</label>
				<Slider value={opacity} min={0.1} max={1} step={0.05} onChange={setOpac} />
				<span className="text-xs text-slate-400">{Math.round(opacity * 100)}%</span>
			</section>

			{/* stroke style */}
			<section className="mb-8">
				<label className="mb-4 block text-sm font-extrabold text-white border-b border-blue-500/20 pb-2 tracking-wide">Edge Pulse</label>
				<StrokeStyleSelect value={style} onChange={changeStyle} />
			</section>

			{/* stroke width */}
			<section className="mb-8">
				<label className="mb-2 block text-sm font-extrabold text-white border-b border-blue-500/20 pb-2 tracking-wide">Edge Mass</label>
				<Slider value={strokeW} min={1} max={10} step={1} onChange={setWidth} />
				<span className="text-xs text-slate-400">{strokeW}px</span>
			</section>

			{/* line endings in a grid */}
			<section className="mb-8">
				<label className="mb-4 block text-sm font-extrabold text-white border-b border-blue-500/20 pb-2 tracking-wide">Termini</label>
				<div className="grid grid-cols-2 gap-6">
					<div>
						<div className="text-xs text-slate-400/70 mb-2 font-bold">Origin</div>
						<LineEndingSelect value={startEnding} onChange={changeStartEnding} position="start" />
					</div>
					<div>
						<div className="text-xs text-slate-400/70 mb-2 font-bold">Terminus</div>
						<LineEndingSelect value={endEnding} onChange={changeEndEnding} position="end" />
					</div>
				</div>
			</section>

			{/* fill color */}
			<section className="mb-8">
				<label className="mb-4 block text-sm font-extrabold text-white border-b border-blue-500/20 pb-2 tracking-wide">Core Hue</label>
				<div className="grid grid-cols-6 gap-2">
					{colorPresets.map((c) => (
						<ColorSwatch key={c} color={c} active={c === fill} onSelect={changeFill} />
					))}
				</div>
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
			<section className="mb-8">
				<label className="mb-4 block text-sm font-extrabold text-white  pb-2 tracking-wide">Colors</label>
				<div className="grid grid-cols-6 gap-2">
					{colorPresets.map((c) => (
						<ColorSwatch key={c} color={c} active={c === color} onSelect={changeColor} />
					))}
				</div>
			</section>

			{/* opacity */}
			<section className="mb-8">
				<label className="mb-2 flex flex-row justify-between items-center text-sm font-extrabold text-white  pb-2 tracking-wide">Density <span className="text-xs text-slate-400">{Math.round(opacity * 100)}%</span></label>
				<Slider value={opacity} min={0.1} max={1} step={0.05} onChange={setOpacity} />

			</section>

			{/* blend mode */}
			<section className="mb-8">
				<label className="mb-2 block text-sm font-extrabold text-white border-b border-blue-500/20 pb-2 tracking-wide">Fusion Mode</label>
				<select
					className="w-full rounded-xl border border-slate-700/50 bg-slate-950 px-3 py-3 text-sm text-slate-200 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/40"
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
			<section className="mb-8">
				<label className="mb-4 block text-sm font-extrabold text-white border-b border-blue-500/20 pb-2 tracking-wide">Core Hue</label>
				<div className="grid grid-cols-6 gap-2">
					{colorPresets.map((c) => (
						<ColorSwatch key={c} color={c} active={c === fill} onSelect={changeFill} />
					))}
				</div>
			</section>

			{/* opacity */}
			<section className="mb-8">
				<label className="mb-2 block text-sm font-extrabold text-white border-b border-blue-500/20 pb-2 tracking-wide">Density</label>
				<Slider value={opacity} min={0.1} max={1} step={0.05} onChange={setOpac} />
				<span className="text-xs text-slate-400">{Math.round(opacity * 100)}%</span>
			</section>

			{/* stroke color */}
			<section className="mb-8">
				<label className="mb-4 block text-sm font-extrabold text-white border-b border-blue-500/20 pb-2 tracking-wide">Edge Hue</label>
				<div className="grid grid-cols-6 gap-2">
					{colorPresets.map((c) => (
						<ColorSwatch key={c} color={c} active={c === stroke} onSelect={changeStroke} />
					))}
				</div>
			</section>

			{/* stroke style */}
			<section className="mb-8">
				<label className="mb-4 block text-sm font-extrabold text-white border-b border-blue-500/20 pb-2 tracking-wide">Edge Pulse</label>
				<StrokeStyleSelect value={style} onChange={changeStyle} />
			</section>

			{/* stroke-width */}
			<section className="mb-8">
				<label className="mb-2 block text-sm font-extrabold text-white border-b border-blue-500/20 pb-2 tracking-wide">Edge Mass</label>
				<Slider value={strokeW} min={1} max={30} step={1} onChange={setWidth} />
				<span className="text-xs text-slate-400">{strokeW}px</span>
			</section>
		</>
	);
};

// PolygonSidebar can use ShapeSidebar since similar
const PolygonSidebar = ShapeSidebar;

// StampSidebar Component (converted to React)
const StampSidebar = () => {
	return <div className="text-sm text-slate-400/60 p-5 backdrop-blur-xl rounded-xl border border-slate-700/30">Imprints defy ether customization.</div>;
};

// Sidebar Registry
const SIDEbars = {
	[PdfAnnotationSubtype.FREETEXT]: { component: FreeTextSidebar, title: 'Inscription' },
	[PdfAnnotationSubtype.LINE]: {
		component: LineSidebar,
		title: (p) => (p.activeTool?.id === 'lineArrow' ? 'Vector' : 'Thread'),
	},
	[PdfAnnotationSubtype.POLYLINE]: { component: LineSidebar, title: 'PolyLine' },
	[PdfAnnotationSubtype.INK]: { component: TextMarkupSidebar, title: 'Ink' },
	[PdfAnnotationSubtype.HIGHLIGHT]: { component: TextMarkupSidebar, title: 'Highlight' },
	[PdfAnnotationSubtype.UNDERLINE]: { component: TextMarkupSidebar, title: 'Underline' },
	[PdfAnnotationSubtype.STRIKEOUT]: { component: TextMarkupSidebar, title: 'Strikethrough' },
	[PdfAnnotationSubtype.SQUIGGLY]: { component: TextMarkupSidebar, title: 'Squiggly' },
	[PdfAnnotationSubtype.CIRCLE]: { component: ShapeSidebar, title: 'Circle' },
	[PdfAnnotationSubtype.SQUARE]: { component: ShapeSidebar, title: 'Aquare' },
	[PdfAnnotationSubtype.POLYGON]: { component: PolygonSidebar, title: 'Polygon' },
	[PdfAnnotationSubtype.STAMP]: { component: StampSidebar, title: 'Image' },
};

export default PDFAnnotator;