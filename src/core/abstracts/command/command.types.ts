import { BaseCommand } from "@abstracts/command/command.abstract";
import {
  ChatInputCommandInteraction,
  Message,
  SlashCommandBuilder,
} from "discord.js";

export enum CmdType {
  SLASH_COMMAND = "SLASH_COMMAND",
  MESSAGE_COMMAND = "MESSAGE_COMMAND",
}

export type AllowedUsersOrRolesType = string | undefined;

export type SlashCommandType = BaseCommand<CmdType.SLASH_COMMAND>;
export type MessageCommandType = BaseCommand<CmdType.MESSAGE_COMMAND>;

export type CmdOpt<T extends CmdType> = T extends CmdType.SLASH_COMMAND
  ? SlashCommandOptions
  : MessageCommandOptions;

export type CmdArg<T extends CmdType> = T extends CmdType.SLASH_COMMAND
  ? ChatInputCommandInteraction
  : Message;

export type MixedCommandsArray = (
  | typeof BaseCommand<CmdType.SLASH_COMMAND>
  | typeof BaseCommand<CmdType.MESSAGE_COMMAND>
)[];

type SharedCommandOptions = { name: string };

type SlashCommandOptions = SharedCommandOptions & {
  description: string;
  deferReply?: boolean;
  data?: SlashCommandBuilder;
};

type MessageCommandOptions = SharedCommandOptions & {
  allowedUsersOrRoles: AllowedUsersOrRolesType[];
};