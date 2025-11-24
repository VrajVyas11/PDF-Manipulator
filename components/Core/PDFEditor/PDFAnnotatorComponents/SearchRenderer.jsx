import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, FileSearch, FileText } from 'lucide-react';
import { useSearchCapability } from '@embedpdf/plugin-search/react';
import { useScrollCapability } from '@embedpdf/plugin-scroll/react';
import { MatchFlag } from '@embedpdf/models';
import Checkbox from './ui/Checkbox';
import HitLine from './ui/HitLine';
import useDebounce from './hooks/useDebounce';

const SearchRenderer = () => {
	const inputRef = useRef(null);
	const [inputValue, setInputValue] = useState('');
	const [results, setResults] = useState([]);
	const [flags, setFlags] = useState([]);
	const [activeResultIndex, setActiveResultIndex] = useState(-1);
	const { provides: search } = useSearchCapability?.() ?? {};
	const { provides: scroll } = useScrollCapability?.() ?? {};
	const debouncedValue = useDebounce(inputValue, 120);

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	useEffect(() => {
		if (debouncedValue === '') {
			search?.stopSearch();
			setResults([]);
			setActiveResultIndex(-1);
		} else {
			const newResults = search?.searchAllPages(debouncedValue)?.state?.result?.results ?? [];
			setResults(newResults);
			setActiveResultIndex(newResults.length > 0 ? 0 : -1);
		}
	}, [debouncedValue, search]);

	const scrollToItem = useCallback(
		(index) => {
			const item = results[index];
			if (!item || index < 0) return;

			const minCoordinates = item.rects.reduce(
				(min, rect) => ({
					x: Math.min(min.x, rect.origin.x),
					y: Math.min(min.y, rect.origin.y),
				}),
				{ x: Infinity, y: Infinity }
			);

			scroll?.scrollToPage({
				pageNumber: item.pageIndex + 1,
				pageCoordinates: minCoordinates,
				center: true,
			});
		},
		[results, scroll]
	);

	useEffect(() => {
		if (activeResultIndex >= 0) scrollToItem(activeResultIndex);
	}, [activeResultIndex, scrollToItem]);

	const handleInputChange = (e) => setInputValue(e.target.value);

	const handleFlagChange = useCallback(
		(flag, checked) => {
			setFlags((prev) => {
				let newFlags = [...prev];
				if (checked) {
					if (!newFlags.includes(flag)) newFlags.push(flag);
				} else {
					newFlags = newFlags.filter((f) => f !== flag);
				}
				search?.setFlags(newFlags);
				return newFlags;
			});
		},
		[search]
	);

	const clearInput = useCallback(() => {
		setInputValue('');
		search?.stopSearch();
		setResults([]);
		setActiveResultIndex(-1);
		inputRef.current?.focus();
	}, [search]);

	function groupByPage(resultsArr) {
		return resultsArr.reduce((map, r, i) => {
			(map[r.pageIndex] ??= []).push({ hit: r, index: i });
			return map;
		}, {});
	}

	const grouped = groupByPage(results);
	const totalResults = results.length;

	// keyboard navigation: up/down + Enter to open + Esc to clear
	useEffect(() => {
		const onKey = (ev) => {
			if (ev.key === 'ArrowDown') {
				ev.preventDefault();
				if (results.length === 0) return;
				setActiveResultIndex((s) => (s < results.length - 1 ? s + 1 : s));
			} else if (ev.key === 'ArrowUp') {
				ev.preventDefault();
				setActiveResultIndex((s) => (s > 0 ? s - 1 : s));
			} else if (ev.key === 'Enter') {
				if (activeResultIndex >= 0 && results[activeResultIndex]) {
					ev.preventDefault();
					search?.goToResult(activeResultIndex);
				}
			} else if (ev.key === 'Escape') {
				clearInput();
			}
		};

		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [results, activeResultIndex, search, clearInput]);

	return (
		<div className="flex h-full w-full z-50 pointer-events-auto flex-col text-slate-200  border border-blue-500/10 overflow-hidden shadow-2xl  max-w-4xl mx-auto">
			<div className="py-6   border-b border-slate-800/50 flex-shrink-0">
				<div className="relative px-3">
					<div className="absolute inset-y-0 left-0 flex items-center pl-6 pointer-events-none">
						<Search className=' h-5 w-5' />
					</div>

					<input
						ref={inputRef}
						type="text"
						placeholder="Scan the void (↑/↓ navigate, Enter lock)"
						value={inputValue}
						onInput={handleInputChange}
						className="w-full rounded-xl  !shadow-[inset_0_0_5px_rgba(200,200,200,0.2)]  bg-slate-900/10 py-4 pl-12 pr-10 text-sm text-slate-200 placeholder-slate-400 focus:outline-none  transition-all duration-300 "
						aria-label="Scan"
					/>

					{inputValue ? (
						<button
							type="button"
							className="absolute inset-y-0 right-0 flex items-center pr-6 text-slate-400 hover:text-slate-200"
							onClick={clearInput}
							aria-label="Purge scan"
						>
							<svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
								<path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.416 0L10 8.586l4.293-4.293a1 1 0 111.416 1.416L11.416 10l4.293 4.293a1 1 0 01-1.416 1.416L10 11.416l-4.293 4.293a1 1 0 01-1.416-1.416L8.586 10 4.293 5.707a1 1 0 010-1.416z" clipRule="evenodd" />
							</svg>
						</button>
					) : null}
				</div>

				<div className="mt-5 flex flex-wrap items-center gap-5">
					<div className="flex items-center gap-2 mx-auto justify-center">
						<Checkbox
							label="Case lock"
							checked={flags.includes(MatchFlag.MatchCase)}
							onChange={(checked) => handleFlagChange(MatchFlag.MatchCase, checked)}
						/>
						<Checkbox
							label="Full echo"
							checked={flags.includes(MatchFlag.MatchWholeWord)}
							onChange={(checked) => handleFlagChange(MatchFlag.MatchWholeWord, checked)}
						/>
					</div>

					<div className="mx-auto text-sm text-blue-400/70 font-bold">{totalResults} Instances Found</div>
				</div>
			</div>

			<div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden  py-3 pl-2">
				<div
					className="flex flex-col gap-4 overflow-y-auto pr-2"
					style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgb(24, 78, 132,0.8) rgba(0, 0, 0, 0.1)', maxHeight: 'calc(100%)' }}
				>
					{totalResults === 0 ? (
						<div className="mt-8 flex justify-center items-center gap-4 text-center text-sm text-slate-400"><FileSearch className='w-5 h-5' />Found  Nothing</div>
					) : (
						Object.entries(grouped).map(([page, hits]) => (
							<div key={page} className="mt-2  relative first:mt-0">
								{/* <hr className=' w-24 top-0 rotate-90 -left-12  absolute border border-blue-400/30'/>  */}
								<div className='flex  w-fit pr-3 border-[1px] border-blue-400/20  mt-2 rounded-xl mb-3 gap-3 items-center'>

									<div className="inline-flex min-w-fit items-center gap-2 rounded-xl bg-slate-800/50 px-2 py-2 text-sm text-slate-300 border border-slate-700/30 backdrop-blur-xl">
										<FileText size={20} className='min-w-fit' />
										{/* <span className="inline-block  h-2 w-2 rounded-full bg-blue-400/80 shadow-lg shadow-blue-500/20" /> */}

									</div>
									<span className='whitespace-nowrap'>Page {Number(page) + 1}</span>
									{/* <hr className=' w-4 border-[1px] border-blue-400/30 border-dashed' /> */}
								</div>
								<div className="mt-3 flex flex-col  relative  pl-3 gap-3">
									<div className='absolute -mt-4 left-0 border-l-[2px] border-blue-400/30 h-full' />
									{hits.map(({ hit, index }) => (
										<div key={index} className=' relative'>
											<hr className='absolute border-blue-400/30  border-[1px] top-[52%] -left-3 w-4' />
											<HitLine
												key={index}
												hit={hit}
												active={index === activeResultIndex}
												onClick={() => {
													setActiveResultIndex(index);
													search?.goToResult(index);
												}}
											/>
										</div>
									))}
								</div>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
};

export default SearchRenderer;