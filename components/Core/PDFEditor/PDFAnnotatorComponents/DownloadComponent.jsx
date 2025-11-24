import Image from 'next/image';
import { useExportCapability } from '@embedpdf/plugin-export/react';

const DownloadComponent = ({ pdfUrl, isLoading, engine }) => {
  const { provides: exportApi } = useExportCapability();
  return (
    <button
      disabled={!pdfUrl || isLoading || !engine}
      onClick={() => exportApi && exportApi.download()}
      className="flex w-full justify-center md:justify-end disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl group"
    >
      <span className="relative px-4 md:px-8 flex justify-end items-center w-fit before:g7 g4 min-h-fit py-2 rounded-2xl before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-500 before:content-[''] group-hover:before:opacity-100 overflow-hidden">
        <Image
          src="/images/ButtonUtils/download.svg"
          alt="logo"
          width={28}
          height={28}
          className="brightness-200"
        />
        <span className="font-semibold text-16 flex gap-4 p-4 pr-0 text-p5">
          Download
        </span>
      </span>
    </button>
  );
};

export default DownloadComponent;