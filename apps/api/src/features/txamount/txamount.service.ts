import { Inject, Injectable } from '@nestjs/common';
import Web3 from 'web3';
import { endOfDay, format, fromUnixTime, startOfDay } from 'date-fns';

@Injectable()
export class TxamountService {
  public web3: Web3;

  constructor(@Inject('WEB3') public _web3: Web3) {
    this.web3 = _web3;
  }

  // Restituiamo le informazioni solo dei giorni in cui sono avvenute realmente delle transazioni
  // I blocchi senza transazioni non li restituiamo

  async getAllTransactionsAmount() {
    try {
      const latestBlockNumber = await this.web3.eth.getBlockNumber();
      const transactionsByDay: { [key: string]: number } = {};
      for (let i = 0; i <= latestBlockNumber; i++) {
        const block = await this.web3.eth.getBlock(i, true);
        const blockDate = format(fromUnixTime(+block.timestamp), 'yyyy-MM-dd');

        if (block.transactions.length == 0) {
          continue;
        }

        if (!transactionsByDay[blockDate]) {
          transactionsByDay[blockDate] = 0;
        }

        transactionsByDay[blockDate] += block.transactions.length;
      }
      return transactionsByDay;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }

  async getTransactionsList(date: string) {
    try {
      const startTimestamp = startOfDay(date).getTime() / 1000; // Timestamp Unix dell'inizio del giorno
      const endTimestamp = endOfDay(date).getTime() / 1000; // Timestamp Unix della fine del giorno

      let blockNumber = await this.web3.eth.getBlockNumber(); // Ottieni il numero dell'ultimo blocco
      let transactions: any[] = [];

      for (let i = 0; i <= blockNumber; i++) {
        let block = await this.web3.eth.getBlock(i, true); // Ottieni il blocco con transazioni

        if (
          block &&
          +block.timestamp >= startTimestamp &&
          +block.timestamp < endTimestamp
        ) {
          transactions = transactions.concat(block.transactions);
        }
      }
      return transactions;
    } catch (err: any) {
      throw new Error(err.message);
    }
  }
}
