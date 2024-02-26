import { Base } from "@abstracts/client/client.abstract";
import {
  AllowedUsersOrRolesType,
  CmdArg,
  CmdType,
  MessageCommandType,
  SlashCommandType,
} from "@abstracts/command/command.types";
import { ModuleAbstract } from "@abstracts/module/module.abstract";
import { logger } from "@app/core/logger/logger-client";
import { CustomClient } from "@client/custom-client";
import {
  MessageCommandsMap,
  SlashCommandMap,
} from "@managers/command/command-manager.types";

export class CommandManager extends Base {
  constructor(client: CustomClient) {
    super(client);

    logger.log("Command Manager inited");
  }

  public slashCommands: SlashCommandMap = new Map();
  public messageCommands: MessageCommandsMap = new Map();

  public loadCommands(module: ModuleAbstract) {
    if (!module.commands) return;

    for (const Command of module.commands) {
      const commandInstance = new Command(this.client);

      if (!commandInstance.options) {
        logger.log(`No options was found for ${Command.name}, skipping`);
        continue;
      }

      const { name } = commandInstance.options;

      if ("data" in commandInstance.options) {
        this.slashCommands.set(name, commandInstance as SlashCommandType);
      } else {
        this.messageCommands.set(name, commandInstance as MessageCommandType);
      }
    }
  }

  public async executeCommand<T extends CmdType>(
    cmdName: string,
    cmdArg: CmdArg<T>,
    isSlash: boolean
  ) {
    try {
      const command = isSlash
        ? this.slashCommands.get(cmdName)
        : this.messageCommands.get(cmdName);

      if (!command) return;

      isSlash
        ? this.executeSlashCommand(
            cmdArg as CmdArg<CmdType.SLASH_COMMAND>,
            command as SlashCommandType
          )
        : this.executeMessageCommand(
            cmdArg as CmdArg<CmdType.MESSAGE_COMMAND>,
            command as MessageCommandType
          );
    } catch (err) {
      logger.error(`${err}`);
    }
  }

  public async checkPermissions(
    allowedUsersOrRoles: AllowedUsersOrRolesType[],
    commandArgument: CmdArg<CmdType.MESSAGE_COMMAND>
  ) {
    if (allowedUsersOrRoles.includes(commandArgument.author.id)) return true;

    const fetchedMember = await commandArgument.member?.fetch();

    if (!fetchedMember) return false;
    if (
      allowedUsersOrRoles.some((val) =>
        val !== undefined ? fetchedMember.roles.cache.has(val) : null
      )
    )
      return true;
  }

  private async executeSlashCommand(
    arg: CmdArg<CmdType.SLASH_COMMAND>,
    command: SlashCommandType
  ) {
    try {
      await command.execute(arg);
    } catch (err) {}
  }

  private async executeMessageCommand(
    arg: CmdArg<CmdType.MESSAGE_COMMAND>,
    command: MessageCommandType
  ) {
    try {
      if (!command.options) return;

      const checkedPermissions = await this.checkPermissions(
        command.options.allowedUsersOrRoles,
        arg
      );

      if (!checkedPermissions) return;

      await command.execute(arg);
    } catch (err) {}
  }
}
