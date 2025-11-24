import useDropdown from "../../hooks/useDropdown";
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
                                className={`block w-full text-ellipsis truncate rounded-lg text-left hover:bg-slate-700/30 text-slate-200 transition-all duration-300 ${isSelected ? 'bg-blue-900/30' : ''}`}
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

export default GenericSelect