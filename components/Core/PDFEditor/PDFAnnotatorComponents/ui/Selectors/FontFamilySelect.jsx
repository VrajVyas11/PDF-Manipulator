import {
	STANDARD_FONT_FAMILIES,
	standardFontFamilyLabel,
} from '@embedpdf/models';
import GenericSelect from './GenericSelect';
const FontFamilySelect = ({ value, onChange }) => (
    <GenericSelect
        value={value}
        onChange={onChange}
        options={STANDARD_FONT_FAMILIES}
        getOptionKey={(f) => f}
        triggerClass="px-3 py-3 text-xs"
        renderValue={(v) => <span className="text-slate-200">{standardFontFamilyLabel(v)}</span>}
        renderOption={(f) => <div className="px-3 py-3 text-xs text-slate-200">{standardFontFamilyLabel(f)}</div>}
    />
);

export default FontFamilySelect