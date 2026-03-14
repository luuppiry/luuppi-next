'use client';

import dynamic from 'next/dynamic';

const PdfViewer = dynamic(() => import('./PdfViewer'), { ssr: false });

export default PdfViewer;
