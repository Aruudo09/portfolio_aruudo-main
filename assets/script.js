// URL ke file PDF
const url = '<?= base_url('assets/yourfile.pdf'); ?>'; // Ganti dengan file PDF Anda

// Inisialisasi PDF.js
const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = '<?= base_url('assets/pdfjs/pdf.worker.js'); ?>';

let pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null;

const scale = 1.5, // Zoom level
      canvas = document.getElementById('pdf-render'),
      ctx = canvas.getContext('2d');

// Fungsi untuk render halaman PDF
const renderPage = (num) => {
  pageRendering = true;

  pdfDoc.getPage(num).then((page) => {
    const viewport = page.getViewport({ scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };

    page.render(renderContext).promise.then(() => {
      pageRendering = false;

      if (pageNumPending !== null) {
        renderPage(pageNumPending);
        pageNumPending = null;
      }
    });

    document.getElementById('page_num').textContent = num;
  });
};

// Fungsi untuk antri halaman
const queueRenderPage = (num) => {
  if (pageRendering) {
    pageNumPending = num;
  } else {
    renderPage(num);
  }
};

// Load PDF
pdfjsLib.getDocument(url).promise.then((pdfDoc_) => {
  pdfDoc = pdfDoc_;

  document.getElementById('page_count').textContent = pdfDoc.numPages;

  renderPage(pageNum);
});

// Navigasi halaman
document.getElementById('prev').addEventListener('click', () => {
  if (pageNum <= 1) return;
  pageNum--;
  queueRenderPage(pageNum);
});

document.getElementById('next').addEventListener('click', () => {
  if (pageNum >= pdfDoc.numPages) return;
  pageNum++;
  queueRenderPage(pageNum);
});