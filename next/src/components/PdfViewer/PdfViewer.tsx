'use client';
import { Dictionary } from '@/models/locale';
import { useState } from 'react';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import './PdfViewer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PdfViewerProps {
  pdfUrl: string | undefined;
  dictionary: Dictionary;
}

export default function PdfViewer({ pdfUrl, dictionary }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const changePage = (offset: number) => {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  return (
    <div className="justify-centerbg-red-50 flex h-full min-h-[70vh] w-full flex-col items-center gap-4">
      <Document
        file={pdfUrl}
        loading={
          <div className="flex h-full w-full justify-center">
            <span className="loading loading-spinner loading-lg" />
          </div>
        }
        onLoadSuccess={onDocumentLoadSuccess}
      >
        {Array.from(new Array(numPages), (_, index) => (
          <Page
            key={`page_${index + 1}`}
            className={`pdf-page ${pageNumber === index + 1 ? 'active' : ''}`}
            loading={
              <div className="flex h-full w-full justify-center">
                <span className="loading loading-spinner loading-lg" />
              </div>
            }
            pageNumber={index + 1}
          />
        ))}
      </Document>
      <div className="flex flex-col items-center gap-2">
        <div className="flex gap-2">
          <button
            className="btn btn-primary btn-sm text-white"
            disabled={pageNumber <= 1}
            type="button"
            onClick={previousPage}
          >
            <FaAngleLeft />
          </button>
          <button
            className="btn btn-primary btn-sm text-white"
            disabled={pageNumber >= numPages!}
            type="button"
            onClick={nextPage}
          >
            <FaAngleRight />
          </button>
        </div>
        <p>
          {dictionary.general.page} {pageNumber || (numPages ? 1 : '--')} /{' '}
          {numPages || '--'}
        </p>
      </div>
    </div>
  );
}
