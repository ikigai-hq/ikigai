import { Plugin } from "prosemirror-state";
import { Extension } from "@ikigai/editor";
import { QUIZ_BLOCK_NAME } from "./extensions/QuizExtension/QuizNode";
import { FILL_IN_BLANK_NAME } from "./extensions/QuizExtension/FillInBlank/FillInBlankNode";
import useDocumentStore from "context/ZustandDocumentStore";
import useAuthUserStore from "context/ZustandAuthStore";
import { documentAllow, DocumentPermission } from "util/permission";

const QuizBlockName = [QUIZ_BLOCK_NAME, FILL_IN_BLANK_NAME];

// Try to prevent missing to delete quiz block in free edit document.
export default class QuizDeletableManager extends Extension {
  get name() {
    return "node-deletable-manager";
  }

  get plugins() {
    return [
      new Plugin({
        filterTransaction: (transaction, state) => {
          const activeDocument = useDocumentStore.getState().masterDocument;
          const user = useAuthUserStore.getState().currentUser;
          // If we don't have user and document. Reject transaction
          if (!activeDocument || !user) return false;
          if (
            documentAllow(activeDocument, user, DocumentPermission.EditDocument)
          )
            return true;

          let result = true;
          const replaceSteps: number[] = [];
          transaction.steps.forEach((step, index) => {
            // Prosemirror mark delete is "replace"
            // @ts-ignore
            if (step.jsonID === "replace") {
              replaceSteps.push(index);
            }
          });

          replaceSteps.forEach((index) => {
            const map = transaction.mapping.maps[index];
            // @ts-ignore
            const oldStart = map.ranges[0];
            // @ts-ignore
            const oldEnd = map.ranges[0] + map.ranges[1];
            state.doc.nodesBetween(oldStart, oldEnd, (node) => {
              // Transaction want to remove non-edit blocks => reject
              if (QuizBlockName.includes(node.type.name)) {
                result = false;
              }
            });
          });

          return result;
        },
      }),
    ];
  }
}
