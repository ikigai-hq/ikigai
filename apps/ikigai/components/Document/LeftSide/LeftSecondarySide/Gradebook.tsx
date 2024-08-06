import React from "react";
import { Trans } from "@lingui/macro";
import { Heading, Separator, Table } from "@radix-ui/themes";

import useDocumentStore, { ISpaceDocument } from "store/DocumentStore";
import { DocumentType, Role } from "graphql/types";
import {
  LeftSideContainer,
  LeftSideContentWrapper,
  LeftSideHeaderWrapper,
} from "./shared";
import { useGetSpaceMembers } from "store/SpaceMembeStore";
import UserBasicInformation from "components/UserBasicInformation";

const Gradebook = () => {
  const spaceDocuments = useDocumentStore((state) => state.spaceDocuments);
  const sortedDocs = flatDocuments(spaceDocuments, null).filter(
    (doc) => doc.documentType === DocumentType.ASSIGNMENT,
  );
  const { members } = useGetSpaceMembers(Role.STUDENT);

  return (
    <LeftSideContainer>
      <LeftSideHeaderWrapper>
        <div style={{ flex: 1, paddingLeft: 5 }}>
          <Heading size="5">
            <Trans>Gradebook</Trans>
          </Heading>
        </div>
      </LeftSideHeaderWrapper>
      <Separator style={{ width: "100%" }} />
      <LeftSideContentWrapper>
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Student</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Final grade</Table.ColumnHeaderCell>
              {sortedDocs.map((document) => (
                <Table.ColumnHeaderCell key={document.id}>
                  {document.title}
                </Table.ColumnHeaderCell>
              ))}
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {members.map((member) => (
              <Table.Row key={member.userId}>
                <Table.RowHeaderCell>
                  <UserBasicInformation
                    name={member.user.name}
                    avatar={member.user.avatar?.publicUrl}
                    email={member.user.email}
                  />
                </Table.RowHeaderCell>
                <Table.RowHeaderCell>
                  {getFinalGradeOfStudent(sortedDocs, member.userId).toFixed(2)}
                </Table.RowHeaderCell>
                {sortedDocs.map((document) => (
                  <Table.RowHeaderCell key={document.id}>
                    {getLatestSubmissionByUserId(document, member.userId)
                      ?.finalGrade || 0}
                  </Table.RowHeaderCell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </LeftSideContentWrapper>
    </LeftSideContainer>
  );
};

const flatDocuments = (
  spaceDocuments: ISpaceDocument[],
  parentId: string | null,
): ISpaceDocument[] => {
  const res = [];

  const sortedDocs = spaceDocuments
    .filter((doc) => doc.parentId === parentId)
    .sort((docA, docB) => docA.index - docB.index);
  res.push(...sortedDocs);

  sortedDocs.forEach((sortedDoc) => {
    res.push(...flatDocuments(spaceDocuments, sortedDoc.id));
  });

  return res;
};

const getLatestSubmissionByUserId = (
  spaceDocument: ISpaceDocument,
  userId: number,
) => {
  const sortedSubmissions = spaceDocument.assignment?.submissions
    ?.filter((submission) => submission.userId === userId)
    .sort(
      (submissionA, submissionB) =>
        submissionB.attemptNumber - submissionA.attemptNumber,
    );

  if (sortedSubmissions.length > 0) {
    return sortedSubmissions[0];
  }
};

const getFinalGradeOfStudent = (
  sortedDocs: ISpaceDocument[],
  userId: number,
) => {
  if (sortedDocs.length === 0) return 0;

  let finalGrade = 0;

  sortedDocs.forEach((sortedDoc) => {
    const latestSubmission = getLatestSubmissionByUserId(sortedDoc, userId);
    if (latestSubmission) {
      finalGrade += latestSubmission.finalGrade;
    }
  });

  return finalGrade / sortedDocs.length;
};

export default Gradebook;
