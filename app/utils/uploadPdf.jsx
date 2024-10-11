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
    if (response.ok) {
      loadExtractedData(result.dataUrl,setPdfData,setCurrentPage);
    } else {
      console.error('Error uploading PDF:', result.error);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error occurred during PDF upload');
  }
}


const loadExtractedData = async (url, setPdfData, setCurrentPage) => {
  try {
    const response = await fetch(url); // Updated URL
    const data = await response.json();

    if (response.ok) {
      setPdfData(data);
      setCurrentPage(0);
    } else {
      console.error('Error loading extracted data');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

