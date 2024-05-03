import {AuditOutlined, SendOutlined, UsergroupAddOutlined} from "@ant-design/icons";
import React, { useEffect, useState } from "react";

import {
  GetDocumentDetail_documentGet as IDocument,
  Role,
} from "graphql/types";
import AssignmentStudentList from "../AssignmentStudentList";
import { StyledRightMenu } from "../common";
import useDocumentStore from "context/ZustandDocumentStore";
import { t } from "@lingui/macro";
import { ButtonWithTooltip } from "components/common/Button";
import { useGetSpaceMembers } from "context/ZustandSpaceMembeStore";
import DocumentAssignedList from "../DocumentAssignedList";

export type AdminAssignmentDocumentProps = {
  document: IDocument;
};

const AssignmentHeader = ({ document }: AdminAssignmentDocumentProps) => {
  const setIsClose = useDocumentStore((state) => state.setIsClose);
  const [openStudentList, setOpenStudentList] = useState(false);
  const [openAssigneeList, setOpenAssigneeList] = useState(false);
  const { members: students } = useGetSpaceMembers(
    document?.spaceId,
    Role.STUDENT,
  );

  useEffect(() => {
    setIsClose(false);
  }, []);

  return (
    <>
      <StyledRightMenu style={{ gap: 4 }}>
        <ButtonWithTooltip
          btnProps={{
            type: "text",
            icon: <SendOutlined />,
            onClick: () => setOpenAssigneeList(true),
          }}
          tooltipProps={{
            title: t`Assign`,
            destroyTooltipOnHide: true,
          }}
        />
        <ButtonWithTooltip
          btnProps={{
            type: "text",
            icon: <AuditOutlined />,
            onClick: () => setOpenStudentList(true),
          }}
          tooltipProps={{
            title: t`Submission List`,
            destroyTooltipOnHide: true,
          }}
        />
      </StyledRightMenu>
      <AssignmentStudentList
        open={openStudentList}
        onClose={() => setOpenStudentList(false)}
        members={students}
        submissions={document.assignment.submissions}
      />
      <DocumentAssignedList
        visible={openAssigneeList}
        onClose={() => setOpenAssigneeList(false)}
      />
    </>
  );
};

export default AssignmentHeader;
