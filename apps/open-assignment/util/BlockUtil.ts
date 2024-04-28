import { ExtensionName } from "@open-assignment/editor/dist/types/extensions.enum";
import {
  QUIZ_CONTENT_RULE_REGEX,
  PAGE_BLOCK_CONTENT_RULE,
  PAGE_BLOCK_REGEX,
  QUERY_ID_REGEX,
  QUIZ_BLOCK_REGEX,
  FEEDBACK_RULE_REGEX,
  MIXES_PAGEBLOCK_QUIZ_REGEX,
} from "./RegexMatch";

export const parseBlocksFromMarkdown = (
  markdownText: string,
  rule: RegExp,
  contentRule: RegExp,
): BlockData[] => {
  const matchingBlocks = markdownText?.match(rule);
  if (!matchingBlocks) return [];

  const blocks: BlockData[] = [];
  matchingBlocks.forEach((matchingBlock) => {
    const idMatches = matchingBlock.match(QUERY_ID_REGEX);
    if (idMatches && matchingBlock) {
      const [id] = idMatches;
      const content = matchingBlock
        .replaceAll(contentRule, "")
        .replace(id, "")
        .trim();

      blocks.push({
        id,
        content: content || "",
      });
    }
  });

  return blocks;
};

export const parseQuizBlock = (markdownText: string): BlockData[] => {
  return parseBlocksFromMarkdown(
    markdownText,
    QUIZ_BLOCK_REGEX,
    QUIZ_CONTENT_RULE_REGEX,
  );
};

export const parsePageBlock = (markdownText: string): BlockData[] => {
  return parseBlocksFromMarkdown(
    markdownText,
    PAGE_BLOCK_REGEX,
    PAGE_BLOCK_CONTENT_RULE,
  );
};

export const parseFeedbackBlock = (body: string): BlockData[] => {
  const matchingBlocks = body?.match(FEEDBACK_RULE_REGEX);
  if (!matchingBlocks) return [];
  const feedbacks: BlockData[] = [];
  matchingBlocks.forEach((matchingBlock) => {
    const content = matchingBlock.replace("{rr%", "").replace("%rr}", "");
    if (content.includes(";#;")) {
      const [id, feedback] = content.split(";#;");
      feedbacks.push({
        id,
        content: feedback,
      });
    } else {
      feedbacks.push({
        id: "",
        content,
      });
    }
  });
  return feedbacks;
};

export const isOnlyPageBlocks = (markdownText: string) => {
  const remainingContents = markdownText.replace(PAGE_BLOCK_REGEX, "");
  // By default, rich markdown always end up with "\" as break line. So, we need to remove \
  return !remainingContents.replace(/\\/g, "").trim().length;
};

// Get quizBlock and pageBlock in order from markdown text.
export const getZenBlocksInOrder = (markdownText: string) => {
  const combinedMatches: string[] = [];
  let match: RegExpExecArray;
  while ((match = MIXES_PAGEBLOCK_QUIZ_REGEX.exec(markdownText)) !== null) {
    combinedMatches.push(match[0]);
  }

  const blocks: { id: string; type: string }[] = [];
  combinedMatches.forEach((matchingBlock) => {
    const idMatches = matchingBlock.match(QUERY_ID_REGEX);
    if (idMatches && matchingBlock) {
      const [id] = idMatches;
      blocks.push({
        id,
        type:
          matchingBlock.includes("&&&") || matchingBlock.includes("{bl%")
            ? ExtensionName.Quizz
            : ExtensionName.PageBlock,
      });
    }
  });

  return blocks;
};

export type QuizAnswerType = {
  isAnswered: boolean;
  isCorrect?: boolean;
  indexAnswer?: number;
  multipleIndexAnswer?: number[];
  fillInBlankAnswer?: string;
};

export type Metadata = {
  answer: QuizAnswerType;
};

export type PageBlockMetaData = {
  pageBlockTitle: string;
};

export type BlockData = {
  id: string;
  content: string;
  metadata?: Metadata;
  pageBlockMetaData?: PageBlockMetaData;
};
