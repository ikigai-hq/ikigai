import { ChainedCommands } from "@tiptap/react";

export interface Position {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface MenuOption {
  urlImage: string;
  title: string;
  command: ChainedCommands;
  descriptions?: string;
}
