'use client';
import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import './PdfViewer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PdfViewerProps {
  pdfUrl: string | undefined;
}

export default function PdfViewer({ pdfUrl }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [renderedPageNumber, setRenderedPageNumber] = useState<number | null>(
    null,
  );

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const changePage = (offset: number) => {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  const isLoading = renderedPageNumber !== pageNumber;

  return (
    <div className="h-full w-full">
      <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
        {isLoading && renderedPageNumber ? (
          <Page
            key={renderedPageNumber}
            className="prevPage"
            pageNumber={renderedPageNumber}
            renderAnnotationLayer={false}
            renderTextLayer={false}
          />
        ) : null}
        <Page
          key={pageNumber}
          pageNumber={pageNumber}
          renderAnnotationLayer={false}
          renderTextLayer={false}
          onRenderSuccess={() => setRenderedPageNumber(pageNumber)}
        />
      </Document>
      <div>
        <p>
          Page {pageNumber || (numPages ? 1 : '--')} of {numPages || '--'}
        </p>
        <button
          className="btn btn-primary"
          disabled={pageNumber <= 1}
          type="button"
          onClick={previousPage}
        >
          Previous
        </button>
        <button
          className="btn btn-primary"
          disabled={pageNumber >= numPages!}
          type="button"
          onClick={nextPage}
        >
          Next
        </button>
      </div>
    </div>
  );
}
