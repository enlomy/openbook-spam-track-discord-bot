// import { CommandInteraction, SlashCommandBuilder } from "discord.js";

// export const data = new SlashCommandBuilder()
//   .setName("ping")
//   .setDescription("Replies with Pong!");

// export async function execute(interaction: CommandInteraction) {
//   return interaction.reply("Pong!");
// }
import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("snip")
  .setDescription("Input mint address!")
  .addStringOption(option =>
    option.setName("message")
      .setDescription("The message to reply with")
      .setRequired(true)
  );

export async function execute(interaction: CommandInteraction) {
  // const message = interaction.options.data("message");
  return interaction.reply("snip!");
}