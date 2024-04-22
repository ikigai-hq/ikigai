import { documentAllow, DocumentPermission } from "util/permission";
import useDocumentStore from "context/ZustandDocumentStore";
import useAuthUserStore from "context/ZustandAuthStore";

const useDocumentPermission = () => {
  const userInfo = useAuthUserStore((state) => state.currentUser);
  const activeDocument = useDocumentStore((state) => state.masterDocument);
  const isPreviewMode = useDocumentStore((state) => state.isPreviewMode);

  return (permission: DocumentPermission) => {
    if (!userInfo || !activeDocument) return false;

    return documentAllow(activeDocument, userInfo, permission, isPreviewMode);
  };
};

export default useDocumentPermission;
