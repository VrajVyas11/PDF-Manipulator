import processCombinedText from "./proccessCombinedText";
export default function renderPdfContent(pdfData=null,editorRef,currentPage) {
    if (!pdfData || !pdfData.Pages || pdfData.Pages.length === 0) {
      return <p className="text-center text-gray-600">No PDF loaded. Upload a PDF to view its contents.</p>;
    }

    const page = pdfData.Pages[currentPage];
    const canvasDimensions = { width: 595.276*1.1, height: 841.890 }; // Adjust this based on your PDF data

    const contentStyle = {
      width: `${canvasDimensions.width}px`,
      height: `${canvasDimensions.height}px`,
      position: 'relative',
      background: 'white',
      border: '1px solid #ccc',
      overflow: 'auto',
      wordBreak: 'break-word',
      padding: '10px',
      whiteSpace: 'pre-wrap', // Ensure spaces and line breaks are preserved
    };

    // Process and render text with individual styles
    const combinedText = page.Texts?.map((textItem, index) => {
        // const text = decodeURIComponent(textItem.R[0].T);
        const fontSize = textItem.R[0].TS[1]-(textItem.R[0].TS[1]/1.5) || 16;
        const fontFamily = textItem.R[0].TS[3] || 'Arial';
        const color = textItem.oc || 'black';
        const fontWeight = textItem.R[0].TS[2] ? 'bold' : 'normal';
    
        // Use processCombinedText to handle encoded characters and add line breaks
        const processedText1 = processCombinedText(page.Texts[index]?.R[0].T);
        const processedText2 = processCombinedText(index+1==page?.Texts?.length?"":page.Texts[index+1]?.R[0].T);

        return (
          <span
            key={index}
            style={{
              fontSize: `${fontSize}px`,
              fontFamily: fontFamily,
              fontWeight: fontWeight,
              color:color,
            }}
          >
            {processedText1==" " && processedText2==" "?<br/>:processedText1 }
          </span>
        );
      });

    return ( 
      <div
        className="relative mx-auto p-4 bg-white shadow-lg"
        style={contentStyle}
        contentEditable="true"
        ref={editorRef}
      >
        {combinedText}
      </div>
    );
  };
