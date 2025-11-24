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
import { PanPluginPackage } from '@embedpdf/plugin-pan/react';

// Features
import {
	ThumbnailPluginPackage,
} from '@embedpdf/plugin-thumbnail/react';
import { ZoomPluginPackage, } from '@embedpdf/plugin-zoom/react';
import { RotatePluginPackage, Rotate } from
	'@embedpdf/plugin-rotate/react';
import { PrintPluginPackage } from
	'@embedpdf/plugin-print/react';
import { SpreadPluginPackage } from '@embedpdf/plugin-spread/react';
import { SearchLayer, SearchPluginPackage } from
	'@embedpdf/plugin-search/react';
import {
	AnnotationPluginPackage,
	AnnotationLayer,
} from '@embedpdf/plugin-annotation/react';
import { HistoryPluginPackage } from
	'@embedpdf/plugin-history/react';
import { CapturePluginPackage, MarqueeCapture } from '@embedpdf/plugin-capture/react'
import { RedactionPluginPackage, RedactionLayer } from '@embedpdf/plugin-redaction/react'
import { ExportPluginPackage } from '@embedpdf/plugin-export/react'
// Lucide icons for toolbar
import {
	Search,
	Menu,
	Palette,
	Layers,
} from 'lucide-react';

// Import models for types
import {
	PdfAnnotationSubtype,
} from '@embedpdf/models';
import Image from 'next/image';
import { useToast } from '../../../hooks/use-toast';
import MainToolbar from './PDFAnnotatorComponents/MainToolbar';
import DownloadComponent from './PDFAnnotatorComponents/DownloadComponent';
import PageControls from './PDFAnnotatorComponents/PageControls';
import ThumbnailsPanel from './PDFAnnotatorComponents/ThumbnailsPanel';
import StylesPanel from './PDFAnnotatorComponents/StylesPanel';
import RedactionMenu from './PDFAnnotatorComponents/RedactionMenu';
import FreeTextSidebar from './PDFAnnotatorComponents/Sidebars/FreeTextSidebar';
import LineSidebar from './PDFAnnotatorComponents/Sidebars/LineSidebar';
import TextMarkupSidebar from './PDFAnnotatorComponents/Sidebars/TextMarkupSidebar';
import SearchRenderer from './PDFAnnotatorComponents/SearchRenderer';
import ShapeSidebar from './PDFAnnotatorComponents/Sidebars/ShapeSidebar';
import StampSidebar from './PDFAnnotatorComponents/Sidebars/StampSidebar';
const PDFAnnotator = () => {
	// const [pdfUrl, setPdfUrl] = useState();	//'https://snippet.embedpdf.com/ebook.pdf'
	const [showSidebar, setShowSidebar] = useState(true);
	const [sidebarTab, setSidebarTab] = useState('thumbnails'); // 'thumbnails' or 'styles'
	const [searchQuery, setSearchQuery] = useState('');
	// const [showSearch, setShowSearch] = useState(false);
	const [annotationMode, setAnnotationMode] = useState('select');
	const [toolDropdown, setToolDropdown] = useState(null); // 'shapes', 'lines', 'markup', etc.
	const [scrollLayout, setScrollLayout] = useState(ScrollStrategy.Vertical);

	// const fileInputRef = useRef(null); // upload PDF
	const annotationApiRef = useRef(null);

	//page change related stuff here
	const [selectedAnnotation, setSelectedAnnotation] = useState(null);


	//file upload related shit
	const [dragActive, setDragActive] = useState(false);
	const { toast } = useToast();
	const [pdfFile, setPdfFile] = useState(null);
	const [pdfUrl, setPdfUrl] = useState(null); // Changed from useState(); to useState(null);

	// Replace the existing handleFileChange function
	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file && file.type === 'application/pdf') {
			if (pdfUrl) {
				URL.revokeObjectURL(pdfUrl); // Revoke previous URL if exists
			}
			setPdfFile(file);
			setPdfUrl(URL.createObjectURL(file));
		} else {
			showToastError('Please upload a valid PDF file');
		}
	};
	const showToastError = useCallback((message) => {
		toast({
			variant: "destructive",
			title: (
				<div className="flex items-center w-full gap-3">
					{/* subtle check icon */}
					<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-400 flex-shrink-0" viewBox="0 0 20 20"
						fill="currentColor"
						aria-hidden="true">
						<path fillRule="evenodd" d="M6.99486 7.00636C6.60433 7.39689 6.60433 8.03005 6.99486 8.42058L10.58 12.0057L6.99486 15.5909C6.60433 15.9814 6.60433 16.6146 6.99486 17.0051C7.38538 17.3956 8.01855 17.3956 8.40907 17.0051L11.9942 13.4199L15.5794 17.0051C15.9699 17.3956 16.6031 17.3956 16.9936 17.0051C17.3841 16.6146 17.3841 15.9814 16.9936 15.5909L13.4084 12.0057L16.9936 8.42059C17.3841 8.03007 17.3841 7.3969 16.9936 7.00638C16.603 6.61585 15.9699 6.61585 15.5794 7.00638L11.9942 10.5915L8.40907 7.00636C8.01855 6.61584 7.38538 6.61584 6.99486 7.00636Z" />
					</svg>
					<div className="text-left ">
						<div className="text-sm md:text-base font-semibold text-red-100">
							{message}
						</div>
					</div>
				</div>
			),
			className:
				"flex items-center justify-between gap-3 w-full max-w-[640px] bg-gradient-to-r from-slate-900/60 to-slate-800/40 border border-red-500/10 p-3 md:p-4 rounded-2xl shadow-lg backdrop-blur-md",
		});
	}, [toast]);


	const handleDrag = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(true);
	};
	const handleDrop = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);
		const file = e.dataTransfer.files[0];
		if (file && file.type === 'application/pdf') {
			if (pdfUrl) {
				URL.revokeObjectURL(pdfUrl); // Revoke previous URL if exists
			}
			setPdfFile(file);
			setPdfUrl(URL.createObjectURL(file));
		} else {
			showToastError('Please upload a valid PDF file');
		}
	};
	const handleDragLeave = () => {
		setDragActive(false);
	};

	useEffect(() => {
		return () => {
			if (pdfUrl) {
				URL.revokeObjectURL(pdfUrl);
			}
		};
	}, [pdfUrl]);


	// const downloadPdf = useCallback(async () => {
	// 	try {
	// 		if (exportApi) {
	// 			console.log("i am clicked")
	// 			exportApi.download();
	// 		}
	// 	}
	// 	catch (err) {
	// 		console.log(err)
	// 	}
	// }, [exportApi]);

	// Memoize plugins so they don't re-register on every render
	const plugins = useMemo(
		() => [
			createPluginRegistration(LoaderPluginPackage, {
				loadingOptions: {
					type: 'url',
					pdfFile: {
						id: 'pdf-document',
						name: pdfFile?.name || 'document.pdf',
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
			createPluginRegistration(ExportPluginPackage, {
				defaultFileName: `${pdfFile?.name ?? "annotated"}.pdf`,
			}),
		],
		[pdfUrl, pdfFile, scrollLayout] // Updated dependencies to include pdfFile for name
	);

	const { engine, isLoading, error } = usePdfiumEngine();


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

	return (
		<div className=" flex w-full justify-center items-center flex-col">
			<div className="w-full pr-0 lg:pr-4 md:mb-4 mb-0">
				<div className="min-h-[200px] rounded-lg p-4 pt-0">
					<div className="flex w-full flex-col justify-center items-center text-center">
						<div className="flex w-full min-w-fit px-3 md:px-12 py-6 justify-self-center flex-col">
							<div className="flex w-full flex-col  justify-between items-center pb-4 gap-4 md:flex-row">
								<h3 className="text-[30px] justify-center md:justify-normal flex w-full font-bold md:text-[38px] leading-[110%] text-p5">
									Upload PDF File
								</h3>
								<div className='w-full  flex justify-center items-center flex-row'>
									<DownloadComponent pdfUrl={pdfUrl} isLoading={isLoading} engine={engine} />
									<div className='flex justify-center items-center'>
										{isLoading || !engine && (
											<div className="w-6 ml-4 flex justify-self-center sm:w-8 h-6 sm:h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
										)}
									</div>
								</div>

							</div>

							<div className="w-full md:mt-3 flex flex-col gap-8">
								<div
									className={`flex-center ${dragActive ? "scale-105" : ""} min-w-72 md:min-w-full flex h-48 cursor-pointer flex-col gap-5 rounded-[16px] border border-dashed bg-[#7986AC] bg-opacity-20 border-p1 border-opacity-40 justify-center items-center text-white text-center w-full backdrop-blur-lg brightness-125 overflow-hidden shadow-[inset_0_0_10px_rgba(0,0,0,1)]`}
									onDragOver={handleDrag}
									onDragLeave={handleDragLeave}
									onDrop={handleDrop}
									onClick={() => document.getElementById('fileInput')?.click()}
								>
									<div className="rounded-[16px] bg-s0/40 p-5 shadow-sm shadow-purple-200/50">
										<input
											id="fileInput"
											type="file"
											accept=".pdf"
											className="hidden"
											onChange={handleFileChange}
										/>
										<Image
											src="/images/ButtonUtils/add.svg"
											alt="Add Image"
											width={24}
											height={24}
											className='brightness-125 '
										/>
									</div>
									<p className=" font-normal text-[16px] leading-[140%] brightness-75 text-p5">
										{pdfFile ? pdfFile.name : 'Click here to upload PDF'}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
				{pdfUrl && <div className="flex relative flex-col rounded-3xl over mt-12 overflow-hidden h-screen bg-black text-white font-mono">
					{isLoading || !engine ? (
						<div className="flex items-center justify-center h-screen bg-black">
							<div className="text-center bg-black/30 backdrop-blur-xl p-10 rounded-2xl border border-blue-500/20">
								<div className="animate-pulse rounded-full h-16 w-16 border-2 border-blue-500 mx-auto mb-5"></div>
								<p className="text-white text-lg font-semibold">Initializing Viewer</p>
								<p className="text-gray-500 text-sm mt-2">Stand by for cosmic launch</p>
							</div>
						</div>
					) : (
						<EmbedPDF engine={engine} plugins={plugins}>
							<div className="flex flex-1  h-auto overflow-hidden relative">
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
														icon: Palette,
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
														SIDEbars={SIDEbars}
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
												<Palette strokeWidth={2.5} size={25} className="text-white" />
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

									<div className="flex-1 overflow-hidden  backdrop-blur-sm relative z-10">
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
																margin: '8px',
																boxShadow: '0 0px 2px 0px rgba(200,200,200,0.8)',
																borderRadius: 16,
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
																			// width: '100%',
																			// height: '100%',
																			userSelect: 'text',
																			pointerEvents: 'auto',
																			// backgroundColor: '#fff',
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
																		selectionOutlineColor="#000000"
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
									<PageControls />
								</main>
							</div>
						</EmbedPDF>
					)}
				</div>}

			</div>
		</div>
	);
};




// Sidebar Registry
const SIDEbars = {
	[PdfAnnotationSubtype.FREETEXT]: { component: FreeTextSidebar, title: 'Text' },
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
	[PdfAnnotationSubtype.POLYGON]: { component: ShapeSidebar, title: 'Polygon' },
	[PdfAnnotationSubtype.STAMP]: { component: StampSidebar, title: 'Image' },
};

export default PDFAnnotator;