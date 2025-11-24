import useDropdown from '../../hooks/useDropdown';

const FontSizeInputSelect = ({ value, onChange, options = [8, 9, 10, 11, 12, 16, 18, 24, 36, 48, 72] }) => {
	const { open, setOpen, rootRef, selectedItemRef } = useDropdown();

	const handleInput = (e) => {
		const n = parseInt(e.target.value, 10);
		if (Number.isFinite(n) && n > 0) onChange(n);
	};

	return (
		<div ref={rootRef} className="relative w-full">
			<input
				type="number"
				min="1"
				className="w-full rounded-xl border border-slate-700/50 bg-slate-800/50 px-3 py-3 pr-8 text-xs text-slate-200 backdrop-blur-xl focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400/40"
				value={value}
				onInput={handleInput}
				onClick={() => setOpen(true)}
			/>
			<button
				type="button"
				className="absolute inset-y-0 right-0 flex items-center pr-2 text-slate-400"
				onClick={() => setOpen(!open)}
				tabIndex={-1}
			>
				<svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
					<path
						fillRule="evenodd"
						d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
						clipRule="evenodd"
					/>
				</svg>
			</button>

			{open && (
				<div className="absolute z-10 mt-2 max-h-40 w-full overflow-y-auto rounded-xl border bg-slate-800/50 shadow-2xl border-slate-700/30 backdrop-blur-2xl">
					{options.map((sz) => {
						const isSelected = sz === value;
						return (
							<button
								ref={isSelected ? selectedItemRef : null}
								key={sz}
								className={`block text-xs w-full px-3 py-3 text-left  hover:bg-slate-700/30 text-slate-200 ${isSelected ? 'bg-blue-900/30' : ''}`}
								onClick={() => {
									onChange(sz);
									setOpen(false);
								}}
							>
								{sz}px
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
};


export default FontSizeInputSelect