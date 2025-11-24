import React, { useCallback, useEffect, useMemo, useState } from 'react'
import LineEndingSelect from '../ui/Selectors/LineEndingSelect';
import StrokeStyleSelect from '../ui/Selectors/StrokeStyleSelect';
import Slider from '../ui/Slider';
import ColorSwatch from '../ui/ColorSwatch';
import { useAnnotationCapability } from '@embedpdf/plugin-annotation/react';
import { PdfAnnotationBorderStyle, PdfAnnotationLineEnding } from '@embedpdf/models';
import useDebounce from '../hooks/useDebounce';

const LineSidebar = ({
    selected,
    activeTool,
    colorPresets,
}) => {
    const { provides: annotation } = useAnnotationCapability();
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

    if (!annotation) return null;
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

export default LineSidebar