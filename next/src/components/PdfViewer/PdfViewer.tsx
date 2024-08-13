'use client';
import { Dictionary } from '@/models/locale';
import { useEffect, useState } from 'react';
import { FaAngleLeft, FaAngleRight, FaExternalLinkAlt } from 'react-icons/fa';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import './PdfViewer.css';

// Polyfill for Promise.withResolvers
// https://github.com/wojtekmaj/react-pdf/issues/1811#issuecomment-2171064960
if (typeof Promise.withResolvers === 'undefined') {
  if (window)
    // eslint-disable-next-line lines-around-comment
    // @ts-expect-error This does not exist outside of polyfill which this is doing
    window.Promise.withResolvers = function () {
      let resolve, reject;
      const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });
      return { promise, resolve, reject };
    };
}

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/legacy/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  pdfUrl: string | undefined;
  dictionary: Dictionary;
}

export default function PdfViewer({ pdfUrl, dictionary }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const changePage = (offset: number) => {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDownload = () => {
    window.open(pdfUrl, '_blank');
  };

  return (
    <>
      <button className="btn btn-primary btn-sm mb-4" onClick={handleDownload}>
        {dictionary.general.open_pdf}
        <FaExternalLinkAlt />
      </button>
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
              height={isMobile ? 350 : 825}
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
              className="btn btn-primary btn-sm"
              disabled={pageNumber <= 1}
              type="button"
              onClick={previousPage}
            >
              <FaAngleLeft />
            </button>
            <button
              className="btn btn-primary btn-sm"
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
    </>
  );
}
