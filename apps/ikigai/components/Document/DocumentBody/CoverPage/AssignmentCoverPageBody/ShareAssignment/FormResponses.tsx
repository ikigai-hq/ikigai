import useDocumentStore from "store/DocumentStore";
import { useQuery } from "@apollo/client";
import { Button, Heading, Table, Text } from "@radix-ui/themes";
import { Trans } from "@lingui/macro";
import { CSVLink } from "react-csv";
import React from "react";
import Link from "next/link";

import { GET_EMBEDDED_RESPONSES } from "graphql/query/DocumentQuery";
import { handleError } from "graphql/ApolloClient";
import {
  GetEmbeddedResponses,
  GetEmbeddedResponses_documentGetEmbeddedSession_responses,
} from "graphql/types";
import { formatTimestamp, FormatType, getNowAsSec } from "util/Time";
import { formatDocumentRoute } from "config/Routes";

const FormResponses = () => {
  const title = useDocumentStore((state) => state.activeDocument?.title);
  const documentId = useDocumentStore((state) => state.activeDocumentId);
  const { data } = useQuery<GetEmbeddedResponses>(GET_EMBEDDED_RESPONSES, {
    onError: handleError,
    variables: {
      documentId,
    },
  });

  const responses = data?.documentGetEmbeddedSession?.responses || [];
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <Heading>
            <Trans>Form Responses</Trans>
          </Heading>
          <Text color="gray" size="2">
            <Trans>
              The response after a student fills out the form before doing the
              assignment via the Share & Embed feature.
            </Trans>
          </Text>
        </div>
        <ExportResponses title={title} responses={responses} />
      </div>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>
              <Trans>Full name</Trans>
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              <Trans>Email</Trans>
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              <Trans>Phone number</Trans>
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              <Trans>Response at</Trans>
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell />
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {responses.map((response) => (
            <Table.Row key={response.submissionId}>
              <Table.RowHeaderCell>
                {response.responseData.firstName}{" "}
                {response.responseData.lastName}
              </Table.RowHeaderCell>
              <Table.Cell>{response.responseData.email}</Table.Cell>
              <Table.Cell>{response.responseData.phoneNumber}</Table.Cell>
              <Table.Cell>
                {formatTimestamp(response.createdAt, FormatType.DateTimeFormat)}
              </Table.Cell>
              <Table.Cell>
                {response.submission && (
                  <Link
                    href={formatDocumentRoute(response.submission?.documentId)}
                    target="_blank"
                    passHref
                  >
                    <a target="_blank">
                      <Button variant="soft">View submission</Button>
                    </a>
                  </Link>
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </div>
  );
};

type ExportResponsesProps = {
  title: string;
  responses: GetEmbeddedResponses_documentGetEmbeddedSession_responses[];
};

const ExportResponses = ({ title, responses }: ExportResponsesProps) => {
  const today = formatTimestamp(getNowAsSec());

  const csvData = [["Name", "Email", "Phone Number", "Response at"]];
  responses.forEach((response) => {
    csvData.push([
      response.responseData.firstName,
      response.responseData.email,
      response.responseData.phoneNumber,
      formatTimestamp(response.createdAt, FormatType.DateTimeFormat),
    ]);
  });

  return (
    <CSVLink
      data={csvData}
      target={"_blank"}
      filename={`responses_${title}_${today}.csv`}
    >
      <Button>
        <Trans>Export to CSV</Trans>
      </Button>
    </CSVLink>
  );
};

export default FormResponses;
