import styled from "styled-components";
import React from "react";

import ProfileDropdown from "./ProfileDropdown";
import useOrganizationStore from "context/ZustandOrganizationStore";
import Logo from "../Logo";

const NavContainer = styled.div`
  width: 100%;
  align-items: center;
  border-bottom: ${(props) => `1px solid ${props.theme.colors.gray[3]}`};
  position: fixed;
  top: 0;
  left: 0;
  backdrop-filter: saturate(180%) blur(12px);
  background: var(--gray-1, #FFF);
  z-index: 2;
`;

const NavWrappedContainer = styled.div`
  margin: 0 auto;
  width: 100%;
  display: flex;
  padding: 10px 20px 10px 10px;
  gap: 13px;
  box-sizing: border-box;
  justify-content: flex-end;

  svg {
    color: ${props => props.theme.colors.gray[7]};
  }
`;

export const Header = () => {
  const branding = useOrganizationStore(state => state.branding);

  return (
    <NavContainer>
      <NavWrappedContainer>
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "flex-start",
          }}
        >
          <Logo src={branding?.orgLogoUrl || ""} />
        </div>
        <div />
        <ProfileDropdown />
      </NavWrappedContainer>
    </NavContainer>
  );
};
