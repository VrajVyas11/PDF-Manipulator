const Slider = ({
	value,
	min = 0,
	max = 1,
	step = 0.1,
	onChange,
}) => (
	<input
		type="range"
		className="range-sm mb-3 h-3.5  w-full cursor-pointer appearance-none rounded-full bg-slate-700/50"
		value={value}
		min={min}
		max={max}
		step={step}
		onInput={(e) => onChange(parseFloat(e.target.value))}
		style={{
			background: `linear-gradient(to right, #0055FF80 ${((value - min) / (max - min)) * 100}%, #284247 ${((value - min) / (max - min)) * 100}%)`,
		}}
	/>
);

export default Slider