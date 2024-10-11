import  jsPDF  from 'jspdf';
import html2canvas from 'html2canvas';

export default async function downloadPdf(editorRef) {
    const editorContainer = editorRef.current; // Use the ref directly

    if (editorContainer) {
        try {
            await new Promise(resolve => setTimeout(resolve, 100)); // Short delay to ensure rendering
            
            const canvas = await html2canvas(editorContainer, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'px',
                format: [canvas.width, canvas.height],
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save('document.pdf');
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    } else {
        console.error('Editor content is not available or not a valid DOM element.');
    }
}
