import React, { useState } from "react";
import { Trans } from "@lingui/macro";
import {
  Badge,
  Button,
  DropdownMenu,
  Heading,
  Link,
  Separator,
  Table,
} from "@radix-ui/themes";
import { CSVLink } from "react-csv";
import NextLink from "next/link";

import useDocumentStore, {
  ISpaceDocument,
  ITag,
  useAvailableTags,
} from "store/DocumentStore";
import { DocumentType, Role } from "graphql/types";
import {
  LeftSideContainer,
  LeftSideContentWrapper,
  LeftSideHeaderWrapper,
} from "./shared";
import { ISpaceMember, useGetSpaceMembers } from "store/SpaceMembeStore";
import UserBasicInformation from "components/UserBasicInformation";
import useSpaceStore from "store/SpaceStore";
import { formatTimestamp, getNowAsSec } from "util/Time";
import { formatDocumentRoute } from "config/Routes";
import { Cross2Icon } from "@radix-ui/react-icons";

const Gradebook = () => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const spaceDocuments = useDocumentStore((state) => state.spaceDocuments);
  const sortedDocs = flatDocuments(spaceDocuments, null).filter(
    (doc) => doc.documentType === DocumentType.ASSIGNMENT,
  );
  const { members } = useGetSpaceMembers(Role.STUDENT);

  const onChooseTag = (tag: ITag) => {
    if (!selectedTags.includes(tag.tag)) {
      setSelectedTags([...selectedTags, tag.tag]);
    }
  };

  const onRemoveTag = (tag: string) => {
    const index = selectedTags.indexOf(tag);
    if (index > -1) {
      selectedTags.splice(index, 1);
      setSelectedTags([...selectedTags]);
    }
  };

  const availableTags = useAvailableTags();
  const availableDocs = sortedDocs.filter(
    (sortedDoc) =>
      selectedTags.length === 0 ||
      sortedDoc.tags
        .map((tag) => tag.tag)
        .some((tag) => selectedTags.includes(tag)),
  );

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
      <LeftSideContentWrapper style={{ padding: 20 }}>
        <div style={{ display: "flex" }}>
          <div style={{ flex: 1 }}>
            <div>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger disabled={availableTags.length === 0}>
                  <Button variant="soft">
                    Filter by Assignment Tags
                    <DropdownMenu.TriggerIcon />
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content style={{ padding: 5 }}>
                  {availableTags.map((tag) => (
                    <DropdownMenu.Item
                      key={tag.tag}
                      onClick={() => onChooseTag(tag)}
                    >
                      {tag.tag}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Root>
              <div style={{ display: "flex", gap: 4, marginTop: 5 }}>
                {selectedTags.map((selectedTag) => (
                  <Badge color="gold" key={selectedTag}>
                    {selectedTag}
                    <Cross2Icon
                      style={{ cursor: "pointer" }}
                      onClick={() => onRemoveTag(selectedTag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div>
            <DownloadGradeBookCSV
              members={members}
              assignments={availableDocs}
            />
          </div>
        </div>
        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>
                <Trans>Student</Trans>
              </Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell minWidth="120px">
                <Trans>Final Grade</Trans>
              </Table.ColumnHeaderCell>
              {availableDocs.map((document) => (
                <Table.ColumnHeaderCell key={document.id}>
                  <NextLink href={formatDocumentRoute(document.id)} passHref>
                    <Link weight="medium" target="_blank">
                      {document.title}
                    </Link>
                  </NextLink>
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
                  {getFinalGradeOfStudent(availableDocs, member.userId).toFixed(
                    2,
                  )}
                </Table.RowHeaderCell>
                {availableDocs.map((document) => {
                  const latestSubmission = getLatestSubmissionByUserId(
                    document,
                    member.userId,
                  );
                  if (latestSubmission) {
                    return (
                      <Table.RowHeaderCell key={document.id}>
                        <NextLink
                          href={formatDocumentRoute(
                            latestSubmission.documentId,
                          )}
                          passHref
                        >
                          <Link target={"_blank"}>
                            {latestSubmission.finalGrade.toFixed(2)}
                          </Link>
                        </NextLink>
                      </Table.RowHeaderCell>
                    );
                  }

                  return (
                    <Table.RowHeaderCell key={document.id}>
                      0
                    </Table.RowHeaderCell>
                  );
                })}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </LeftSideContentWrapper>
    </LeftSideContainer>
  );
};

export type DownloadGradebookCSVProps = {
  assignments: ISpaceDocument[];
  members: ISpaceMember[];
};

const DownloadGradeBookCSV = ({
  assignments,
  members,
}: DownloadGradebookCSVProps) => {
  const spaceName = useSpaceStore((state) => state.space?.name);
  const today = formatTimestamp(getNowAsSec());
  const csvData = [
    [
      "Student",
      "Email",
      "Final Grade",
      ...assignments.map((assignment) => assignment.title),
    ],
  ];

  members.forEach((member) => {
    const row = [
      member.user.name,
      member.user.email,
      getFinalGradeOfStudent(assignments, member.userId).toFixed(2),
      ...assignments.map((assignment) => {
        const latestSubmission = getLatestSubmissionByUserId(
          assignment,
          member.userId,
        );
        if (latestSubmission) return latestSubmission.finalGrade.toFixed(2);

        return "0";
      }),
    ];
    csvData.push(row);
  });

  return (
    <CSVLink
      data={csvData}
      target={"_blank"}
      filename={`Gradebook_${spaceName}_${today}`}
    >
      <Button>
        <Trans>Export to CSV</Trans>
      </Button>
    </CSVLink>
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
