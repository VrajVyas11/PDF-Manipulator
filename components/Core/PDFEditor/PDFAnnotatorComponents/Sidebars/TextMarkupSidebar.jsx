import React, { useCallback, useEffect, useState } from 'react'
import Slider from '../ui/Slider';
import ColorSwatch from '../ui/ColorSwatch';
import useDebounce from '../hooks/useDebounce';
import { useAnnotationCapability } from '@embedpdf/plugin-annotation/react';
import { blendModeSelectOptions, PdfBlendMode } from '@embedpdf/models';

// TextMarkupSidebar Component (converted to React)
const TextMarkupSidebar = ({
    selected,
    activeTool,
    colorPresets,
}) => {
    const { provides: annotation } = useAnnotationCapability();
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

    if (!annotation) return null;
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

export default TextMarkupSidebar