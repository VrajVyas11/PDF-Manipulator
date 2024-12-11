import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const downloadPdf = async (editorRef) => {
    const editorInstance = editorRef.current;

    if (editorInstance) {
        try {
            const content = editorInstance.getEditorValue(); // Get the content of the Jodit editor

            if (!content) {
                throw new Error('Editor content is empty.');
            }

            // Create a temporary container to render the content
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = content;
            document.body.appendChild(tempDiv);

            // Wait for the content to render
            await new Promise(resolve => setTimeout(resolve, 100));

            const canvas = await html2canvas(tempDiv, {
                scale: 2,
                useCORS: true,
            });

            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height],
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save('document.pdf');

            // Clean up the temporary div
            document.body.removeChild(tempDiv);
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    } else {
        console.error('Editor instance is not available.');
    }
};

export default downloadPdf;
