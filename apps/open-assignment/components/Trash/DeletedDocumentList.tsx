import { Col, Row } from "antd";
import { useMutation, useQuery } from "@apollo/client";

import DeletedItem from "./DeletedItem";
import { GET_DELETED_DOCUMENTS } from "graphql/query/DocumentQuery";
import { handleError } from "graphql/ApolloClient";
import { GetDeletedDocuments } from "graphql/types";
import Loading from "../Loading";
import { cloneDeep } from "lodash";
import {
  DELETE_DOCUMENT_PERMANENT,
  RESTORE_DOCUMENT,
} from "../../graphql/mutation/DocumentMutation";
import toast from "react-hot-toast";
import { t } from "@lingui/macro";

const DeletedDocumentList = () => {
  const [restoreDocument] = useMutation(RESTORE_DOCUMENT, {
    onError: handleError,
  });
  const [deleteDocument] = useMutation(DELETE_DOCUMENT_PERMANENT, {
    onError: handleError,
  });
  const { data, loading, refetch } = useQuery<GetDeletedDocuments>(
    GET_DELETED_DOCUMENTS,
    {
      onError: handleError,
      fetchPolicy: "network-only",
    },
  );

  const onRestore = async (documentId: number) => {
    const { data } = await restoreDocument({ variables: { documentId } });
    if (data) toast.success(t`Restored!`);
    refetch();
  };

  const onDelete = async (documentId: number) => {
    const { data } = await deleteDocument({ variables: { documentId } });
    if (data) toast.success(t`Deleted!`);
    refetch();
  };

  if (loading || !data) return <Loading />;
  const items = cloneDeep(data.documentGetDeletedDocuments).sort(
    (a, b) => b.deletedAt - a.deletedAt,
  );
  return (
    <Row>
      {items.map((doc) => (
        <Col span={6} key={doc.id}>
          <DeletedItem
            documentId={doc.id}
            title={doc.title}
            deletedAt={doc.deletedAt}
            onRestore={onRestore}
            onDelete={onDelete}
            imageSrc={doc.coverPhotoUrl || "/deleted-document.png"}
          />
        </Col>
      ))}
    </Row>
  );
};

export default DeletedDocumentList;
