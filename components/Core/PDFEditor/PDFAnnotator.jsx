/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
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
	import { SearchPluginPackage, useSearch } from
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
	  Minus,
	  Underline,
	} from 'lucide-react';
	
	const PDFAnnotator = () => {
	  const [pdfUrl, setPdfUrl] = useState(
	    'https://snippet.embedpdf.com/ebook.pdf'
	  );
	  const [showSidebar, setShowSidebar] = useState(true);
	  const [showThumbnails, setShowThumbnails] = useState(true);
	  const [searchQuery, setSearchQuery] = useState('');
	  const [showSearch, setShowSearch] = useState(false);
	  const [annotationMode, setAnnotationMode] = useState('select');
	  const [urlInput, setUrlInput] = useState(pdfUrl);
	  const [showUrlDialog, setShowUrlDialog] = useState(false);
	
	  const fileInputRef = useRef(null); // upload PDF
	  const annotationApiRef = useRef(null);
	  const [ ,setSelectedAnnotation] = useState(null);
	
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
	      <div className="flex items-center justify-center h-screen bg-gray-950 text-red-300">
	        <div className="text-center p-8 bg-gray-900 rounded-xl border border-red-600/30 shadow-xl">
	          <p className="text-xl mb-2 font-bold">Error loading PDF engine</p>
	          <p className="text-sm text-gray-400">{error.message}</p>
	          <button
	            onClick={() => window.location.reload()}
	            className="mt-4 px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200 font-medium"
	          >
	            Reload Page
	          </button>
	        </div>
	      </div>
	    );
	  }
	
	  if (isLoading || !engine) {
	    return (
	      <div className="flex items-center justify-center h-screen bg-gray-950">
	        <div className="text-center">
	          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
	          <p className="text-gray-300 text-lg font-medium">Loading PDF Engine...</p>
	          <p className="text-gray-500 text-sm mt-2">
	            Please wait while we initialize the viewer
	          </p>
	        </div>
	      </div>
	    );
	  }
	
	  return (
	    <div className="flex flex-col h-screen bg-gray-950 text-gray-100 font-sans">
	      <style>{`
	        .custom-sticky-note {
	          background: #fff9c4;
	          border: 1px solid rgba(0,0,0,0.12);
	          box-shadow: 0 8px 22px rgba(0,0,0,0.35);
	          transform: rotate(-1.5deg);
	          padding: 8px;
	          border-radius: 6px;
	          color: #222;
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
	
	      <div className="flex items-center justify-between bg-gray-900 border-b border-gray-800/50 px-6 py-3 shadow">
	        <div className="flex items-center space-x-4">
	          <button
	            onClick={() => setShowSidebar(!showSidebar)}
	            className="p-2 hover:bg-gray-800/50 rounded-lg transition-all duration-200"
	            title="Toggle Sidebar"
	          >
	            <Menu size={20} className="text-gray-300" />
	          </button>
	          <div className="flex items-center space-x-2">
	            <File size={20} className="text-cyan-400" />
	            <span className="font-bold text-sm tracking-tight">PDF Annotator Pro</span>
	            <span className="text-xs text-gray-500 ml-2">Dark Mode</span>
	          </div>
	        </div>
	
	        <div className="flex items-center space-x-2">
	          <button
	            onClick={() => fileInputRef.current?.click()}
	            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-sm transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg font-medium"
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
	            className="px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg text-sm transition-all duration-200 flex items-center space-x-2"
	            title="Load from URL"
	          >
	            <Hash size={16} />
	            <span>Load URL</span>
	          </button>
	        </div>
	      </div>
	
	      {showUrlDialog && (
	        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-gray-900 border border-gray-700/50 px-6 py-4 rounded-xl z-50 max-w-md w-full mx-4 shadow-2xl backdrop-blur-sm">
	          <div className="flex items-center space-x-3">
	            <input
	              type="text"
	              value={urlInput}
	              onChange={(e) => setUrlInput(e.target.value)}
	              placeholder="https://example.com/doc.pdf"
	              className="flex-1 px-4 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg focus:outline-none focus:border-cyan-500/50 text-sm transition-all duration-200"
	              onKeyPress={(e) => e.key === 'Enter' && handleUrlLoad()}
	            />
	            <button
	              onClick={handleUrlLoad}
	              className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-sm transition-all duration-200 font-medium shadow-md"
	            >
	              Load
	            </button>
	            <button
	              onClick={() => setShowUrlDialog(false)}
	              className="p-2 hover:bg-gray-800/50 rounded-lg transition-all duration-200"
	            >
	              <X size={18} className="text-gray-400" />
	            </button>
	          </div>
	        </div>
	      )}
	
	      <EmbedPDF engine={engine} plugins={plugins}>
	        <div className="flex flex-1 overflow-hidden">
	          {showSidebar && (
	            <div className="w-64 bg-gray-900 border-r border-gray-800/50 flex flex-col overflow-hidden shadow-lg">
	              <div className="flex border-b border-gray-800/50">
	                <button
	                  onClick={() => setShowThumbnails(true)}
	                  className={`flex-1 px-4 py-4 text-sm font-semibold transition-all duration-200 ${showThumbnails ? 'bg-gray-800/50 text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400 hover:bg-gray-800/30'}`}
	                >
	                  <Grid size={16} className="inline mr-2" />
	                  Thumbnails
	                </button>
	              </div>
	
	              <div className="flex-1 overflow-y-auto p-3">
	                <div
	                  className={
	                    showThumbnails ? 'thumbnails-pane-visible' : 'thumbnails-pane-hidden'
	                  }
	                  style={{ minHeight: 40 }}
	                >
	                  <ThumbnailsPanel />
	                </div>
	              </div>
	            </div>
	          )}
	
	          <div className="flex-1 flex flex-col overflow-hidden">
	            <div className="bg-gray-900 border-b border-gray-800/50 px-6 py-3 shadow">
	              <MainToolbar
	                showSearch={showSearch}
	                setShowSearch={setShowSearch}
	                searchQuery={searchQuery}
	                setSearchQuery={setSearchQuery}
	                annotationMode={annotationMode}
	                setAnnotationMode={setAnnotationMode}
	                annotationApiRef={annotationApiRef}
	                setSelectedAnnotation={setSelectedAnnotation}
	              />
	            </div>
	
	            {showSearch && (
	              <div className="px-6 py-3 border-b border-gray-800/50 bg-gray-900/50">
	                <SearchBar
	                  searchQuery={searchQuery}
	                  setSearchQuery={setSearchQuery}
	                />
	              </div>
	            )}
	
	            <div className="flex-1 overflow-hidden bg-gray-950">
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
	                              selectionOutlineColor="#2EA3FF"
	                              // custom resize handles can be passed here if desired
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
	            className={`border rounded-xl overflow-hidden hover:border-cyan-400/50 transition-all duration-200 bg-gray-800/50 shadow-md hover:shadow-lg ${isActive ? 'border-cyan-400 ring-2 ring-cyan-400/20' : 'border-gray-700/50'}`}
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
	
	// Contextual Toolbar (full controls for selected annotation)
	const ContextualToolbar = ({ annotation, annotationApi, onClose }) => {
	  if (!annotation || !annotation.object) return null;
	  const obj = annotation.object;
	  const pageIndex = obj.pageIndex ?? annotation.pageIndex ?? 0;
	  const id = obj.id ?? annotation.id;
	  const typeRaw = obj.type ?? obj.subtype ?? '';
	  const type = ('' + typeRaw).toLowerCase();
	
	  // safe updater
	  const update = useCallback(
	    async (patch) => {
	      if (!annotationApi || pageIndex == null || !id) return;
	      try {
	        if (annotationApi.updateAnnotation) {
	          await annotationApi.updateAnnotation(pageIndex, id, patch);
	          return;
	        }
	        if (annotationApi.update) {
	          await annotationApi.update({ pageIndex, id, ...patch });
	          return;
	        }
	      } catch (err) {
	        console.warn('annotation update failed', err);
	      }
	    },
	    [annotationApi, pageIndex, id]
	  );
	
	  const isText = type.includes('freetext') || type.includes('free text') || type.includes('text');
	  const isShape = ['circle', 'square', 'rect', 'rectangle', 'polygon'].some(t => type.includes(t));
	  const isLine = ['line', 'arrow', 'polyline'].some(t => type.includes(t));
	  const isInk = type.includes('ink');
	
	  const colorVal = isText ? (obj.fontColor || obj.color || '#000000') : (obj.strokeColor || obj.color || '#000000');
	  const fillVal = isShape ? (obj.color || '#000000') : null;
	  const opacityVal = typeof obj.opacity === 'number' ? obj.opacity : 1;
	  const strokeVal = obj.strokeWidth ?? 1;
	  const fontSizeVal = obj.fontSize ?? 12;
	  const fontFamilyVal = obj.fontFamily ?? 'Helvetica';
	  const bgVal = obj.backgroundColor ?? '#ffffff';
	  const textAlignVal = obj.textAlign ?? 'left';
	
	  // position nudges for freetext
	  const nudge = async (dx, dy) => {
	    const rect = obj.rect ?? obj.bounds ?? obj.boundingBox ?? obj.rectangle;
	    if (!rect) return;
	    if (Array.isArray(rect) && rect.length >= 4) {
	      const newRect = [rect[0] + dx, rect[1] + dy, rect[2] + dx, rect[3] + dy];
	      await update({ rect: newRect });
	      return;
	    }
	    if (rect.x != null && rect.y != null) {
	      const newRect = { ...rect, x: rect.x + dx, y: rect.y + dy };
	      await update({ rect: newRect });
	      return;
	    }
	  };
	
	  return (
	    <div className="fixed bottom-6 right-6 bg-gray-900/95 border border-gray-700/50 rounded-xl p-4 shadow-2xl backdrop-blur-md z-50 w-96">
	      <div className="flex items-center justify-between mb-3">
	        <div className="flex items-center space-x-2">
	          <Type size={16} className="text-cyan-300" />
	          <div>
	            <div className="text-sm font-semibold text-gray-200">{(type || 'Annotation').toUpperCase()}</div>
	            <div className="text-xs text-gray-400">Edit properties</div>
	          </div>
	        </div>
	        <div className="flex items-center space-x-2">
	          <button onClick={onClose} className="p-1 rounded hover:bg-gray-800/50">
	            <X size={16} className="text-gray-300" />
	          </button>
	        </div>
	      </div>
	
	      <div className="space-y-3">
	        {/* Color / Fill / Opacity */}
	        <div className="grid grid-cols-2 gap-3">
	          <div>
	            <label className="block text-xs text-gray-400 mb-1">Color</label>
	            <input type="color" value={colorVal} onChange={(e) => update(isText ? { fontColor: e.target.value } : { strokeColor: e.target.value, color: e.target.value })} className="w-full h-9 rounded cursor-pointer" />
	          </div>
	          {isShape && (
	            <div>
	              <label className="block text-xs text-gray-400 mb-1">Fill</label>
	              <input type="color" value={fillVal} onChange={(e) => update({ color: e.target.value })} className="w-full h-9 rounded cursor-pointer" />
	            </div>
	          )}
	        </div>
	
	        <div className="grid grid-cols-2 gap-3">
	          <div>
	            <label className="block text-xs text-gray-400 mb-1">Opacity</label>
	            <input type="range" min="0" max="1" step="0.05" value={opacityVal} onChange={(e) => update({ opacity: parseFloat(e.target.value) })} className="w-full" />
	            <div className="text-xs text-gray-500 mt-1">{Math.round(opacityVal * 100)}%</div>
	          </div>
	          {(isShape || isLine || isInk) && (
	            <div>
	              <label className="block text-xs text-gray-400 mb-1">Thickness</label>
	              <input type="range" min="1" max="30" step="1" value={strokeVal} onChange={(e) => update({ strokeWidth: parseInt(e.target.value, 10) || 1 })} className="w-full" />
	              <div className="text-xs text-gray-500 mt-1">{strokeVal}px</div>
	            </div>
	          )}
	        </div>
	
	        {isText && (
	          <>
	            <div className="grid grid-cols-3 gap-3">
	              <div>
	                <label className="block text-xs text-gray-400 mb-1">Font size</label>
	                <input type="number" min="6" max="200" value={fontSizeVal} onChange={(e) => update({ fontSize: parseInt(e.target.value, 10) || 12 })} className="w-full px-2 py-1 bg-gray-800/50 border border-gray-700 rounded text-sm" />
	              </div>
	              <div>
	                <label className="block text-xs text-gray-400 mb-1">Font family</label>
	                <select value={fontFamilyVal} onChange={(e) => update({ fontFamily: e.target.value })} className="w-full px-2 py-1 bg-gray-800/50 border border-gray-700 rounded text-sm">
	                  <option>Helvetica</option>
	                  <option>Arial</option>
	                  <option>Times</option>
	                  <option>Courier</option>
	                  <option>Verdana</option>
	                </select>
	              </div>
	              <div>
	                <label className="block text-xs text-gray-400 mb-1">Background</label>
	                <input type="color" value={bgVal} onChange={(e) => update({ backgroundColor: e.target.value })} className="w-full h-9 rounded cursor-pointer" />
	              </div>
	            </div>
	
	            <div className="flex items-center justify-between mt-2">
	              <div className="flex items-center space-x-1">
	                <button onClick={() => update({ fontFamily: (fontFamilyVal || '').includes('Bold') ? 'Helvetica' : `${fontFamilyVal}-Bold` })} className={`p-2 rounded ${((fontFamilyVal || '').toLowerCase().includes('bold')) ? 'bg-cyan-600 text-white' : 'hover:bg-gray-800/50'}`} title="Bold">
	                  <Bold size={14} />
	                </button>
	                <button onClick={() => update({ fontFamily: (fontFamilyVal || '').toLowerCase().includes('italic') ? 'Helvetica' : `${fontFamilyVal}-Oblique` })} className={`p-2 rounded ${((fontFamilyVal || '').toLowerCase().includes('italic') || (fontFamilyVal || '').toLowerCase().includes('oblique')) ? 'bg-cyan-600 text-white' : 'hover:bg-gray-800/50'}`} title="Italic">
	                  <Italic size={14} />
	                </button>
	              </div>
	
	              <div className="flex items-center space-x-1">
	                <button onClick={() => update({ textAlign: 'left' })} className={`p-2 rounded ${textAlignVal === 'left' ? 'bg-cyan-600 text-white' : 'hover:bg-gray-800/50'}`} title="Left"><AlignLeft size={14} /></button>
	                <button onClick={() => update({ textAlign: 'center' })} className={`p-2 rounded ${textAlignVal === 'center' ? 'bg-cyan-600 text-white' : 'hover:bg-gray-800/50'}`} title="Center"><AlignCenter size={14} /></button>
	                <button onClick={() => update({ textAlign: 'right' })} className={`p-2 rounded ${textAlignVal === 'right' ? 'bg-cyan-600 text-white' : 'hover:bg-gray-800/50'}`} title="Right"><AlignRight size={14} /></button>
	                <button onClick={() => update({ textAlign: 'justify' })} className={`p-2 rounded ${textAlignVal === 'justify' ? 'bg-cyan-600 text-white' : 'hover:bg-gray-800/50'}`} title="Justify"><AlignJustify size={14} /></button>
	              </div>
	            </div>
	
	            <div className="mt-3">
	              <label className="block text-xs text-gray-400 mb-1">Position (nudge)</label>
	              <div className="flex items-center justify-between">
	                <div className="grid grid-cols-3 gap-2 w-full">
	                  <div />
	                  <button onClick={() => nudge(0, -4)} className="p-2 bg-gray-800/50 rounded hover:bg-gray-800/70"><ChevronUp size={14} /></button>
	                  <div />
	                  <button onClick={() => nudge(-4, 0)} className="p-2 bg-gray-800/50 rounded hover:bg-gray-800/70"><Minus size={14} /></button>
	                  <div />
	                  <button onClick={() => nudge(4, 0)} className="p-2 bg-gray-800/50 rounded hover:bg-gray-800/70"><ArrowUpRight size={14} style={{ transform: 'rotate(-45deg)' }} /></button>
	                  <div />
	                  <button onClick={() => nudge(0, 4)} className="p-2 bg-gray-800/50 rounded hover:bg-gray-800/70"><ChevronDown size={14} /></button>
	                  <div />
	                  <div />
	                </div>
	              </div>
	            </div>
	          </>
	        )}
	
	        <div className="flex items-center justify-end space-x-2 mt-2">
	          <button onClick={() => update({})} className="px-3 py-1 rounded bg-gray-800/50 hover:bg-gray-800/70 text-sm">Apply</button>
	        </div>
	      </div>
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
	}) => {
	  const { state: scrollState, provides: scrollApi } = useScroll();
	  const { provides: zoomApi, state: zoomState } = useZoom();
	  const { provides: rotateApi } = useRotate();
	  const { provides: printApi } = usePrintCapability();
	  const { provides: panApi } = usePan();
	  const { provides: annotationApi } = useAnnotationCapability();
	  const { provides: historyApi } = useHistoryCapability();
	
	  const [selected, setSelected] = useState(null);
	  const [canUndoNow, setCanUndoNow] = useState(false);
	  const [canRedoNow, setCanRedoNow] = useState(false);
	
	  useEffect(() => {
	    if (annotationApi) {
	      annotationApiRef.current = annotationApi;
	    }
	  }, [annotationApi]);
	
	  // selection listener
	  useEffect(() => {
	    if (!annotationApi) return;
	    const unsub = annotationApi.onStateChange?.((state) => {
	      if (state?.selectedUid) {
	        const sel = annotationApi.getSelectedAnnotation?.();
	        setSelected(sel);
	        setSelectedAnnotation(sel);
	      } else {
	        setSelected(null);
	        setSelectedAnnotation(null);
	      }
	    });
	    return () => {
	      try { if(unsub) unsub(); } catch {}
	    };
	  }, [annotationApi]);
	
	  // undo/redo capability checks
	  useEffect(() => {
	    let mounted = true;
	    const check = async () => {
	      try {
	        if (historyApi) {
	          const u = typeof historyApi.canUndo === 'function' ? await historyApi.canUndo() : !!historyApi.canUndo;
	          const r = typeof historyApi.canRedo === 'function' ? await historyApi.canRedo() : !!historyApi.canRedo;
	          if (mounted) {
	            setCanUndoNow(!!u);
	            setCanRedoNow(!!r);
	          }
	        } else {
	          setCanUndoNow(false);
	          setCanRedoNow(false);
	        }
	      } catch {
	        setCanUndoNow(false);
	        setCanRedoNow(false);
	      }
	    };
	    check();
	    // subscribe if historyApi provides onStateChange or similar
	    const unsubHist = historyApi?.onStateChange?.(check);
	    return () => {
	      mounted = false;
	      try { if(unsubHist)  unsubHist(); } catch {}
	    };
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
	              backgroundColor: '#fff9c4',
	              borderColor: 'rgba(0,0,0,0.12)',
	            });
	          }
	        } catch {}
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
	          } catch {}
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
	      try { api.on('annotationAdded', handler); } catch {}
	      return () => { try { if(api.off) api.off('annotationAdded', handler); } catch {} };
	    }
	  }, [annotationApi]);
	
	  const totalPages = scrollState?.totalPages || 0;
	  const currentPage = scrollState?.currentPage || 1;
	
	  const modeMap = {
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
	  };
	
	  useEffect(() => {
	    if (annotationMode === 'pan') {
	      panApi?.enablePan?.();
	      annotationApi?.setActiveTool?.(null);
	    } else {
	      panApi?.disablePan?.();
	      if (annotationMode === 'select') {
	        annotationApi?.setActiveTool?.(null);
	      } else {
	        const toolId = modeMap[annotationMode];
	        if (toolId) {
	          annotationApi?.setActiveTool?.(toolId);
	        }
	      }
	    }
	  }, [annotationMode, panApi, annotationApi]);
	
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
	          <div className="flex items-center space-x-1 bg-gray-800/50 rounded-lg px-3 py-1.5 shadow-inner">
	            <input
	              type="number"
	              value={currentPage}
	              min={1}
	              max={totalPages}
	              onChange={handlePageChange}
	              className="w-14 bg-transparent text-center text-sm focus:outline-none text-cyan-400 font-mono"
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
	
	        <div className="flex items-center space-x-1 bg-gray-800/50 rounded-xl p-1.5 shadow-inner overflow-x-auto">
	          <button
	            onClick={() => setAnnotationMode('select')}
	            className={`p-2 rounded-lg transition-all duration-200 flex-shrink-0 ${annotationMode === 'select' ? 'bg-cyan-600/20 text-cyan-300 shadow-md' : 'hover:bg-gray-700/30 text-gray-300'}`}
	            title="Select Tool"
	          >
	            <MousePointer size={16} />
	          </button>
	          <button
	            onClick={() => setAnnotationMode('pan')}
	            className={`p-2 rounded-lg transition-all duration-200 flex-shrink-0 ${annotationMode === 'pan' ? 'bg-cyan-600/20 text-cyan-300 shadow-md' : 'hover:bg-gray-700/30 text-gray-300'}`}
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
	            onClick={() => setAnnotationMode('line')}
	            className={`p-2 rounded-lg transition-all duration-200 flex-shrink-0 ${annotationMode === 'line' ? 'bg-gray-600/20 text-gray-300 shadow-md' : 'hover:bg-gray-700/30 text-gray-300'}`}
	            title="Line"
	          >
	            <Minus size={16} />
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
	            className={`p-2 rounded-lg transition-all duration-200 flex-shrink-0 ${annotationMode === 'freeText' ? 'bg-cyan-600/20 text-cyan-300 shadow-md' : 'hover:bg-gray-700/30 text-gray-300'}`}
	            title="Add Text/Free Text"
	          >
	            <Type size={16} />
	          </button>
	          <button
	            onClick={() => setAnnotationMode('stamp')}
	            className={`p-2 rounded-lg transition-all duration-200 flex-shrink-0 hover:bg-gray-700/30 text-gray-300 ${annotationMode === 'stamp' ? 'bg-cyan-600/20 text-cyan-300 shadow-md' : ''}`}
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
	            disabled={!canUndoNow}
	            className={`p-2 rounded-lg transition-all duration-200 flex-shrink-0 shadow-md ${canUndoNow ? 'hover:bg-gray-700/30 text-gray-300' : 'opacity-40 cursor-not-allowed text-gray-600'}`}
	            title="Undo"
	          >
	            <Undo size={16} />
	          </button>
	          <button
	            onClick={handleRedo}
	            disabled={!canRedoNow}
	            className={`p-2 rounded-lg transition-all duration-200 flex-shrink-0 shadow-md ${canRedoNow ? 'hover:bg-gray-700/30 text-gray-300' : 'opacity-40 cursor-not-allowed text-gray-600'}`}
	            title="Redo"
	          >
	            <Redo size={16} />
	          </button>
	        </div>
	
	        <div className="flex items-center space-x-2">
	          <button
	            onClick={() => setShowSearch(!showSearch)}
	            className={`p-2 rounded-lg transition-all duration-200 ${showSearch ? 'bg-cyan-600/20 text-cyan-300 shadow-md' : 'hover:bg-gray-700/30 text-gray-300'}`}
	            title="Search in Document"
	          >
	            <Search size={18} />
	          </button>
	
	          <div className="flex items-center space-x-1 bg-gray-800/50 rounded-lg shadow-inner">
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
	              className="bg-transparent px-3 py-1.5 text-sm focus:outline-none cursor-pointer text-cyan-400 font-mono"
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
	
	      {selected && (
	        <ContextualToolbar
	          annotation={selected}
	          annotationApi={annotationApiRef.current || annotationApi}
	          onClose={() => {
	            try { setSelected(null) } catch {}
	          }}
	        />
	      )}
	    </>
	  );
	};
	
	// Search Bar Component
	const SearchBar = ({ searchQuery, setSearchQuery }) => {
	  const searchPlugin = useSearch();
	
	  const search = searchPlugin?.search ?? (() => {});
	  const results = searchPlugin?.results ?? [];
	  const currentMatchIndex = searchPlugin?.currentMatchIndex ?? 0;
	  const goToNextMatch = searchPlugin?.goToNextMatch ?? (() => {});
	  const goToPreviousMatch = searchPlugin?.goToPreviousMatch ?? (() => {});
	
	  const handleSearch = (query) => {
	    setSearchQuery(query);
	    if (query.trim()) {
	      search(query);
	    } else {
	      search('');
	    }
	  };
	
	  if (!searchPlugin) return null;
	
	  return (
	    <div className="flex items-center space-x-3 max-w-2xl mx-auto">
	      <input
	        type="text"
	        value={searchQuery}
	        onChange={(e) => handleSearch(e.target.value)}
	        placeholder="Search in document..."
	        className="flex-1 px-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl focus:outline-none focus:border-cyan-500/50 text-sm transition-all duration-200 shadow-inner"
	      />
	      {results.length > 0 ? (
	        <>
	          <span className="text-xs text-gray-500 whitespace-nowrap font-mono">
	            {currentMatchIndex + 1} / {results.length}
	          </span>
	          <div className="flex space-x-1">
	            <button
	              onClick={goToPreviousMatch}
	              className="p-2 hover:bg-gray-700/30 rounded-lg transition-all duration-200"
	              title="Previous Match"
	            >
	              <ChevronUp size={14} className="text-gray-400" />
	            </button>
	            <button
	              onClick={goToNextMatch}
	              className="p-2 hover:bg-gray-700/30 rounded-lg transition-all duration-200"
	              title="Next Match"
	            >
	              <ChevronDown size={14} className="text-gray-400" />
	            </button>
	          </div>
	        </>
	      ) : searchQuery.trim() ? (
	        <span className="text-xs text-gray-600 whitespace-nowrap font-medium">No results</span>
	      ) : null}
	      <button
	        onClick={() => handleSearch('')}
	        className="p-2 hover:bg-gray-700/30 rounded-lg transition-all duration-200"
	        title="Clear Search"
	      >
	        <X size={14} className="text-gray-400" />
	      </button>
	    </div>
	  );
	};
	
	export default PDFAnnotator;