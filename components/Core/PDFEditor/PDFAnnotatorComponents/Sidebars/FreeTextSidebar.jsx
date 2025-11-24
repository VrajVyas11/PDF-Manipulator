// FreeTextSidebar Component (converted to React)
import {
	PdfStandardFont,
	standardFontFamily,
	standardFontIsBold,
	standardFontIsItalic,
	makeStandardFont,
	PdfTextAlignment,
	PdfVerticalAlignment,
} from '@embedpdf/models';
import {
	Bold,
	Italic,
	AlignLeft,
	AlignCenter,
	AlignRight,
	AlignJustify,
	AlignVerticalJustifyCenter,
	AlignVerticalJustifyStart,
	AlignVerticalJustifyEnd,

} from 'lucide-react';

import { useAnnotationCapability } from "@embedpdf/plugin-annotation/react";
import ColorSwatch from "../ui/ColorSwatch";
import { useCallback, useEffect, useState } from 'react';
import useDebounce from '../hooks/useDebounce';
import FontFamilySelect from '../ui/Selectors/FontFamilySelect';
import FontSizeInputSelect from '../ui/Selectors/FontSizeInputSelect';
import Slider from '../ui/Slider';
const FreeTextSidebar = ({
	selected,
	activeTool,
	colorPresets,
}) => {
	const { provides: annotation } = useAnnotationCapability();
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
	if (!annotation) return null;
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
						className={`h-11 w-11 flex items-center justify-center rounded-xl border border-slate-700/30 px-2 py-2 text-sm font-bold backdrop-blur-xl shadow-lg transition-all duration-300 ${bold ? 'bg-blue-900/40 text-blue-200 shadow-blue-500/20' : 'bg-slate-800/50 text-slate-300'} disabled:opacity-40 hover:scale-105`}
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
						className={`h-11 w-11 flex items-center justify-center rounded-xl border border-slate-700/30 px-2 py-2 text-sm italic backdrop-blur-xl shadow-lg transition-all duration-300 ${italic ? 'bg-blue-900/40 text-blue-200 shadow-blue-500/20' : 'bg-slate-800/50 text-slate-300'} disabled:opacity-40 hover:scale-105`}
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
						className={`h-11 flex items-center justify-center w-11 rounded-xl border border-slate-700/30 px-2 py-2 text-sm backdrop-blur-xl shadow-lg transition-all duration-300 ${verticalAlign === PdfVerticalAlignment.Top ? 'bg-blue-900/40 text-blue-200 shadow-blue-500/20' : 'bg-slate-800/50 text-slate-300'} hover:scale-105`}
					>
						<AlignVerticalJustifyStart size={18} />
					</button>
					<button
						type="button"
						title="Nexus"
						onClick={() => changeVerticalAlign(PdfVerticalAlignment.Middle)}
						className={`h-11 w-11 flex items-center justify-center rounded-xl border border-slate-700/30 px-2 py-2 text-sm backdrop-blur-xl shadow-lg transition-all duration-300 ${verticalAlign === PdfVerticalAlignment.Middle ? 'bg-blue-900/40 text-blue-200 shadow-blue-500/20' : 'bg-slate-800/50 text-slate-300'} hover:scale-105`}
					>
						<AlignVerticalJustifyCenter size={18} />
					</button>
					<button
						type="button"
						title="Abyss"
						onClick={() => changeVerticalAlign(PdfVerticalAlignment.Bottom)}
						className={`h-11 w-11 flex items-center justify-center rounded-xl border border-slate-700/30 px-2 py-2 text-sm backdrop-blur-xl shadow-lg transition-all duration-300 ${verticalAlign === PdfVerticalAlignment.Bottom ? 'bg-blue-900/40 text-blue-200 shadow-blue-500/20' : 'bg-slate-800/50 text-slate-300'} hover:scale-105`}
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

export default FreeTextSidebar