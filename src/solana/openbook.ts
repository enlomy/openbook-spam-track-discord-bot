import { MAINNET_PROGRAM_ID, MARKET_STATE_LAYOUT_V3, struct, u64, u8 } from "@raydium-io/raydium-sdk";
import fs from 'fs'
import { METAPLEX, solanaConnection1, solanaConnection2, solanaConnection3, webhook, webhookCounts } from "../config";
import { KeyedAccountInfo, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import base58 from 'bs58'
import axios from "axios";
import { Metadata } from "@metaplex-foundation/mpl-token-metadata";

const DepositLayout = struct([
  u8("discriminator"),
  u64("amountIn"),
  u64("minAmountOut"),
]);

interface SniperData {
  address: string;
  amount: number;
}

interface SniperListData {
  [key: string]: SniperData[]
}

const new_market_list: Array<string> = []
const sniper_list: SniperListData = {}

export const subscriptionlistener = async () => {
  console.log("Subscription is ready! ✏️");

  const market_address_array = JSON.parse(fs.readFileSync('market_list.json', 'utf8'))

  console.log('here')
  try {
    const market_subscription_id = solanaConnection1.onProgramAccountChange(MAINNET_PROGRAM_ID.OPENBOOK_MARKET,
      async (updatedAccountInfo: KeyedAccountInfo) => {
        const market_id = updatedAccountInfo.accountId.toString()
        if (market_address_array.includes(market_id)) return
        else {
          console.log('new market', market_id)
          market_address_array.push(market_id)
          new_market_list.push(market_id)
          console.log('new_market_list', new_market_list)
          fs.writeFileSync('market_list.json', JSON.stringify(market_address_array, null, 4))
        }
      },
      "confirmed",
      [
        { dataSize: MARKET_STATE_LAYOUT_V3.span },
        {
          memcmp: {
            offset: MARKET_STATE_LAYOUT_V3.offsetOf('quoteMint'),
            bytes: "So11111111111111111111111111111111111111112",
          },
        },
      ]
    )
  } catch (e) {
    console.error(e)
  }

  try {
    const log_subscription_id = solanaConnection2.onLogs(MAINNET_PROGRAM_ID.OPENBOOK_MARKET, async (Logs) => {
      const { logs, signature, err } = Logs
      if (err) {
        const err_string = JSON.stringify(err)
        // console.log('err tx', signature, err_string)
        if (err_string.includes('Custom":27')) {
          // console.log('sniper', signature)
          await get_detail_info(signature)
        }
      } else {

      }
    })
  } catch (e) {
    console.log(e)
  }

  try {
    const pool_subscription_id = solanaConnection3.onLogs(MAINNET_PROGRAM_ID.OPENBOOK_MARKET, async (Logs) => {
      const { logs, signature, err } = Logs
      if (err) {
        const err_string = JSON.stringify(err)
        // console.log('err tx', signature, err_string)
        if (err_string.includes('Custom":27')) {
          // console.log('sniper', signature)
          await get_detail_info(signature)
        }
      } else {

      }
    })
  } catch (e) {
    console.log(e)
  }
}

const get_detail_info = async (signature: string) => {
  try {
    const parsed_data = await solanaConnection3.getParsedTransaction(signature, {
      maxSupportedTransactionVersion: 0,
      commitment: 'confirmed'
    })

    const signer = parsed_data?.transaction.message.accountKeys[0].pubkey.toString()
    if (!signer) return
    const inner_inx = parsed_data?.meta?.innerInstructions
    const inx = parsed_data?.transaction?.message.instructions

    if (inner_inx) {
      for (const in_inx of inner_inx) {
        for (const inx of in_inx.instructions) {
          if ('data' in inx && 'accounts' in inx) {
            const tokenData = DepositLayout.decode(Buffer.from(base58.decode(inx.data)));
            const sol_amount = Number(tokenData.amountIn.toString()) / LAMPORTS_PER_SOL;
            const accounts_list = inx.accounts.map(acc => acc.toString())
            const openbook_index = accounts_list.indexOf(MAINNET_PROGRAM_ID.OPENBOOK_MARKET.toString())
            const market_id = accounts_list[openbook_index + 1].toString()
            // console.log('inner_inx', market_id, signer, sol_amount, signature)
            await handle_spammers(market_id, signer, sol_amount, signature)
            return
          }
        }
      }
    }
    if (inx) {
      for (const in_inx of inx) {
        if ('data' in in_inx && 'accounts' in in_inx && in_inx.accounts.length == 18) {
          const tokenData = DepositLayout.decode(Buffer.from(base58.decode(in_inx.data)));
          const sol_amount = Number(tokenData.amountIn.toString()) / LAMPORTS_PER_SOL;
          const accounts_list = in_inx.accounts.map(acc => acc.toString())
          const openbook_index = accounts_list.indexOf(MAINNET_PROGRAM_ID.OPENBOOK_MARKET.toString())
          const market_id = accounts_list[openbook_index + 1].toString()
          // console.log('inx', market_id, signer, sol_amount, signature)
          await handle_spammers(market_id, signer, sol_amount, signature)
          return
        }
      }
    }
  } catch (e) {
    console.error(e)
  }
}

const handle_spammers = async (market_id: string, signer: string, sol_amount: number, signature: string) => {
  // console.log('handle_webhook new_market_list', new_market_list)
  if (new_market_list.includes(market_id)) {
    if (market_id in sniper_list && sniper_list[market_id].some(item => item.address == signer)) return
    // console.log('in', market_id, signer, sol_amount, signature)
    if (market_id in sniper_list) sniper_list[market_id].push({ address: signer, amount: sol_amount })
    else sniper_list[market_id] = [{ address: signer, amount: sol_amount }]
    // console.log('post data', sniper_list[market_id])
    // ------------------------------------
    const { content, image } = await get_market_info(new PublicKey(market_id))
    const snipers = sniper_list[market_id].map(item => `*${JSON.stringify(item)}*`).join('\n')
    const display = content + '**Spammers**\n' + snipers
    // console.log('display', display)
    for (let i = 0; i < webhookCounts.length - 1; i++) {
      if (sniper_list[market_id].length > webhookCounts[i] && sniper_list[market_id].length <= webhookCounts[i + 1]) {
        if (image) {
          await axios.post(webhook[i], {
            content: display,
            embeds: [{ image: { url: image } }]
          });
        } else {
          await axios.post(webhook[i], {
            content: display,
          });
        }
        return
      }
    }
    if (image) {
      await axios.post(webhook[5], {
        content: display,
        embeds: [{ image: { url: image } }]
      });
    } else {
      await axios.post(webhook[5], {
        content: display,
      });
    }
    // ------------------------------------
  }
}

const get_market_info = async (market_id: PublicKey) => {
  const buffer_data = (await solanaConnection2.getAccountInfo(market_id))?.data!
  const market_data = MARKET_STATE_LAYOUT_V3.decode(buffer_data)
  const baseMint = market_data.baseMint
  const meta = await getMetadata(baseMint);
  const metaData = await Metadata.fromAccountAddress(solanaConnection3, meta);
  const detail = await axios.get(metaData.pretty().data.uri);
  const { name, symbol, description, image, twitter, telegram, discord, website } = detail.data
  let content = `**Name**: ${name}\n**Symbol**: ${symbol}\n`
  if (description) content += `**Description**: ${description}\n`
  if (twitter) content += `**Twitter**: [${twitter.replace('https://', '')}](${twitter})\n`
  if (telegram) content += `**Telegram**: [${telegram.replace('https://', '')}](${telegram})\n`
  if (discord) content += `**Discord**: [${discord.replace('https://', '')}](${discord})\n`
  if (website) content += `**Website**: [${website.replace('https://', '')}](${website})\n`

  const solscan = `https://solscan.io/token/${baseMint}`
  content += `**Solscan Link**: [${solscan.replace('https://', '')}](${solscan})\n`

  const birdeye = `https://birdeye.so/token/${baseMint}?chain=solana`
  content += `**Birdeye Link**: [${birdeye.replace('https://', '')}](${birdeye})\n`

  return { content, image: image ?? '' }
}

const getMetadata = async (mint: PublicKey): Promise<PublicKey> => {
  return (
    await PublicKey.findProgramAddress([Buffer.from('metadata'), METAPLEX.toBuffer(), mint.toBuffer()], METAPLEX)
  )[0];
};
