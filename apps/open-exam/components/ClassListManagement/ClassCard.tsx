import React from "react";

import { useRouter } from "next/router";
import styled from "styled-components";
import {Affix, Typography} from "antd";

import { GetMyClasses_classGetMyClasses as ClassItem } from "graphql/types";

import { MenuActions } from "./MenuActions";
import useUserPermission from "hook/UseUserPermission";
import { Permission } from "util/permission";
import { formatDocumentRoute } from "config/Routes";

export type ClassCardProps = {
  classItem: ClassItem;
  refetch: () => void;
}

export const ClassCard = ({ classItem, refetch }: ClassCardProps) => {
  const router = useRouter();
  const { banner } = classItem;
  const allow = useUserPermission();

  const onClickViewClass = () => {
    const path = formatDocumentRoute(classItem.starterDocument.documentId);
    router.push(path);
  };

  const bannerUrl = banner?.publicUrl || "/course-image.png";
  return (
    <CardContainer>
      <CardImage onClick={onClickViewClass} $bannerUrl={bannerUrl} />
      <div>
        <Typography.Title
          style={{ cursor: "pointer" }}
          level={4}
          onClick={onClickViewClass}
        >
          {classItem.name}
        </Typography.Title>
      </div>
      {allow(Permission.AddClass) && (
        <Affix
          offsetTop={150}
          style={{
            position: "absolute",
            marginTop: "5px",
            marginLeft: "calc(100% - 60px)",
            display: "none",
          }}
          className="affix-more-button"
        >
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              background: "rgba(119,117,117,0.5)",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <MenuActions classItem={classItem} refetch={refetch} />
          </div>
        </Affix>
      )}
    </CardContainer>
  );
};

const CardContainer = styled.div`
  position: relative;
  box-sizing: border-box;
  border-radius: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px;
  background: var(--color-gray-10, #fff);
  box-shadow: 0px 14px 42px 0px rgba(8, 15, 52, 0.06);
  min-height: 256px;

  &:hover {
    .affix-more-button {
      display: block !important;
    }
  }
`;

export const CardImage = styled.div<{ $bannerUrl: string }>`
  border-radius: 12px;
  width: 100%;
  height: 203px;
  background: url("${(props) => props.$bannerUrl}") lightgray 50% / cover
    no-repeat;
  cursor: pointer;
`;
