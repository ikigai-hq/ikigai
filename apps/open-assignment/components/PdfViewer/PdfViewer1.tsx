import Loading from "components/Loading";
import { useState } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import styled from "styled-components";

const MyPage: any = Page;

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export type PdfViewerProps = {
  fileUrl: string;
  fileId: string;
  height: number;
  width: number;
  zoom: number;
  isFullScreen: boolean;
};

const PdfViewerV1 = (props: PdfViewerProps) => {
  const { fileUrl, height, width, zoom, isFullScreen } = props;
  const [numPages, setNumPages] = useState(null);
  const [pagesRendered, setPageRendered] = useState(null);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageRendered(0);
  };

  const onRenderSuccess = () => {
    setPageRendered((prev) => prev + 1);
  };

  /**
   * The amount of pages we want to render now. Always 1 more than already rendered,
   * no more than total amount of pages in the document.
   */
  const pagesRenderedPlusOne = Math.min(pagesRendered + 1, numPages);

  return (
    <div
      style={{
        height: isFullScreen ? "calc(100vh - 22px)" : height - 16,
        width: isFullScreen ? "calc(100vw - 22px)" : "auto",
        overflow: "auto",
        margin: isFullScreen ? 0 : 8,
      }}
    >
      <DocumentStyled
        file={fileUrl}
        loading={<Loading />}
        options={{
          cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
          cMapPacked: true,
        }}
        onLoadSuccess={onDocumentLoadSuccess}
      >
        {Array.from(new Array(pagesRenderedPlusOne), (el, index) => {
          const isCurrentlyRendering = pagesRenderedPlusOne === index + 1;
          const isLastPage = numPages === index + 1;
          const needsCallbackToRenderNextPage =
            isCurrentlyRendering && !isLastPage;
          return (
            <MyPage
              key={index}
              loading={<Loading />}
              pageNumber={index + 1}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              width={width - 18}
              scale={zoom}
              onRenderSuccess={
                needsCallbackToRenderNextPage ? onRenderSuccess : null
              }
            />
          );
        })}
      </DocumentStyled>
    </div>
  );
};

const DocumentStyled = styled(Document)`
  .react-pdf__Page__canvas {
    margin: auto;
  }

  .react-pdf__Page:not(:last-child) {
    padding-bottom: 8px;
  }
  canvas {
    width: 100%;
  }
`;

export default PdfViewerV1;
