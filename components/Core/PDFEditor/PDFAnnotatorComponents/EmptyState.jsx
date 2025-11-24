import { Palette } from 'lucide-react';

const EmptyState = () => (
	<div className="flex flex-col items-center gap-5 p-8 text-slate-400/60  border-b border-slate-700/30">
		<Palette size={48} className="text-slate-400/60" />
		<div className="max-w-[200px] text-center text-sm text-slate-400/60">
			Invoke an ether or select a fragment to forge styles
		</div>
	</div>
);

export default EmptyState