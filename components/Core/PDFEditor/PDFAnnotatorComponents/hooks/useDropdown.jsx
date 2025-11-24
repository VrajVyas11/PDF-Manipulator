import { useEffect, useRef, useState } from "react";

const useDropdown = () => {
	const [open, setOpen] = useState(false);
	const rootRef = useRef(null);
	const selectedItemRef = useRef(null);

	useEffect(() => {
		if (!open) return;
		const onDocClick = (e) => {
			if (rootRef.current && !rootRef.current.contains(e.target)) {
				setOpen(false);
			}
		};
		document.addEventListener('click', onDocClick);
		return () => document.removeEventListener('click', onDocClick);
	}, [open]);

	useEffect(() => {
		if (open && selectedItemRef.current) {
			selectedItemRef.current.scrollIntoView({
				block: 'center',
				inline: 'start',
			});
		}
	}, [open]);

	return { open, setOpen, rootRef, selectedItemRef };
};

export default useDropdown