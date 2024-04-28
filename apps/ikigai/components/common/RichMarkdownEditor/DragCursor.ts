/* eslint-disable max-len */
import styled from "styled-components";

export const DragCursor = styled.div`
  display: none;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' version='1.1' viewBox='0 0 20 20' x='0px' y='0px' fill='none'%3E%3Cellipse cx='7.08325' cy='15' rx='1.25' ry='1.25' transform='rotate(180 7.08325 15)' fill='%23afafaf'%3E%3C/ellipse%3E%3Cellipse cx='7.08325' cy='10' rx='1.25' ry='1.25' transform='rotate(180 7.08325 10)' fill='%23afafaf'%3E%3C/ellipse%3E%3Cellipse cx='7.08325' cy='5' rx='1.25' ry='1.25' transform='rotate(180 7.08325 5)' fill='%23afafaf'%3E%3C/ellipse%3E%3Cellipse cx='12.5' cy='15' rx='1.25' ry='1.25' transform='rotate(180 12.5 15)' fill='%23afafaf'%3E%3C/ellipse%3E%3Ccircle cx='12.5' cy='10' r='1.25' transform='rotate(180 12.5 10)' fill='%23afafaf'%3E%3C/circle%3E%3Ccircle cx='12.5' cy='5' r='1.25' transform='rotate(180 12.5 5)' fill='%23afafaf'%3E%3C/circle%3E%3C/svg%3E");
  content: "";
  cursor: pointer;
  width: 22px;
  height: 22px;
  position: absolute;
  top: 3px;
  left: -20px;
  transition: opacity 200ms ease-in-out;
`;
