import React, { ChangeEvent, useState } from "react";

import { EditOutlined, LeftOutlined } from "@ant-design/icons";
import { Space, Breadcrumb } from "antd";
import { debounce } from "lodash";
import Link from "next/link";
import styled, { useTheme } from "styled-components";

import { Input } from "components/common/Input";
import { Text } from "components/common/Text";

interface Breadcrumb {
  name: string;
  path?: string;
}

interface PageTitleProps {
  title: string;
  onBack?: () => void;
  children?: React.ReactNode;
  breadcrumb?: Array<Breadcrumb>;
  isEdit?: boolean;
  isBack: boolean;
  onChangeTitle?: (title: string) => void;
  backgroundColor?: string;
  readOnly?: boolean;
}

const PageTitleContainer = styled.div`
  width: 100%;
  margin-bottom: 21px;
`;

const Title = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const GoBackIcon = styled(LeftOutlined)`
  font-size: 20px;
  color: ${(props) => props.theme.colors.gray[8]};
  cursor: pointer;
  vertical-align: middle;
  margin-right: 5px;
`;

const LinkBreadcrumb = styled(Text)`
  cursor: pointer;
  a {
    color: ${(props) => props.theme.colors.gray[6]};
  }
`;

const TitleContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: row;
  justify-content: start;
  align-items: center;
`;

const BreadcrumbContainer: React.FC<{ breadcrumb: Array<Breadcrumb> }> = ({
  breadcrumb,
}) => {
  const theme = useTheme();
  return (
    <Breadcrumb>
      {breadcrumb.map((item: Breadcrumb, index: number) => (
        <Breadcrumb.Item key={index}>
          {item.path ? (
            <LinkBreadcrumb level={2}>
              <Link href={item.path}>{item.name}</Link>
            </LinkBreadcrumb>
          ) : (
            <Text level={2} color={theme.colors.gray[8]}>
              {item.name}
            </Text>
          )}
        </Breadcrumb.Item>
      ))}
    </Breadcrumb>
  );
};

const PageTitle = ({
  title,
  onBack,
  children,
  breadcrumb,
  isEdit,
  isBack,
  onChangeTitle,
  backgroundColor,
  readOnly = false,
}: PageTitleProps) => {
  const handleChangeTitle = debounce((event: ChangeEvent<HTMLInputElement>) => {
    const newTile = event.target.value;
    if (onChangeTitle) onChangeTitle(newTile);
  }, 1000);

  if (title === undefined) {
    return null;
  }

  return (
    <PageTitleContainer>
      <div style={{ width: "100%" }}>
        {breadcrumb && <BreadcrumbContainer breadcrumb={breadcrumb} />}
        <Title>
          <div style={{ alignItems: "baseline", display: "flex", flex: "1" }}>
            {isBack && <GoBackIcon onClick={() => onBack()} />}
            <TitleContainer>
              {readOnly ? (
                <Text
                  style={{
                    fontFamily: "Inter",
                    fontStyle: "normal",
                    fontWeight: "700",
                    fontSize: "30px",
                    lineHeight: "38px",
                  }}
                >
                  {title}
                </Text>
              ) : (
                <Input
                  onChange={handleChangeTitle}
                  defaultValue={title}
                  readOnly={!isEdit}
                  style={{
                    fontFamily: "Inter",
                    fontStyle: "normal",
                    fontWeight: "700",
                    fontSize: "30px",
                    lineHeight: "38px",
                    background: backgroundColor || "white",
                    paddingLeft: 0,
                    paddingRight: 0,
                    border: "none",
                  }}
                />
              )}
            </TitleContainer>
          </div>
          {children}
        </Title>
      </div>
    </PageTitleContainer>
  );
};

export default PageTitle;
