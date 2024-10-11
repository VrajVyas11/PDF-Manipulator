import downloadPdf from "../utils/downloadPdf";
const Pagination = ({ pdfData, currentPage, setCurrentPage, editorRef }) => {
    return (
      <>
        {pdfData && pdfData.Pages && (
          <div className="flex justify-between w-full mt-4">
            <button
              disabled={currentPage === 0}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="px-4 py-2 bg-gray-300 rounded-lg shadow-md hover:bg-gray-400 disabled:opacity-50"
            >
              Previous Page
            </button>
            <button
              onClick={() => { downloadPdf(editorRef) }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700"
            >
              Download PDF
            </button>
            <button
              disabled={currentPage === pdfData.Pages.length - 1}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-4 py-2 bg-gray-300 rounded-lg shadow-md hover:bg-gray-400 disabled:opacity-50"
            >
              Next Page
            </button>
          </div>
        )}
      </>
    );
  };
  
  export default Pagination;
  