import React from 'react'
import GenericSelect from './GenericSelect';
import { PdfAnnotationLineEnding } from '@embedpdf/models';
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

export default LineEndingSelect