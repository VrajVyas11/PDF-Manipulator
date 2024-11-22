import downloadPdf from "../utils/downloadPdf";
const Pagination = ({ pdfData, currentPage, setCurrentPage, editorRef }) => {
  return (
    <>
      {pdfData && pdfData.Pages && (
        <div className="flex  flex-col w-full px-6 justify-between items-center mt-4">
          <div className="flex flex-col sm:flex-row w-full justify-between items-center mt-4">
            <button
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="px-6 py-3 w-full sm:w-fit sm:mr-2 mt-4 bg-blue-600 text-white font-mono shadow-lg tracking-wide rounded-lg hover:bg-blue-700 transition duration-300 font-extrabold ease-in-out disabled:opacity-50"
            >
              Previous Page
            </button>
            <span className="text-lg text-gray-300 mt-4 sm:mt-0">{`Page ${currentPage + 1}`}</span>
            <button
              disabled={currentPage === pdfData.Pages.length - 1}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-10 py-3 w-full sm:w-fit sm:ml-2 mt-4 bg-blue-600 text-white font-mono shadow-lg tracking-wide rounded-lg hover:bg-blue-700 transition duration-300 font-extrabold ease-in-out disabled:opacity-50"
            >
              Next Page
            </button>
          </div>
          <button
            onClick={() => { downloadPdf(editorRef) }}
            className="px-6 py-4 w-full mt-4 bg-green-600 text-white font-mono shadow-lg tracking-wide rounded-lg hover:bg-green-700 transition duration-300 font-extrabold ease-in-out disabled:opacity-50"
          >
            Download PDF
          </button>
        </div>

      )}
    </>
  );
};

export default Pagination;
