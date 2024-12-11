export async function uploadPdf(file, setPdfData, setCurrentPage) {
  if (!file) {
    alert('Please select a PDF file first.');
    return;
  }

  const formData = new FormData();
  formData.append('pdf', file);

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Error uploading PDF');
    }

    const result = await response.json();
    // console.log(result);

    if (response.ok && result.data) {
      setPdfData(result.data);
      setCurrentPage(0); // Initialize the current page to the first page
    } else {
      console.error('Error uploading PDF:', result.error);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error occurred during PDF upload');
  }
}
