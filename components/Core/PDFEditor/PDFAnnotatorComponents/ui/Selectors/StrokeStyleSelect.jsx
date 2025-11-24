import React from 'react'
import GenericSelect from './GenericSelect';
import { PdfAnnotationBorderStyle } from '@embedpdf/models';
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

export default StrokeStyleSelect