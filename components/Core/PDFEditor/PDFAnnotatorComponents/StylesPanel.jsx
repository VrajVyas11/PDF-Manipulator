import React from 'react'
import EmptyState from './EmptyState';
import { useAnnotationCapability } from '@embedpdf/plugin-annotation/react';
const StylesPanel = ({ selectedAnnotation, annotationMode,SIDEbars }) => {
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


export default StylesPanel