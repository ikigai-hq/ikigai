import React, { useEffect } from "react";
import styled from "styled-components";
import { t } from "@lingui/macro";
import { Dropdown, theme, Tooltip } from "antd";

import {
  GetDocumentDetail_documentGet as IDocument,
  GetSubmissionsOfAssignment,
  GetSubmissionsOfAssignment_documentGet_assignment_submissions as SubmissionAssignment,
  OrgRole,
} from "graphql/types";
import { StyledLeftMenu } from "../common";
import AvatarWithName from "../../AvatarWithName";
import useDocumentStore from "context/ZustandDocumentStore";
import { DownOutlined } from "@ant-design/icons";
import useUserPermission from "hook/UseUserPermission";
import { Permission } from "util/permission";
import { useQuery } from "@apollo/client";
import { GET_SUBMISSIONS_OF_ASSIGNMENT } from "graphql/query/AssignmentQuery";
import { AssignmentList } from "../AssignmentStudentList";
import { useGetClassMembers } from "context/ZustandClassMembeStore";
import useClassStore from "context/ZustandClassStore";

export type DocumentDetailProps = {
  document: IDocument;
};

const ReviewSubmissionDocumentHeader = ({ document }: DocumentDetailProps) => {
  const { token } = theme.useToken();
  const allow = useUserPermission();
  const setIsClose = useDocumentStore((state) => state.setIsClose);
  const submission = document?.submission;
  const user = submission?.user;
  const assignmentDocumentId = submission?.assignment?.documentId;
  const classId = useClassStore(state => state.classId);
  const { members: students } = useGetClassMembers(classId, OrgRole.STUDENT);

  const { data } = useQuery<GetSubmissionsOfAssignment>(
    GET_SUBMISSIONS_OF_ASSIGNMENT,
    {
      variables: {
        assignmentDocumentId: assignmentDocumentId,
      },
      skip: !assignmentDocumentId,
    },
  );

  useEffect(() => {
    setIsClose(false);
  }, []);

  const contentStyle = {
    backgroundColor: token.colorBgElevated,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadow,
    padding: "5px",
    width: "70vw",
  };
  let submissions: SubmissionAssignment[] = [];
  if (data?.documentGet?.assignment?.submissions) {
    submissions = data.documentGet.assignment.submissions;
  }

  return (
    <>
      <div style={{ flex: 1 }} />
      <StyledLeftMenu>
        {allow(Permission.ManageClassContent) && (
          <Dropdown
            trigger={["click"]}
            placement="bottomLeft"
            dropdownRender={() => (
              <div style={contentStyle}>
                <AssignmentList
                  submissions={submissions}
                  members={students}
                  scroll={{ x: 700, y: 500 }}
                />
              </div>
            )}
          >
            <ReviewContainer>
              <AvatarWithName
                name={user?.orgPersonalInformation?.fullName}
                avtUrl={user?.orgPersonalInformation?.avatar?.publicUrl}
                color={user?.randomColor}
                avatarSize={"small"}
              />
              <Tooltip title={t`Choose another student`}>
                <DownOutlined
                  style={{ marginLeft: "8px", marginRight: "8px" }}
                />
              </Tooltip>
            </ReviewContainer>
          </Dropdown>
        )}
        {!allow(Permission.ManageClassContent) && (
          <ReviewContainer>
            <AvatarWithName
              name={user?.orgPersonalInformation?.fullName}
              avtUrl={user?.orgPersonalInformation?.avatar?.publicUrl}
              color={user?.randomColor}
              avatarSize={"small"}
            />
          </ReviewContainer>
        )}
      </StyledLeftMenu>
    </>
  );
};

const ReviewContainer = styled.div`
  padding: 2px 4px;
  background: #d9edfa;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  justify-content: center;
`;

export default ReviewSubmissionDocumentHeader;
