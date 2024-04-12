import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";

const NUMBER_OF_COLS = 6;
const NUMBER_OF_ROWS = 5;

interface Props {
  numberCols?: number;
  numberRows?: number;
  onCreateTable: ({
    rowsCount,
    colsCount,
  }: {
    rowsCount: number;
    colsCount: number;
  }) => void;
}

type Coord = { ci: number; ri: number };

export const TableList: React.FC<Props> = ({
  numberCols = NUMBER_OF_COLS,
  numberRows = NUMBER_OF_ROWS,
  onCreateTable,
}) => {
  const arrCols = useMemo(
    () =>
      Array(numberCols)
        .fill(1)
        .map((c, index) => c + index),
    [numberCols]
  );
  const arrRows = useMemo(
    () =>
      Array(numberRows)
        .fill(1)
        .map((c, index) => c + index),
    [numberRows]
  );
  const ref = useRef<HTMLDivElement>(null);

  const [selectedCoord, setSelectedCoord] = useState<Coord>({ ci: -1, ri: -1 });

  useEffect(() => {
    function handleMouseOut(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setSelectedCoord({ ci: -1, ri: -1 });
      }
    }
    document.addEventListener("mouseout", handleMouseOut);
    return () => {
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, [ref]);

  return (
    <TableContainer ref={ref}>
      {arrCols.map((c, ci) => {
        return (
          <StyledCol noCols={numberCols} key={c}>
            {arrRows.map((r, ri) => {
              const isHover = ci <= selectedCoord.ci && ri <= selectedCoord.ri;
              return (
                <StyledRow
                  key={r}
                  isHover={isHover}
                  onMouseOver={() => setSelectedCoord({ ci, ri })}
                  onClick={() =>
                    onCreateTable({
                      rowsCount: selectedCoord.ri + 1,
                      colsCount: selectedCoord.ci + 1,
                    })
                  }
                />
              );
            })}
          </StyledCol>
        );
      })}
    </TableContainer>
  );
};

const TableContainer = styled.div`
  border-radius: 8px;
  border: 1px solid #eaecef;
  background-color: #ffffff;
  padding: 8px;
  display: flex;
  justify-content: space-between;
  gap: 4px;
`;

const StyledCol = styled.div<{ noCols: number }>`
  width: ${({ noCols }) => 100 / noCols}%;
`;

const StyledRow = styled.div<{ isHover: boolean }>`
  height: 18px;
  border: 0.5px solid #eaecef;
  background: ${({ isHover }) => (isHover ? "#EAECEF" : "#ffffff")};
  border-radius: 4px;
  cursor: pointer;

  :not(:last-child) {
    margin-bottom: 4px;
  }
`;
