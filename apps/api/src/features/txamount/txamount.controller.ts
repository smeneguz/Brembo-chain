import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { TxamountService } from './txamount.service';
import { CookieGuard } from '../auth/cookie.guard';

@Controller('txamount')
export class TxamountController {
  constructor(private readonly txAmountService: TxamountService) {}

  @Get()
  @UseGuards(CookieGuard)
  async getTotalTransactionsAmount() {
    return await this.txAmountService.getAllTransactionsAmount();
  }

  @Get(':date')
  @UseGuards(CookieGuard)
  async getTotalTransactionsList(@Param('date') date: string) {
    return await this.txAmountService.getTransactionsList(date);
  }
}
